import { flushSync } from 'react-dom'
import type { UseFormSetValue } from 'react-hook-form'
import { CUSTOMER_FIELD_LABELS, type CustomerRhfField } from './parseCustomerVoiceCommands'

const KEYS = Object.keys(CUSTOMER_FIELD_LABELS) as CustomerRhfField[]

/** Values of the seven customer voice fields before a voice apply (for undo). */
export type CustomerVoiceSnapshot = Record<CustomerRhfField, string>

export function snapshotCustomerVoiceFields(getValues: () => Record<string, unknown>): CustomerVoiceSnapshot {
  const v = getValues()
  const out = {} as CustomerVoiceSnapshot
  for (const k of KEYS) {
    const val = v[k]
    out[k] = val instanceof Date ? (val as Date).toISOString() : val != null && val !== '' ? String(val) : ''
  }

  return out
}

export function restoreCustomerVoiceFields(setValue: UseFormSetValue<any>, snap: CustomerVoiceSnapshot) {
  for (const k of KEYS) {
    flushSync(() => {
      setValue(k as any, snap[k] ?? '', { shouldDirty: true, shouldTouch: true })
    })
  }
}

export function customerVoiceFieldKeys(): readonly CustomerRhfField[] {
  return KEYS
}
