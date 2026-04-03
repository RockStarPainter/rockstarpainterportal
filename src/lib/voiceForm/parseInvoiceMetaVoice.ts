/**
 * Real-time issue date, status, service (invoice type), and warranty parsing for voice (streaming + corrections).
 */

import { InvoiceTypes } from 'src/enums/FormTypes'
import { Status } from 'src/enums'
import { normalizeVoiceTypos } from './parseCustomerVoiceCommands'
import { splitCorrectionSegments } from './incrementalCustomerVoice'

export type WarrantyVoiceValue = 'None' | 'Interior' | 'Exterior' | 'Both'

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

const MONTH_ALT = Object.keys(MONTH_NAME_TO_INDEX)
  .sort((a, b) => b.length - a.length)
  .join('|')

/** Longer / disambiguating phrases first (e.g. "not paid" before "paid"). */
const STATUS_ORDER: { status: Status; phrases: string[] }[] = [
  { status: Status.UNPAID, phrases: ['not paid', 'unpaid', 'pending'] },
  { status: Status.CANCELLED, phrases: ['cancelled', 'canceled', 'void'] },
  { status: Status.PAID, phrases: ['completed', 'done', 'paid'] }
]

const SET_DATE_TO = /\bset\s+date\s+to\b/i
const STATUS_KEYWORD = /\b(?:status|set\s+status|mark\s+(?:as|it))\b/i

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function isValidYmd(y: number, m0: number, day: number): boolean {
  const dt = new Date(y, m0, day)

  return dt.getFullYear() === y && dt.getMonth() === m0 && dt.getDate() === day
}

function dateToIsoLocal(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')

  return `${y}-${m}-${day}`
}

/** US-style M/D/Y (matches DatePicker MM/DD/YYYY). */
function tryParseUsSlash(s: string): Date | null {
  const m = s.match(/\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})\b/)
  if (!m) return null
  let y = parseInt(m[3], 10)
  if (y < 100) y += y >= 70 ? 1900 : 2000
  const mo = parseInt(m[1], 10) - 1
  const day = parseInt(m[2], 10)
  if (mo < 0 || mo > 11 || day < 1 || day > 31) return null
  if (!isValidYmd(y, mo, day)) return null

  return startOfLocalDay(new Date(y, mo, day))
}

function tryParseIsoYmd(s: string): Date | null {
  const m = s.match(/\b(\d{4})-(\d{2})-(\d{2})\b/)
  if (!m) return null
  const y = parseInt(m[1], 10)
  const mo = parseInt(m[2], 10) - 1
  const day = parseInt(m[3], 10)
  if (!isValidYmd(y, mo, day)) return null

  return startOfLocalDay(new Date(y, mo, day))
}

function tryParseMonthDayYear(s: string): Date | null {
  let m = s.match(
    new RegExp(
      `\\b(${MONTH_ALT})\\s+(\\d{1,2})(?:st|nd|rd|th)?,?\\s*(\\d{4})\\b`,
      'i'
    )
  )
  if (m) {
    const mi = MONTH_NAME_TO_INDEX[m[1].toLowerCase()]
    if (mi == null) return null
    const day = parseInt(m[2], 10)
    const y = parseInt(m[3], 10)
    if (!isValidYmd(y, mi, day)) return null

    return startOfLocalDay(new Date(y, mi, day))
  }

  m = s.match(
    new RegExp(
      `\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(?:of\\s+)?(${MONTH_ALT})\\s*,?\\s*(\\d{4})\\b`,
      'i'
    )
  )
  if (m) {
    const day = parseInt(m[1], 10)
    const mi = MONTH_NAME_TO_INDEX[m[2].toLowerCase()]
    if (mi == null) return null
    const y = parseInt(m[3], 10)
    if (!isValidYmd(y, mi, day)) return null

    return startOfLocalDay(new Date(y, mi, day))
  }

  return null
}

