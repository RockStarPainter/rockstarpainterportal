/**
 * Incremental / streaming parse for customer fields from partial speech (final + interim).
 * Smart field switching: each new field keyword seals the prior field and becomes the only live target.
 */

import { parseAllCustomerVoiceCommands, normalizeVoiceTypos, type CustomerRhfField } from './parseCustomerVoiceCommands'
import { normalizeVoiceCustomerFieldValue } from './voiceCustomerFieldNormalize'

export { stripTrailingCorrectionRejections } from './voiceCustomerFieldNormalize'

export type IncrementalPhase = 'idle' | 'prepare' | 'value'

export interface IncrementalCustomerApply {

  /** Fields from comma / “and” clauses when no multi-trigger match covers the whole string. */
  completeCommands: { field: CustomerRhfField; value: string }[]

  /**
   * Fields whose keyword appears before a later keyword — values are frozen; no further updates.
   */
  sealedFields: { field: CustomerRhfField; value: string }[]

  /** Rightmost detected field — only this one receives streaming value updates after its keyword. */
  activeField: CustomerRhfField | null

  /** Value after the active keyword (may be partial). */
  activeValue: string
  live?: { field: CustomerRhfField; value: string }
  focusField?: CustomerRhfField
  phase: IncrementalPhase
}

const SPLIT = /\s+(?:,|and)\s+|\s*[,;]\s+/i

/** Conversational continuation between field clauses (split only when each part has its own field cue). */
const VOICE_CONNECTOR_SPLIT = /\s*\b(?:and|then|also)\b\s*/i

/**
 * True if this substring is likely a standalone field phrase, not a continuation (e.g. "jane" after "bob and").
 */
const SEGMENT_HAS_FIELD_CUE =
  /\b(?:customer|client)\s+name\b|\b(?:zip\s*code|postal\s*code)\b|\b(?:phone|cell|mobile)(?:\s+number)?\b|\be\s*-?\s*mail\b|\bemail\b|\b(?:mailing\s+)?(?:street\s+)?address\b|\bcity\b|\bstate\b|\bzip\b|\bset\s+city\b|\bset\s+state\b|\b(?:my|the)\s+city\b|\b(?:my|the)\s+state\b|\b(?:i\s+)?live\s+in\b/i

export function splitIntoConnectorClausesIfMultiField(text: string): string[] {
  const t = text.trim()
  if (!t) return []
  const parts = t.split(VOICE_CONNECTOR_SPLIT).map(p => p.trim()).filter(Boolean)
  if (parts.length < 2) return [t]
  if (parts.every(p => SEGMENT_HAS_FIELD_CUE.test(p))) return parts

  return [t]
}

function mergeMultiFieldAcrossConnectorClauses(clauses: string[]): {
  sealedFields: { field: CustomerRhfField; value: string }[]
  activeField: CustomerRhfField | null
  activeValue: string
} {
  const sealedMap = new Map<CustomerRhfField, string>()
  let activeField: CustomerRhfField | null = null
  let activeValue = ''

  for (const clause of clauses) {
    const p = parseMultiFieldVoiceSegments(clause)
    if (!p.activeField && !p.sealedFields.length) continue

    if (activeField && p.activeField && p.activeField !== activeField && activeValue) {
      sealedMap.set(activeField, activeValue)
    }

    for (const sf of p.sealedFields) {
      if (sf.value) sealedMap.set(sf.field, sf.value)
    }

    if (p.activeField) {
      activeField = p.activeField
      activeValue = p.activeValue
    }
  }

  const sealedFields: { field: CustomerRhfField; value: string }[] = []
  for (const [field, value] of sealedMap) {
    if (!value || field === activeField) continue
    sealedFields.push({ field, value })
  }

  return { sealedFields, activeField, activeValue }
}

/** Starts a new correction clause; later clauses overwrite earlier field values. Trailing `not X` in segment values is still stripped separately where needed. */
const CORRECTION_SEGMENT = /\s+(?:no|sorry|wrong|incorrect|change|not)\b[,.\s:!]*/gi

interface TriggerSpec {
  field: CustomerRhfField
  re: RegExp
}

/** Longer / more specific patterns first for same start index. */
const FIELD_TRIGGERS: TriggerSpec[] = [
  { field: 'customer_name', re: /\b(?:customer|client)\s+name\b/gi },
  { field: 'zip_code', re: /\b(?:zip\s*code|postal\s*code)\b/gi },
  { field: 'phone_number', re: /\b(?:phone|cell|mobile)\s+number\b/gi },
  { field: 'phone_number', re: /\b(?:phone|cell|mobile)\b/gi },
  { field: 'email', re: /\be\s*-?\s*mail\b|\bemail\b/gi },
  { field: 'address', re: /\b(?:mailing\s+)?(?:street\s+)?address\b/gi },
  { field: 'city', re: /\bcity\b/gi },
  { field: 'state', re: /\bstate\b/gi },
  { field: 'zip_code', re: /\bzip\b/gi }
]

