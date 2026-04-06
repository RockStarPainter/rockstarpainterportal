/**
 * Customer-detail voice parsing: typo normalization + reuse of parseVoiceIntent rules
 * for RHF paths (customer_name, phone_number, etc.).
 */

import { parseVoiceIntentText } from 'src/lib/voiceIntent/parseVoiceIntent'
import {
  isMeaningfulCustomerVoiceValue,
  normalizeVoiceCustomerFieldValue
} from 'src/lib/voiceForm/voiceCustomerFieldNormalize'

/** RHF field names used in CreateInvoice customer section */
export type CustomerRhfField =
  | 'customer_name'
  | 'phone_number'
  | 'email'
  | 'address'
  | 'city'
  | 'state'
  | 'zip_code'

export interface CustomerVoiceCommand {
  field: CustomerRhfField
  value: string
}

export const CUSTOMER_FIELD_LABELS: Record<CustomerRhfField, string> = {
  customer_name: 'Customer Name',
  phone_number: 'Phone Number',
  email: 'Email',
  address: 'Address',
  city: 'City',
  state: 'State',
  zip_code: 'Zip code'
}

const CUSTOMER_PATHS = new Set<string>([
  'customer_name',
  'phone_number',
  'email',
  'address',
  'city',
  'state',
  'zip_code'
])

/** Common STT glitches → normalized words before intent parsing */
export function normalizeVoiceTypos(s: string): string {
  let t = s.trim()
  const reps: [RegExp, string][] = [
    [/\bnu,mber\b/gi, 'number'],
    [/\bnumbre\b/gi, 'number'],
    [/\bnumbe\s*r\b/gi, 'number'],
    [/\bpho\s*ne\b/gi, 'phone'],
    [/\bph\s*one\b/gi, 'phone'],
    [/\bemai\s*l\b/gi, 'email'],
    [/\be\s*mail\b/gi, 'email'],
    [/\badd\s*ress\b/gi, 'address'],
    [/\bzi\s*p\b/gi, 'zip'],
    [/\bclien\s*t\b/gi, 'client'],
    [/\bcust\s*omer\b/gi, 'customer']
  ]
  for (const [re, rep] of reps) {
    t = t.replace(re, rep)
  }

  return t.replace(/\s+/g, ' ').trim()
}

/**
 * All customer-field commands found in one utterance (e.g. "name John phone 555…").
 */
export function parseAllCustomerVoiceCommands(text: string): CustomerVoiceCommand[] {
  const normalized = normalizeVoiceTypos(text)
  if (!normalized) return []

  const { updates } = parseVoiceIntentText(normalized)
  const out: CustomerVoiceCommand[] = []
  for (const u of updates) {
    if (u.target !== 'rhf' || !u.path || !CUSTOMER_PATHS.has(u.path)) continue
    const field = u.path as CustomerRhfField
    const value = normalizeVoiceCustomerFieldValue(String(u.value ?? '').trim(), field)
    if (!isMeaningfulCustomerVoiceValue(value, field)) continue
    out.push({ field, value })
  }

  return out
}

/**
 * First customer command only (matches the simple parseVoiceInput contract).
 */
export function parseVoiceInput(text: string): { field: CustomerRhfField; value: string } | null {
  const all = parseAllCustomerVoiceCommands(text)

  return all[0] ?? null
}
