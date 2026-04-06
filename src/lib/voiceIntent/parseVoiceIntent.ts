import { InvoiceTypes } from 'src/enums/FormTypes'
import type { VoiceIntentResponse, VoiceIntentUpdate } from 'src/types/voiceIntent'
import { extractFormTypeOptionFromSegment } from 'src/lib/voiceForm/parseInvoiceMetaVoice'
import { parseInteriorVoiceToUpdates } from 'src/lib/voiceIntent/parseInteriorVoiceIntent'

const EXTERIOR_ROWS: string[] = [
  'BODY SIDING',
  'TRIM',
  'FACIAL',
  'SOFFITS',
  'SHUTTERS',
  'GUTTERS',
  'FRONT DOOR',
  'GARAGE DOOR',
  'FENCE',
  'DECK',
  'PORCH',
  'PERGOLA',
  'FOUNDATION',
  'SHED',
  'STUCCO',
  'BRICKS',
  'REPLACE GARAGE WEATHER STRIP'
]

const EXTERIOR_ALIASES: Record<string, string> = {
  siding: 'BODY SIDING',
  'body siding': 'BODY SIDING',
  trim: 'TRIM',
  facial: 'FACIAL',
  soffits: 'SOFFITS',
  shutters: 'SHUTTERS',
  gutters: 'GUTTERS',
  'front door': 'FRONT DOOR',
  'garage door': 'GARAGE DOOR',
  fence: 'FENCE',
  deck: 'DECK',
  porch: 'PORCH',
  pergola: 'PERGOLA',
  foundation: 'FOUNDATION',
  shed: 'SHED',
  stucco: 'STUCCO',
  bricks: 'BRICKS',
  brick: 'BRICKS',
  'weather strip': 'REPLACE GARAGE WEATHER STRIP',
  'garage weather strip': 'REPLACE GARAGE WEATHER STRIP'
}

function pushUnique(updates: VoiceIntentUpdate[], u: VoiceIntentUpdate) {
  const idx = updates.findIndex(
    x =>
      (x.target === 'rhf' && x.path === u.path) || (x.target === 'state' && x.key === u.key)
  )
  if (idx >= 0) updates[idx] = u
  else updates.push(u)
}

function parseMoney(text: string): number | null {
  const m = text.match(/\$?\s*([\d,]+(?:\.\d{1,2})?)/)
  if (!m) return null
  const n = parseFloat(m[1].replace(/,/g, ''))
  
return Number.isFinite(n) ? n : null
}

const MONTH_NAME_TO_INDEX: Record<string, number> = {
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  may: 4,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11,
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  sept: 8,
  oct: 9,
  nov: 10,
  dec: 11
}

/** US-style calendar date for react-datepicker / RHF `issue_date` (local midnight). */
function parseIssueDateFromVoice(text: string): Date | null {
  const t = text.replace(/\s+/g, ' ').trim()
  if (!t) return null

  const startOfLocalDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

  if (/\b(?:issue|invoice)\s+date\s+today\b/i.test(t) || /\btoday(?:'s)?\s+(?:issue|invoice)\s+date\b/i.test(t)) {
    return startOfLocalDay(new Date())
  }
  if (/\b(?:issue|invoice)\s+date\s+tomorrow\b/i.test(t)) {
    const n = new Date()
    n.setDate(n.getDate() + 1)

    return startOfLocalDay(n)
  }
  if (/\b(?:issue|invoice)\s+date\s+yesterday\b/i.test(t)) {
    const n = new Date()
    n.setDate(n.getDate() - 1)

    return startOfLocalDay(n)
  }

  let m = t.match(/\b(?:issue|invoice)\s+date\s*(?:is|:)?\s*(\d{4})-(\d{2})-(\d{2})\b/i)
  if (m) {
    const y = parseInt(m[1], 10)
    const mo = parseInt(m[2], 10) - 1
    const day = parseInt(m[3], 10)
    const dt = new Date(y, mo, day)
    if (dt.getFullYear() === y && dt.getMonth() === mo && dt.getDate() === day) return dt
  }

  m = t.match(/\b(?:issue|invoice)\s+date\s*(?:is|:)?\s*(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})\b/i)
  if (m) {
    let y = parseInt(m[3], 10)
    if (y < 100) y += y >= 70 ? 1900 : 2000
    const mo = parseInt(m[1], 10) - 1
    const day = parseInt(m[2], 10)
    const dt = new Date(y, mo, day)
    if (dt.getFullYear() === y && dt.getMonth() === mo && dt.getDate() === day) return dt
  }

  const monthAlt = Object.keys(MONTH_NAME_TO_INDEX)
    .sort((a, b) => b.length - a.length)
    .join('|')
  m = t.match(
    new RegExp(
      `\\b(?:issue|invoice)\\s+date\\s*(?:is|:)?\\s*(?:the\\s+)?(${monthAlt})\\s+(\\d{1,2})(?:st|nd|rd|th)?,?\\s*(\\d{4})\\b`,
      'i'
    )
  )
  if (m) {
    const mi = MONTH_NAME_TO_INDEX[m[1].toLowerCase()]
    if (mi != null) {
      const day = parseInt(m[2], 10)
      const y = parseInt(m[3], 10)
      const dt = new Date(y, mi, day)
      if (dt.getFullYear() === y && dt.getMonth() === mi && dt.getDate() === day) return dt
    }
  }

  return null
}