interface RawMatch {
  s: number
  e: number
  field: CustomerRhfField
}

function collectTriggerMatches(norm: string): RawMatch[] {
  const raw: RawMatch[] = []
  for (const { re, field } of FIELD_TRIGGERS) {
    const r = new RegExp(re.source, re.flags.includes('g') ? re.flags : `${re.flags}g`)
    let m: RegExpExecArray | null
    while ((m = r.exec(norm)) !== null) {
      raw.push({ s: m.index, e: m.index + m[0].length, field })
      if (m[0].length === 0) r.lastIndex++
    }
  }
  raw.sort((a, b) => a.s - b.s || b.e - a.e)

  const merged: RawMatch[] = []
  let pos = 0
  while (true) {
    const eligible = raw.filter(x => x.s >= pos)
    if (!eligible.length) break
    const start = eligible[0]!.s
    const atStart = eligible.filter(x => x.s === start)
    const best = atStart[0]!
    merged.push(best)
    pos = best.e
  }

  return merged
}

/**
 * Byte offset in `customerScope` (typo-normalized, meta-trimmed) to skip on the next parse:
 * start index of the rightmost field keyword when at least two triggers exist (sealed clauses consumed).
 */
export function getCustomerScopeConsumeAdvance(customerScope: string): number {
  const matches = collectTriggerMatches(customerScope.trim())
  if (matches.length < 2) return 0

  return matches[matches.length - 1]!.s
}

/**
 * Customer voice parsing must ignore invoice meta tails so values like zip are not polluted
 * (e.g. "zip 90210 date 04/03/2026" → customer scope stops before "date").
 */