function tryParseRelativeDate(s: string): Date | null {
  const t = s.replace(/\s+/g, ' ').trim()
  if (/\b(?:issue|invoice)\s+date\s+today\b/i.test(t) || /\btoday(?:'s)?\s+(?:issue|invoice)?\s*date\b/i.test(t)) {
    return startOfLocalDay(new Date())
  }
  if (/\b(?:issue|invoice)\s+date\s+tomorrow\b/i.test(t) || /\btomorrow(?:'s)?\s+(?:issue|invoice)?\s*date\b/i.test(t)) {
    const n = new Date()
    n.setDate(n.getDate() + 1)

    return startOfLocalDay(n)
  }
  if (/\b(?:issue|invoice)\s+date\s+yesterday\b/i.test(t)) {
    const n = new Date()
    n.setDate(n.getDate() - 1)

    return startOfLocalDay(n)
  }

  return null
}

function firstDateInText(t: string): Date | null {
  const iso = tryParseIsoYmd(t)
  if (iso) return iso
  const us = tryParseUsSlash(t)
  if (us) return us
  const md = tryParseMonthDayYear(t)
  if (md) return md
  const rel = tryParseRelativeDate(t)

  return rel
}

/**
 * Parse date from a correction segment: bare numeric/ISO line, text after date keywords, or relative.
 */
export function extractIssueDateFromSegment(seg: string): Date | null {
  const raw = seg.replace(/\s+/g, ' ').trim()
  if (!raw) return null

  const bareSlash = raw.match(/^\s*(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})\s*$/i)
  if (bareSlash) {
    const d = tryParseUsSlash(raw)
    if (d) return d
  }

  const bareIso = raw.match(/^\s*(\d{4})-(\d{2})-(\d{2})\s*$/i)
  if (bareIso) {
    const d = tryParseIsoYmd(raw)
    if (d) return d
  }

  let d = firstDateInText(raw)
  if (d) return d

  if (SET_DATE_TO.test(raw)) {
    const after = raw.replace(/^.*?\bset\s+date\s+to\b/i, '').trim()
    d = firstDateInText(after)
    if (d) return d
  }

  const afterCue = sliceAfterLastDateCue(raw)
  if (afterCue != null && afterCue.length > 0) {
    d = firstDateInText(afterCue)

    return d
  }

  return null
}

/** Text after the last issue / invoice / standalone “date” cue. */
function sliceAfterLastDateCue(raw: string): string | null {
  let lastEnd = -1
  for (const re of [/\bissue\s+date\b/gi, /\binvoice\s+date\b/gi]) {
    re.lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = re.exec(raw)) !== null) lastEnd = m.index + m[0].length
  }
  if (lastEnd >= 0) return raw.slice(lastEnd).trim()

  lastEnd = -1
  const rd = /\bdate\b/gi
  let m: RegExpExecArray | null
  while ((m = rd.exec(raw)) !== null) lastEnd = m.index + m[0].length
  if (lastEnd < 0) return null

  return raw.slice(lastEnd).trim()
}

export function extractInvoiceStatusFromSegment(seg: string): Status | null {
  const lower = seg.toLowerCase().replace(/\s+/g, ' ').trim()
  if (!lower) return null

  for (const { status, phrases } of STATUS_ORDER) {
    const sorted = [...phrases].sort((a, b) => b.length - a.length)
    for (const p of sorted) {
      if (lower.includes(p)) return status
    }
  }

  return null
}

