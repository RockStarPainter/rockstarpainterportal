/**
 * Shared normalization + validation for customer voice values (streaming + batch).
 */

import type { CustomerRhfField } from './parseCustomerVoiceCommands'

const LEADING_TOKEN = new RegExp(
  '^(' +
    [
      'is',
      'are',
      'was',
      'were',
      'to',
      'the',
      'a',
      'an',
      'of',
      'in',
      'on',
      'at',
      'be',
      'as',
      'um+',
      'uh+',
      'er+',
      'ah+',
      'like',
      'please',
      'okay',
      'ok',
      'yeah',
      'yep',
      'nope',
      'so',
      'well'
    ].join('|') +
    ')\\b\\s*',
  'i'
)

function stripLeadingGlueAndFillerLoop(s: string): string {
  let t = s.trim()
  let prev = ''
  while (t !== prev) {
    prev = t
    t = t.replace(LEADING_TOKEN, '').trim()
    t = t.replace(/^[,;:.\s!]+/, '').trim()
    t = t.replace(/^(?:is|:)\s*/i, '').trim()
  }

  return t
}

/** Remove trailing conversational connectors so values do not spill into the next clause (e.g. "new york and" → "new york"). */
function stripTrailingVoiceConnectorsLoop(s: string): string {
  let t = s.trim()
  let prev = ''
  while (t !== prev) {
    prev = t
    t = t.replace(/\s+(?:and|then|also)\b[\s\S]*$/i, '').trim()
  }

  return t
}

/** Phone: strip only a dangling connector at the end, not digit tails after "and". */
function stripTrailingVoiceConnectorsPhoneLoop(s: string): string {
  let t = s.trim()
  let prev = ''
  while (t !== prev) {
    prev = t
    t = t.replace(/\s+(?:and|then|also)\b\s*$/i, '').trim()
  }

  return t
}

/**
 * Removes rejected tail the user negates, e.g. "john not zone" → "john", "555 not 999" → "555".
 */
export function stripTrailingCorrectionRejections(value: string, field: CustomerRhfField): string {
  let t = value.trim()
  if (!t) return t

  if (field === 'phone_number') {
    while (/\s+not\s+[\d\s\-+().]+$/i.test(t)) {
      t = t.replace(/\s+not\s+[\d\s\-+().]+$/i, '').trim()
    }
  } else if (field === 'zip_code') {
    while (/\s+not\s+[\d\-]+$/i.test(t)) {
      t = t.replace(/\s+not\s+[\d\-]+$/i, '').trim()
    }
  } else {
    while (/\s+not\s+\S+$/i.test(t)) {
      t = t.replace(/\s+not\s+\S+$/i, '').trim()
    }
  }

  while (/\s+(?:wrong|incorrect)\s+\S+$/i.test(t)) {
    t = t.replace(/\s+(?:wrong|incorrect)\s+\S+$/i, '').trim()
  }

  return t
}

/**
 * Normalize a raw segment after a field keyword: leading glue/filler, trailing punctuation,
 * field-specific spacing, then trailing correction phrases.
 */
export function normalizeVoiceCustomerFieldValue(raw: string, field: CustomerRhfField): string {
  let v = stripLeadingGlueAndFillerLoop(raw)
  v = v.replace(/[\s,;]+$/g, '').trim()
  v =
    field === 'phone_number' ? stripTrailingVoiceConnectorsPhoneLoop(v) : stripTrailingVoiceConnectorsLoop(v)
  if (field === 'phone_number') v = v.replace(/\s+/g, ' ')
  v = stripTrailingCorrectionRejections(v, field)

  return v
}

const JUNK_SINGLE_WORD = new Set(
  [
    'is',
    'are',
    'was',
    'were',
    'the',
    'a',
    'an',
    'to',
    'of',
    'in',
    'on',
    'at',
    'be',
    'as',
    'um',
    'uh',
    'er',
    'ah',
    'like',
    'please',
    'okay',
    'ok',
    'yes',
    'no',
    'yeah',
    'yep',
    'nope',
    'hi',
    'hello',
    'hey',
    'and',
    'then',
    'also'
  ].map(w => w.toLowerCase())
)

function digitCount(s: string): number {
  return (s.match(/\d/g) || []).length
}

function alphaLetters(s: string): string {
  return s.replace(/[^a-z]/gi, '')
}

/** Gate before setValue: drop empty, glue-only, or field-invalid junk. */
export function isMeaningfulCustomerVoiceValue(value: string, field: CustomerRhfField): boolean {
  const v = value.trim()
  if (!v) return false

  const words = v.split(/\s+/).filter(Boolean)
  if (words.length === 1) {
    const w = words[0]!.replace(/[^a-z']/gi, '').toLowerCase()
    if (JUNK_SINGLE_WORD.has(w)) return false
  }

  switch (field) {
    case 'phone_number':
      return digitCount(v) >= 7
    case 'zip_code':
      return digitCount(v) >= 3
    case 'email':
      return v.includes('@') && v.length >= 3
    case 'customer_name':
      return /[a-z]/i.test(v) && alphaLetters(v).length >= 1
    case 'state':
      return v.length >= 2
    case 'address':
    case 'city':
    default:
      return v.length >= 2
  }
}