export function trimTextBeforeInvoiceMetaCues(normalized: string): string {
  const t = normalized.trim()
  if (!t) return t
  let cut = t.length
  const patterns = [
    /\b(?:issue\s+date|invoice\s+date)\b/i,
    /\bset\s+date\s+to\b/i,
    /\b(?:status|set\s+status)\b/i,
    /\bmark\s+(?:as|it)\b/i,
    /\bdate\s+(?:is|to|:)?\s*(?:\d{1,2}[\/\-]\d|\d{4}\b)/i,
    /\bdate\s+(?:is|to|:)?\s*(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b/i,
    /\b(?:select\s+service|set\s+service|service\s+type|invoice\s+type|job\s+type|type\s+of\s+service)\b/i,
    /\b(?:add\s+)?warranty\b/i
  ]
  for (const re of patterns) {
    re.lastIndex = 0
    const m = re.exec(t)
    if (m && m.index < cut) cut = m.index
  }

  return t.slice(0, cut).trim()
}

export function stripLeadingCorrectionClauses(s: string): string {
  let t = s.trim()
  let prev = ''
  while (t !== prev) {
    prev = t
    t = t.replace(/^(?:no|sorry|wrong|incorrect|change)\b[,.\s:!]*/i, '').trim()
  }

  return t
}

function cleanSegmentValue(raw: string, field: CustomerRhfField): string {
  return normalizeVoiceCustomerFieldValue(raw, field)
}

export function splitCorrectionSegments(norm: string): string[] {
  const s = stripLeadingCorrectionClauses(norm)
  if (!s) return []
  CORRECTION_SEGMENT.lastIndex = 0
  const parts = s.split(CORRECTION_SEGMENT).map(p => p.trim()).filter(Boolean)

  return parts.length ? parts : [s]
}

/**
 * Scans full text for field keywords left-to-right. Earlier fields stop updating when a later keyword appears.
 * Example: "customer name john phone 1234567" → sealed customer_name "john", active phone_number "1234567".
 */
export function parseMultiFieldVoiceSegments(norm: string): {
  sealedFields: { field: CustomerRhfField; value: string }[]
  activeField: CustomerRhfField | null
  activeValue: string
} {
  const matches = collectTriggerMatches(norm)
  if (!matches.length) {
    return { sealedFields: [], activeField: null, activeValue: '' }
  }

  const sealedFields: { field: CustomerRhfField; value: string }[] = []
  for (let i = 0; i < matches.length - 1; i++) {
    const cur = matches[i]!
    const next = matches[i + 1]!
    const slice = norm.slice(cur.e, next.s)
    const value = cleanSegmentValue(slice, cur.field)
    if (value) sealedFields.push({ field: cur.field, value })
  }

  const last = matches[matches.length - 1]!
  const tailSlice = norm.slice(last.e)
  const activeValue = cleanSegmentValue(tailSlice, last.field)

  return { sealedFields, activeField: last.field, activeValue }
}

/**
 * Applies correction boundaries + negation tails, then merges so the latest clause wins per field.
 */
export function parseMultiFieldVoiceSegmentsWithCorrections(norm: string): {
  sealedFields: { field: CustomerRhfField; value: string }[]
  activeField: CustomerRhfField | null
  activeValue: string
} {
  const trimmed = norm.trim()
  if (!trimmed) return { sealedFields: [], activeField: null, activeValue: '' }

  const segments = splitCorrectionSegments(trimmed)
  const mergedValues = new Map<CustomerRhfField, string>()
  let lastMeaningful: ReturnType<typeof parseMultiFieldVoiceSegments> = {
    sealedFields: [],
    activeField: null,
    activeValue: ''
  }

  for (const seg of segments) {
    const clauses = splitIntoConnectorClausesIfMultiField(seg)
    const p = mergeMultiFieldAcrossConnectorClauses(clauses)
    if (!p.activeField && !p.sealedFields.length) continue

    lastMeaningful = p
    for (const sf of p.sealedFields) {
      if (sf.value) mergedValues.set(sf.field, sf.value)
    }
    if (p.activeField) {
      if (p.activeValue) mergedValues.set(p.activeField, p.activeValue)
    }
  }

  const activeField = lastMeaningful.activeField
  let activeValue =
    activeField != null ? (mergedValues.get(activeField) ?? lastMeaningful.activeValue) : ''

  if (activeField != null && !activeValue && lastMeaningful.activeValue) {
    activeValue = lastMeaningful.activeValue
    mergedValues.set(activeField, activeValue)
  }

  const sealedFields: { field: CustomerRhfField; value: string }[] = []
  for (const [field, value] of mergedValues) {
    if (!value || field === activeField) continue
    sealedFields.push({ field, value })
  }

  return { sealedFields, activeField, activeValue }
}

/** Rightmost field keyword in the string (null if none). */
export function detectActiveCustomerVoiceField(text: string): CustomerRhfField | null {
  const normalized = normalizeVoiceTypos(text).trim()
  if (!normalized) return null
  const customerScope = trimTextBeforeInvoiceMetaCues(normalized)

  return customerScope ? parseMultiFieldVoiceSegmentsWithCorrections(customerScope).activeField : null
}

interface FieldTailSpec {
  field: CustomerRhfField
  lock: RegExp
  prepare: RegExp
}

const TAIL_SPECS: FieldTailSpec[] = [
  {
    field: 'customer_name',
    lock: /\b(?:customer|client)\s+name\s*(?:is|:)?\s*(.*)$/i,
    prepare: /\b(?:customer|client)(?:\s+n(?:a(?:m(?:e)?)?)?)?\s*$/i
  },
  {
    field: 'phone_number',
    lock: /\b(?:phone|cell|mobile)(?:\s+number)?\s*(?:is|#|:)?\s*(\+?[\d\s\-().]*\d[\d\s\-().]*)$/i,
    prepare: /\b(?:phone|cell|mobile)(?:\s+n(?:u(?:m(?:b(?:e(?:r)?)?)?)?)?)?\s*$/i
  },
  {
    field: 'zip_code',
    lock: /\b(?:zip\s*code|postal\s*code|zip)\s*(?:is|:)?\s*(\d[\d\-]*)$/i,
    prepare: /\b(?:zip\s*c(?:o(?:d(?:e)?)?)?|postal|zips?)\s*$/i
  },
  {
    field: 'city',
    lock: /\b(?:my|the)\s+city\s*(?:is|:)?\s*(.+)$/i,
    prepare: /\b(?:my|the)\s+ci(?:t(?:y)?)?\s*$/i
  },
  {
    field: 'city',
    lock: /\bset\s+city\s*(?:to|is|:)?\s*(.+)$/i,
    prepare: /\bset\s+c(?:i(?:t(?:y)?)?)?\s*$/i
  },
  {
    field: 'city',
    lock: /\b(?:i\s+)?live\s+in\s+(.+)$/i,
    prepare: /\b(?:i\s+)?live\s+in\s*$/i
  },
  {
    field: 'email',
    lock: /\be\s*-?\s*mail\s*(?:is|:)?\s*(\S.*)$/i,
    prepare: /\be\s*-?\s*m(?:a(?:i(?:l)?)?)?\s*$/i
  },
  {
    field: 'address',
    lock: /\b(?:mailing\s+)?(?:street\s+)?address\s*(?:is|:)?\s*(.+)$/i,
    prepare: /\b(?:mailing\s+)?(?:street\s+)?a(?:d(?:d(?:r(?:e(?:s(?:s)?)?)?)?)?)?\s*$/i
  },
  {
    field: 'city',
    lock: /\bcity\s*(?:is|:)?\s*(.+)$/i,
    prepare: /\bci(?:t(?:y)?)?\s*$/i
  },
  {
    field: 'state',
    lock: /\b(?:my|the)\s+state\s*(?:is|:)?\s*(.+)$/i,
    prepare: /\b(?:my|the)\s+st(?:a(?:t(?:e)?)?)?\s*$/i
  },
  {
    field: 'state',
    lock: /\bset\s+state\s*(?:to|is|:)?\s*(.+)$/i,
    prepare: /\bset\s+st(?:a(?:t(?:e)?)?)?\s*$/i
  },
  {
    field: 'state',
    lock: /\bstate\s*(?:is|:)?\s*(.+)$/i,
    prepare: /\bst(?:a(?:t(?:e)?)?)?\s*$/i
  }
]

function splitCompletedAndTail(normalized: string): { completed: string; tail: string } {
  const t = normalized.trim()
  if (!t) return { completed: '', tail: '' }

  const parts = t.split(SPLIT).map(p => p.trim()).filter(Boolean)
  if (parts.length <= 1) return { completed: '', tail: t }

  const tail = parts[parts.length - 1]!
  const completed = parts.slice(0, -1).join(', ')

  return { completed, tail }
}

type TailParse = Pick<IncrementalCustomerApply, 'live' | 'focusField' | 'phase'>

function parseTailIncremental(tail: string): TailParse {
  const t = tail.trim()
  if (!t) return { phase: 'idle' }

  const tCorrected = stripLeadingCorrectionClauses(t)

  for (const spec of TAIL_SPECS) {
    const lm = tCorrected.match(spec.lock)
    if (lm) {
      const raw = (lm[1] ?? '').trim()
      const value = cleanSegmentValue(raw, spec.field)

      return {
        phase: value.length > 0 ? 'value' : 'prepare',
        live: { field: spec.field, value },
        focusField: spec.field
      }
    }
  }

  for (const spec of TAIL_SPECS) {
    if (spec.prepare.test(tCorrected)) {
      return { phase: 'prepare', focusField: spec.field }
    }
  }

  return { phase: 'idle' }
}

export interface ParseIncrementalCustomerVoiceOptions {

  /** Skip this many leading characters of typo-normalized, meta-trimmed customer scope (prefix consumption). */
  customerScopeOffset?: number
}

/**
 * Derives field updates from cumulative live caption text (final + interim).
 */
export function parseIncrementalCustomerVoice(
  raw: string,
  options?: ParseIncrementalCustomerVoiceOptions
): IncrementalCustomerApply {
  const normalized = normalizeVoiceTypos(raw).trim()
  if (!normalized) {
    return {
      completeCommands: [],
      sealedFields: [],
      activeField: null,
      activeValue: '',
      phase: 'idle'
    }
  }

  let customerScope = trimTextBeforeInvoiceMetaCues(normalized)
  const off = Math.max(0, options?.customerScopeOffset ?? 0)
  if (off >= customerScope.length) {
    customerScope = ''
  } else if (off > 0) {
    customerScope = customerScope.slice(off)
  }

  const { completed, tail } = splitCompletedAndTail(customerScope)
  const completeCommands =
    completed.length > 0
      ? parseAllCustomerVoiceCommands(completed).map(c => ({ field: c.field, value: c.value }))
      : []

  const multi = parseMultiFieldVoiceSegmentsWithCorrections(customerScope)

  if (multi.activeField != null) {
    const live =
      multi.activeValue.length > 0 ? { field: multi.activeField, value: multi.activeValue } : undefined

    return {
      completeCommands,
      sealedFields: multi.sealedFields,
      activeField: multi.activeField,
      activeValue: multi.activeValue,
      live,
      focusField: multi.activeField,
      phase: multi.activeValue.length > 0 ? 'value' : 'prepare'
    }
  }

  const tailPart = parseTailIncremental(tail)
  const tf = tailPart.live?.field ?? tailPart.focusField ?? null

  return {
    completeCommands,
    sealedFields: [],
    activeField: tf,
    activeValue: tailPart.live?.value ?? '',
    ...tailPart
  }
}