const INVOICE_TYPE_ROWS: { re: RegExp; value: InvoiceTypes; loose?: boolean }[] = [
  { re: /\binterior\s+with\s+exterior\b/i, value: InvoiceTypes.INTERIOR_WITH_EXTERIOR },
  { re: /\binterior\s+with\s+handyman\b/i, value: InvoiceTypes.INTERIOR_WITH_HANDYMAN },
  { re: /\bexterior\s+with\s+handyman\b/i, value: InvoiceTypes.EXTERIOR_WITH_HANDYMAN },
  {
    re: /\ball\s+services\b|\binterior\s+and\s+exterior\s+and\s+handyman\b/i,
    value: InvoiceTypes.ALL
  },
  {
    re: /\b(?:select\s+service|set\s+service|service\s+type|invoice\s+type|job\s+type)\s+all\b/i,
    value: InvoiceTypes.ALL
  },
  { re: /\bservice\s+all\b|\bset\s+service\s+to\s+all\b/i, value: InvoiceTypes.ALL },
  { re: /\bhandy\s*man\b|\bhandyman\b/i, value: InvoiceTypes.HANDYMAN },
  { re: /\binterior\s+only\b/i, value: InvoiceTypes.INTERIOR },
  { re: /\bexterior\s+only\b/i, value: InvoiceTypes.EXTERIOR },
  { re: /\binterior\b/i, value: InvoiceTypes.INTERIOR, loose: true },
  { re: /\bexterior\b/i, value: InvoiceTypes.EXTERIOR, loose: true }
]

export function extractInvoiceTypeFromSegment(seg: string): InvoiceTypes | null {
  const text = seg.replace(/\s+/g, ' ').trim()
  if (!text) return null

  if (/^\s*all\s*$/i.test(text)) return InvoiceTypes.ALL

  const skipLoose =
    /\bwarranty\b/i.test(text) && !/\b(?:service|job|quote|project)\b/i.test(text)

  for (const row of INVOICE_TYPE_ROWS) {
    if (row.loose && skipLoose) continue
    if (row.re.test(text)) return row.value
  }

  return null
}

export function extractWarrantyFromSegment(seg: string): WarrantyVoiceValue | null {
  const raw = seg.replace(/\s+/g, ' ').trim()
  if (!raw) return null

  const lower = raw.toLowerCase()
  const hasCue = /\bwarranty\b/i.test(raw) || /\badd\s+warranty\b/i.test(raw)

  const bare = raw.match(/^\s*(none|no\s+warranty|interior|exterior|both)\s*$/i)
  if (bare) {
    const w = bare[1]!.toLowerCase().replace(/\s+/g, ' ')
    if (w === 'none' || w === 'no warranty') return 'None'
    if (w === 'interior') return 'Interior'
    if (w === 'exterior') return 'Exterior'
    if (w === 'both') return 'Both'
  }

  if (!hasCue) return null

  if (/\bnone\b|\bno\s+warranty\b/i.test(lower)) return 'None'
  if (/\bboth\b/i.test(lower)) return 'Both'
  if (/\binterior\b/i.test(lower) && /\bexterior\b/i.test(lower)) return 'Both'
  if (/\binterior\b/i.test(lower)) return 'Interior'
  if (/\bexterior\b/i.test(lower)) return 'Exterior'

  return null
}

export interface ParsedInvoiceMeta {
  issueDate: Date | null
  issueDateIso: string | null
  status: Status | null
  invoiceType: InvoiceTypes | null
  warrantyType: WarrantyVoiceValue | null
}

/** Last segment wins per correction keyword split (no / sorry / wrong / incorrect / change). */
export function parseInvoiceMetaFromUtterance(raw: string): ParsedInvoiceMeta {
  const normalized = normalizeVoiceTypos(raw).trim()
  if (!normalized) {
    return {
      issueDate: null,
      issueDateIso: null,
      status: null,
      invoiceType: null,
      warrantyType: null
    }
  }

  const segs = splitCorrectionSegments(normalized)
  let lastDate: Date | null = null
  let lastStatus: Status | null = null
  let lastInvoiceType: InvoiceTypes | null = null
  let lastWarranty: WarrantyVoiceValue | null = null

  for (const seg of segs) {
    const d = extractIssueDateFromSegment(seg)
    if (d) lastDate = d
    const st = extractInvoiceStatusFromSegment(seg)
    if (st) lastStatus = st
    const it = extractInvoiceTypeFromSegment(seg)
    if (it != null) lastInvoiceType = it
    const wt = extractWarrantyFromSegment(seg)
    if (wt != null) lastWarranty = wt
  }

  return {
    issueDate: lastDate,
    issueDateIso: lastDate ? dateToIsoLocal(lastDate) : null,
    status: lastStatus,
    invoiceType: lastInvoiceType,
    warrantyType: lastWarranty
  }
}