function normalize(s: string) {
  return s.replace(/\s+/g, ' ').trim()
}

/**
 * Ends a segment before another contact field or end of string.
 * Do NOT use `[.?]` alone — it matches the dot in `user@gmail.com` and `555.123.4567`.
 */
const CONTACT_SEGMENT_BOUNDARY =
  '(?=\\s+(?:email|e-?mail|phone|phones|mobile|cell|address|city|state|zip|postal|customer|client|name|issue|invoice|ext\\.?|extension)\\b|\\s+and\\s+(?:email|phone|address|city)\\b|[.!?]\\s+|$)'

/** Address line: keyword boundaries only (street names may contain “St.”). */
const ADDRESS_SEGMENT_BOUNDARY =
  '(?=\\s+(?:email|e-?mail|phone|phones|mobile|cell|city|state|zip|postal|customer|client|name|issue|invoice)\\b|\\s+and\\s+(?:email|phone|address|city)\\b|$)'

const EMAIL_TYPED_GLOBAL = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi

function parseSpokenEmailSegment(raw: string): string | null {
  const t = raw.trim().toLowerCase()
  const lit = t.match(/([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/i)
  if (lit) return lit[1]

  const atParts = t.split(/\s+at\s+/i)
  if (atParts.length !== 2) return null

  const normPart = (s: string) =>
    s
      .replace(/\s+underscore\s+/g, '_')
      .replace(/\s+hyphen\s+/g, '-')
      .replace(/\s+dash\s+/g, '-')
      .replace(/\s+dot\s+/g, '.')
      .replace(/\s+/g, '')

  const local = normPart(atParts[0])
  const domain = normPart(atParts[1])
  const s = `${local}@${domain}`
  if (/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(s)) return s

  return null
}

function extractEmailFromVoice(text: string): string | null {
  const kw = text.match(
    new RegExp(
      `\\b(?:email|e-?mail)\\s*(?:is|:)?\\s*(.+?)${CONTACT_SEGMENT_BOUNDARY}`,
      'i'
    )
  )
  if (kw) {
    const raw = kw[1].trim()
    const lit = raw.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i)
    if (lit) return lit[1]

    const spoken = parseSpokenEmailSegment(raw)
    if (spoken) return spoken
  }

  const matches = [...text.matchAll(EMAIL_TYPED_GLOBAL)]
  if (matches.length) return matches[matches.length - 1][1]

  return null
}

function normalizeUsPhoneDigits(digits: string): string | null {
  let d = digits.replace(/\u2212/g, '-').replace(/\D/g, '')
  if (d.length === 11 && d.startsWith('1')) d = d.slice(1)
  if (d.length !== 10) return null

  return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`
}

function extractPhoneFromVoice(text: string): string | null {
  const withBoundary = (body: string) => new RegExp(`${body}${CONTACT_SEGMENT_BOUNDARY}`, 'i')

  const patterns: RegExp[] = [
    withBoundary(
      `\\b(?:phone|telephone|mobile|cell)\\s+number\\s*(?:is|are|:)?\\s*([+\\d(][\\d\\s\\-().]{5,120}?)`
    ),
    withBoundary(
      `(?:(?:work|home|office)\\s+)?\\b(?:phone|telephone|mobile|cell)\\s+number\\s*(?:is|are|:)?\\s*([+\\d(][\\d\\s\\-().]{5,120}?)`
    ),
    withBoundary(
      `(?:(?:work|home|office)\\s+)?\\b(?:phone|mobile|cell)(?:\\s+number)?\\s*(?:is|are|:)?\\s*([+\\d(][\\d\\s\\-().]{5,120}?)`
    ),
    withBoundary(`(?:call|reach)(?:\\s+me)?\\s+at\\s*([+\\d(][\\d\\s\\-().]{5,120}?)`),
    withBoundary(
      `\\bmy\\s+(?:phone\\s+)?number\\s*(?:is|are|:)?\\s*([+\\d(][\\d\\s\\-().]{5,120}?)`
    ),
    withBoundary(`\\b(?:telephone|callback|tel)\\s*(?:is|are|:)?\\s*([+\\d(][\\d\\s\\-().]{5,120}?)`),
    withBoundary(`\\b(?:phone|cell|mobile)\\s*#?\\s*([+\\d(][\\d\\s\\-().]{5,120}?)`),
    /\b(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})\b/,
    /\b(\d{10})\b/
  ]

  for (const re of patterns) {
    const m = text.match(re)
    if (!m || !m[1]) continue
    const formatted = normalizeUsPhoneDigits(m[1])
    if (formatted) return formatted
  }

  return null
}

function extractAddressFromVoice(text: string): string | null {
  const re = new RegExp(
    `\\b(?:mailing\\s+)?(?:street\\s+)?address\\s*(?:is|:)?\\s*(.+?)${ADDRESS_SEGMENT_BOUNDARY}`,
    'i'
  )
  const m = text.match(re)
  if (!m) return null

  let v = normalize(m[1])
  v = v.replace(/\s+(phone|mobile|cell|email|e-?mail|city|state|zip)\s+.+$/i, '').trim()
  if (v.length < 3) return null

  return v
}

export function parseVoiceIntentText(raw: string): VoiceIntentResponse {
  const warnings: string[] = []
  const text = normalize(raw)
  const lower = text.toLowerCase()
  const updates: VoiceIntentUpdate[] = []

  if (!text) {
    return { updates: [], meta: { warnings: ['empty text'] } }
  }

  const emailValue = extractEmailFromVoice(text)
  if (emailValue) {
    pushUnique(updates, {
      target: 'rhf',
      path: 'email',
      value: emailValue,
      confidence: 0.97,
      source: 'rule'
    })
  }

  const phoneValue = extractPhoneFromVoice(text)
  if (phoneValue) {
    pushUnique(updates, {
      target: 'rhf',
      path: 'phone_number',
      value: phoneValue,
      confidence: 0.92,
      source: 'rule'
    })
  }

  const nameStop =
    '(?:\\s+email|\\s+e-?mail|\\s+phone|\\s+mobile|\\s+cell|\\s+address|\\s+city|\\s+state|\\s+zip|\\s+postal|\\s+and\\s|$)'
  let nameMatch = text.match(
    new RegExp(`(?:customer|client)\\s+name\\s*(?:is|:)?\\s*([^.!?\\n]+?)(?=${nameStop})`, 'i')
  )
  if (!nameMatch) {
    nameMatch = text.match(
      new RegExp(`^name\\s*(?:is|:)\\s*([^.!?\\n]+?)(?=${nameStop})`, 'i')
    )
  }
  if (nameMatch) {
    const name = normalize(nameMatch[1]).replace(/\s+and\s+email.*$/i, '')
    if (name.length > 1) {
      pushUnique(updates, {
        target: 'rhf',
        path: 'customer_name',
        value: name,
        confidence: 0.93,
        source: 'rule'
      })
    }
  }

  const addressValue = extractAddressFromVoice(text)
  if (addressValue) {
    pushUnique(updates, {
      target: 'rhf',
      path: 'address',
      value: addressValue,
      confidence: 0.9,
      source: 'rule'
    })
  }
  const city = text.match(/city\s*(?:is|:)?\s*([a-zA-Z\s]+?)(?=(?:\s+state|\s+zip|$|\.))/i)
  if (city) {
    pushUnique(updates, {
      target: 'rhf',
      path: 'city',
      value: normalize(city[1]),
      confidence: 0.9,
      source: 'rule'
    })
  }
  const stateM = text.match(/\bstate\s*(?:is|:)?\s*([a-z]{2}|[a-zA-Z\s]+)/i)
  if (stateM) {
    pushUnique(updates, {
      target: 'rhf',
      path: 'state',
      value: normalize(stateM[1]).toUpperCase().slice(0, 2),
      confidence: 0.85,
      source: 'rule'
    })
  }
  const zipM = text.match(
    /\b(?:zip(?:\s*code)?|postal\s+code)\s*(?:is|:)?\s*(\d{5}(?:-\d{4})?)/i
  )
  if (zipM) {
    pushUnique(updates, {
      target: 'rhf',
      path: 'zip_code',
      value: zipM[1],
      confidence: 0.95,
      source: 'rule'
    })
  }

  const issueDate = parseIssueDateFromVoice(text)
  if (issueDate) {
    pushUnique(updates, {
      target: 'rhf',
      path: 'issue_date',
      value: issueDate,
      confidence: 0.93,
      source: 'rule'
    })
  }

  if (/\btotal\s+cost\b/i.test(text)) {
    const n = parseMoney(text)
    if (n != null) {
      pushUnique(updates, {
        target: 'rhf',
        path: 'total_cost',
        value: String(n),
        confidence: 0.9,
        source: 'rule'
      })
    }
  }
  if (/\bdown\s+payment\b/i.test(text) || /\b50\s*%\s*down\b/i.test(text)) {
    const n = parseMoney(text)
    if (n != null) {
      pushUnique(updates, {
        target: 'rhf',
        path: 'down_payment',
        value: String(n),
        confidence: 0.88,
        source: 'rule'
      })
    }
  }
  if (/\bbalance\b/i.test(text) && /\bdue\b/i.test(text)) {
    const n = parseMoney(text)
    if (n != null) {
      pushUnique(updates, {
        target: 'rhf',
        path: 'balance_due',
        value: String(n),
        confidence: 0.88,
        source: 'rule'
      })
    }
  }
  if (/\bhandy\s*man\b.*\btotal\b/i.test(text) || /\bhandyman\s+total\b/i.test(text)) {
    const n = parseMoney(text)
    if (n != null) {
      pushUnique(updates, {
        target: 'rhf',
        path: 'handyMan_total_cost',
        value: String(n),
        confidence: 0.85,
        source: 'rule'
      })
    }
  }

  const notesM = text.match(/notes?\s*(?:is|are|say|:)?\s*([^.!?\n]+)/i)
  if (notesM) {
    pushUnique(updates, {
      target: 'rhf',
      path: 'notes',
      value: normalize(notesM[1]),
      confidence: 0.88,
      source: 'rule'
    })
  }
  const hmNotes = text.match(/handyman\s+notes?\s*(?:is|are|:)?\s*([^.!?\n]+)/i)
  if (hmNotes) {
    pushUnique(updates, {
      target: 'rhf',
      path: 'handyman_notes',
      value: normalize(hmNotes[1]),
      confidence: 0.88,
      source: 'rule'
    })
  }

  const urlM = text.match(/(https?:\/\/[^\s]+)/i)
  if (urlM && /\bpay(?:ment)?\s*link\b/i.test(text)) {
    pushUnique(updates, {
      target: 'rhf',
      path: 'pay_link',
      value: urlM[1],
      confidence: 0.9,
      source: 'rule'
    })
  }

  const formTypeFromVoice = extractFormTypeOptionFromSegment(text)
  if (formTypeFromVoice != null) {
    pushUnique(updates, {
      target: 'state',
      key: 'selectedOption',
      value: formTypeFromVoice,
      confidence: 0.93,
      source: 'rule'
    })
  }

  const skipLooseInvoiceType = /\bwarranty\b/i.test(text) && !/\b(service|job|quote|project)\b/i.test(text)

  const typePhrases: Array<{ test: RegExp; value: InvoiceTypes; c: number; loose?: boolean }> = [
    { test: /\binterior\s+with\s+exterior\b/i, value: InvoiceTypes.INTERIOR_WITH_EXTERIOR, c: 0.93 },
    { test: /\binterior\s+with\s+handyman\b/i, value: InvoiceTypes.INTERIOR_WITH_HANDYMAN, c: 0.93 },
    { test: /\bexterior\s+with\s+handyman\b/i, value: InvoiceTypes.EXTERIOR_WITH_HANDYMAN, c: 0.93 },
    { test: /\ball\s+services\b|\binterior\s+and\s+exterior\s+and\s+handyman\b/i, value: InvoiceTypes.ALL, c: 0.9 },
    { test: /\bhandy\s*man\b|\bhandyman\b/i, value: InvoiceTypes.HANDYMAN, c: 0.88 },
    { test: /\binterior\s+only\b/i, value: InvoiceTypes.INTERIOR, c: 0.9 },
    { test: /\bexterior\s+only\b/i, value: InvoiceTypes.EXTERIOR, c: 0.9 },
    { test: /\binterior\b/i, value: InvoiceTypes.INTERIOR, c: 0.78, loose: true },
    { test: /\bexterior\b/i, value: InvoiceTypes.EXTERIOR, c: 0.78, loose: true }
  ]
  for (const { test, value, c, loose } of typePhrases) {
    if (loose && skipLooseInvoiceType) continue
    if (test.test(text)) {
      pushUnique(updates, {
        target: 'state',
        key: 'invoiceType',
        value,
        confidence: c,
        source: 'rule'
      })
      break
    }
  }

  if (/\bwarranty\b/i.test(text) || /\badd\s+warranty\b/i.test(text)) {
    if (/\bnone\b|\bno\s+warranty\b/i.test(text)) {
      pushUnique(updates, {
        target: 'state',
        key: 'warrantyType',
        value: 'None',
        confidence: 0.9,
        source: 'rule'
      })
    } else if (/\bboth\b/i.test(text)) {
      pushUnique(updates, {
        target: 'state',
        key: 'warrantyType',
        value: 'Both',
        confidence: 0.88,
        source: 'rule'
      })
    } else if (/\binterior\b/i.test(text) && !/\bexterior\b/i.test(text)) {
      pushUnique(updates, {
        target: 'state',
        key: 'warrantyType',
        value: 'Interior',
        confidence: 0.85,
        source: 'rule'
      })
    } else if (/\bexterior\b/i.test(text) && !/\binterior\b/i.test(text)) {
      pushUnique(updates, {
        target: 'state',
        key: 'warrantyType',
        value: 'Exterior',
        confidence: 0.85,
        source: 'rule'
      })
    }
  }

  for (const u of parseInteriorVoiceToUpdates(text)) {
    pushUnique(updates, u)
  }

  for (const [alias, canonical] of Object.entries(EXTERIOR_ALIASES)) {
    if (!lower.includes(alias)) continue
    const rowIndex = EXTERIOR_ROWS.indexOf(canonical)
    if (rowIndex < 0) continue
    if (/\byes\b|\binclude\b/i.test(lower)) {
      pushUnique(updates, {
        target: 'rhf',
        path: `exteriorRows.row-${rowIndex}-col-1`,
        value: true,
        confidence: 0.84,
        source: 'rule'
      })
    }
    if (/\bno\b|\bexclude\b|\bdon't\b|\bdont\b/i.test(lower)) {
      pushUnique(updates, {
        target: 'rhf',
        path: `exteriorRows.row-${rowIndex}-col-2`,
        value: true,
        confidence: 0.8,
        source: 'rule'
      })
    }
    break
  }

  const sheetsM = text.match(/\bsheets?\s*(?:quantity)?\s*(?:is|:)?\s*(\d+)/i)
  if (sheetsM && /\bdry\s*wall|drywall\b/i.test(lower)) {
    pushUnique(updates, {
      target: 'rhf',
      path: 'newForm.dryWall.sheets',
      value: parseInt(sheetsM[1], 10),
      confidence: 0.9,
      source: 'rule'
    })
  }

  if (/\btile\b/i.test(lower) && /\bremoval\b/i.test(lower)) {
    const yn = /\byes\b|\binclude\b/i.test(lower) ? 'Yes' : /\bno\b/i.test(lower) ? 'No' : null
    if (yn) {
      pushUnique(updates, {
        target: 'rhf',
        path: 'newForm.tile.removal',
        value: yn,
        confidence: 0.85,
        source: 'rule'
      })
    }
  }

  if (updates.length === 0) {
    warnings.push('no rule-based matches; try rephrasing or paste more detail')
  }

  return {
    updates,
    meta: { normalizedText: text, warnings }
  }
}
