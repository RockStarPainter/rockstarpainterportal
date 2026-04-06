/**
 * Real-time voice: detect correction intent and rewrite utterances so parseVoiceIntentText
 * picks the intended value (last/correct mention, not the wrong tail).
 */

import type { VoiceIntentUpdate } from 'src/types/voiceIntent'

const CORRECTION_RE =
  /\b(no|not|incorrect|wrong|sorry|change|actually|i mean|it's not|it is not|that'?s wrong)\b/i

export function isCorrectionIntent(text: string): boolean {
  return CORRECTION_RE.test(text)
}

/**
 * When the user is correcting, produce a shorter string biased toward the right value.
 */
export function preprocessVoiceForRealtimeIntent(raw: string): string {
  const s = raw.replace(/\s+/g, ' ').trim()
  if (!s) return s

  let m: RegExpMatchArray | null

  m = s.match(/\bchange\s+(?:the\s+)?(?:customer\s+name|client\s+name|name)\s+to\s+(.+?)(?:\s+(?:phone|email|address|city|state|zip|mobile)\b|$)/i)
  if (m) return `customer name ${m[1].trim()}`

  m = s.match(/\bchange\s+(?:the\s+)?(?:phone|phone\s+number|mobile)\s+to\s+([\d\s\-().+]+?)(?:\s+(?:email|address|customer|name)\b|$)/i)
  if (m) return `phone number ${m[1].trim()}`

  m = s.match(/\bchange\s+(?:the\s+)?(?:email|e-?mail)\s+to\s+(.+?)(?:\s+(?:phone|address|customer|name|city)\b|$)/i)
  if (m) return `email is ${m[1].trim()}`

  m = s.match(/\bchange\s+(?:the\s+)?(?:mailing\s+)?(?:street\s+)?address\s+to\s+(.+?)(?:\s+(?:phone|email|customer|city|state|zip)\b|$)/i)
  if (m) return `address is ${m[1].trim()}`

  m = s.match(/\bsorry\s+(?:customer\s+name|client\s+name|name)\s+is\s+(.+?)(?:\s+\bnot\b|\s+$)/i)
  if (m) return `customer name ${m[1].trim()}`

  m = s.match(/\bno\s+(?:customer\s+name|client\s+name|name)\s+is\s+(.+?)(?:\s+\bnot\b|\s+$)/i)
  if (m) return `customer name ${m[1].trim()}`

  // "customer name is john not zone" → john
  m = s.match(/\b(?:customer\s+name|client\s+name|name)\s+is\s+(.+?)\s+\bnot\b/i)
  if (m) return `customer name ${m[1].trim()}`

  m = s.match(/\bno[, ]+\s*(?:it'?s|it is|the name is|name is)\s+(.+)/i)
  if (m) return `customer name ${m[1].trim()}`

  // "phone is 555 not 444" style
  m = s.match(/\b(?:phone|phone\s+number|mobile)\s+(?:is\s+)?([\d\s\-().+]+?)\s+\bnot\b/i)
  if (m) return `phone number ${m[1].trim()}`

  const parts = s.split(/\bnot\b/i)
  if (parts.length >= 2) {
    const before = parts[0].trim()
    const afterLast = parts[parts.length - 1].trim().replace(/^[,.\s]+/, '')

    if (/\b(?:customer\s+name|client\s+name|name)\b/i.test(before)) {
      const tail = before.replace(/^.*\b(?:customer\s+name|client\s+name|name)\s+/i, '').trim()
      const cleaned = tail.replace(/^(is|are|:)\s*/i, '').trim()
      if (cleaned.length >= 1 && cleaned.length < 80 && !/^(is|are)$/i.test(cleaned)) {
        return `customer name ${cleaned}`
      }
    }

    if (/\b(?:phone|mobile|number)\b/i.test(before)) {
      const digits = afterLast.match(/[\d\s\-().+]{7,}/)
      if (digits) return `phone number ${digits[0].trim()}`
    }

    if (/\b(?:issue|invoice)\s+date\b/i.test(before)) {
      const iso = afterLast.match(/\b(\d{4}-\d{2}-\d{2})\b/)
      if (iso) return `issue date ${iso[1]}`
      const us = afterLast.match(/\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})\b/)
      if (us) {
        let y = us[3]
        if (y.length === 2) y = `${parseInt(y, 10) >= 70 ? '19' : '20'}${y}`

        return `issue date ${us[1]}/${us[2]}/${y}`
      }
    }

    const nameAfterComma = afterLast.match(/^([A-Za-z][A-Za-z\s.'-]{0,60})$/)
    if (nameAfterComma && /\b(?:customer|name)\b/i.test(s)) {
      return `customer name ${nameAfterComma[1].trim()}`
    }
  }

  // Interior work order: compact window correction phrasing
  const winCh = s.match(/\bchange\s+(?:that\s+to\s+)?(yes|no)\s+for\s+window\s+(trim|seal)\b/i)
  if (winCh) {
    const kind = winCh[2].toLowerCase().startsWith('trim') ? 'trim' : 'seal'

    return `${winCh[1]} window ${kind}`
  }

  // "actually no doors in bedroom a" → drop leading filler for re-parse
  if (/\bactually\b/i.test(s) && /\b(bedroom|kitchen|hallway|living|bathroom|window|ceiling|walls?|doors?)\b/i.test(s)) {
    const stripped = s.replace(/^\s*actually\s*,?\s*/i, '').replace(/\bwrong\b/gi, '').trim()

    return stripped.length >= 8 ? stripped : s
  }

  return s
}

export function buildIntentSourceText(liveText: string): { source: string; correction: boolean } {
  const t = liveText.replace(/\s+/g, ' ').trim()
  if (!t) return { source: t, correction: false }
  if (!isCorrectionIntent(t)) return { source: t, correction: false }
  const pre = preprocessVoiceForRealtimeIntent(t)

  return { source: pre.length > 0 ? pre : t, correction: true }
}

function updateKey(u: VoiceIntentUpdate): string | null {
  if (u.target === 'rhf' && u.path) return `rhf:${u.path}`
  if (u.target === 'state' && u.key) return `state:${u.key}`

  return null
}

/** Preprocessed (corrected) updates overwrite raw updates for the same field. */
export function mergeVoiceIntentUpdates(raw: VoiceIntentUpdate[], corrected: VoiceIntentUpdate[]): VoiceIntentUpdate[] {
  const m = new Map<string, VoiceIntentUpdate>()
  for (const u of raw) {
    const k = updateKey(u)
    if (k) m.set(k, u)
  }
  for (const u of corrected) {
    const k = updateKey(u)
    if (k) m.set(k, u)
  }

  return [...m.values()]
}