export interface InvoiceMetaLiveState {
  lastIssueDateIso: string | null
  lastStatus: Status | null
  lastInvoiceType: InvoiceTypes | null
  lastWarrantyType: WarrantyVoiceValue | null
  /** Awaits a complete date token after “date” / “set date to”. */
  pendingDate: boolean
  /** Awaits status synonym after “status” / “mark as”. */
  pendingStatus: boolean
}

export function createInvoiceMetaLiveState(): InvoiceMetaLiveState {
  return {
    lastIssueDateIso: null,
    lastStatus: null,
    lastInvoiceType: null,
    lastWarrantyType: null,
    pendingDate: false,
    pendingStatus: false
  }
}

function endsAwaitingDate(combined: string): boolean {
  const t = combined.replace(/\s+/g, ' ').trim()
  if (!t) return false

  return (
    /\b(?:issue\s+date|invoice\s+date)\s+(?:is|to|:)?\s*$/i.test(t) ||
    /\b(?:issue\s+date|invoice\s+date)\s*$/i.test(t) ||
    /\bdate\s+(?:is|to|:)?\s*$/i.test(t) ||
    /\bdate\s*$/i.test(t)
  )
}

function endsAwaitingDateSetTo(combined: string): boolean {
  const t = combined.replace(/\s+/g, ' ').trim()

  return SET_DATE_TO.test(t) && /\bset\s+date\s+to\s*$/i.test(t)
}

function endsAwaitingStatus(combined: string): boolean {
  const t = combined.replace(/\s+/g, ' ').trim()

  return (
    STATUS_KEYWORD.test(t) &&
    (/\b(?:status|set\s+status)\s*$/i.test(t) ||
      /\b(?:status|set\s+status)\s+(?:is|to|:)?\s*$/i.test(t) ||
      /\bmark\s+as\s*$/i.test(t) ||
      /\bmark\s+it\s*$/i.test(t))
  )
}

/**
 * Streaming parse: updates pending flags; only returns complete valid dates / unambiguous status.
 */
function phraseAtEnd(haystackLower: string, phrase: string): boolean {
  const esc = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+')

  return new RegExp(`(?:^|\\s)${esc}\\s*$`, 'i').test(haystackLower)
}

export function parseInvoiceMetaStreaming(
  combined: string,
  state: InvoiceMetaLiveState
): ParsedInvoiceMeta {
  const normalized = normalizeVoiceTypos(combined).trim()
  if (!normalized) {
    return {
      issueDate: null,
      issueDateIso: null,
      status: null,
      invoiceType: null,
      warrantyType: null
    }
  }

  const fromFull = parseInvoiceMetaFromUtterance(normalized)
  if (fromFull.issueDate) state.pendingDate = false
  else if (endsAwaitingDate(normalized) || endsAwaitingDateSetTo(normalized)) state.pendingDate = true

  if (fromFull.status) state.pendingStatus = false
  else if (endsAwaitingStatus(normalized)) state.pendingStatus = true

  let issueDate = fromFull.issueDate
  let status = fromFull.status

  if (!issueDate && state.pendingDate) {
    const tail = normalized.trim()
    const d =
      tryParseIsoYmd(tail) ||
      (/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}\s*$/i.test(tail) ? tryParseUsSlash(tail) : null)
    if (d) {
      issueDate = d
      state.pendingDate = false
    }
  }

  if (!status && state.pendingStatus) {
    const lower = normalized.toLowerCase()
    for (const { status: st, phrases } of STATUS_ORDER) {
      for (const p of [...phrases].sort((a, b) => b.length - a.length)) {
        if (phraseAtEnd(lower, p)) {
          status = st
          state.pendingStatus = false
          break
        }
      }
      if (status) break
    }
  }

  return {
    issueDate,
    issueDateIso: issueDate ? dateToIsoLocal(issueDate) : null,
    status,
    invoiceType: fromFull.invoiceType,
    warrantyType: fromFull.warrantyType
  }
}
