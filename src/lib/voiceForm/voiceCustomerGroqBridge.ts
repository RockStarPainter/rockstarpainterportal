import type { FormTypes, InvoiceTypes } from 'src/enums/FormTypes'
import type { Status } from 'src/enums'
import type { UseFormGetValues, UseFormSetFocus, UseFormSetValue } from 'react-hook-form'
import type { CustomerRhfField } from './parseCustomerVoiceCommands'
import type { WarrantyVoiceValue } from './parseInvoiceMetaVoice'
import type { InteriorCustomerProfile } from './interiorFormVoiceAgent'

export type VoiceHighlightedField =
  | CustomerRhfField
  | 'issue_date'
  | 'invoice_status'
  | 'invoice_form_type'
  | 'invoice_service'
  | 'invoice_warranty'

export interface VoiceCustomerGroqBridgeValue {
  disabled: boolean
  setValue: UseFormSetValue<any>
  getValues?: UseFormGetValues<any>
  setFocus?: UseFormSetFocus<any>
  onCustomerFieldsApplied?: (fields: VoiceHighlightedField[]) => void

  /** Invoice status `<Select>` is local state — wire for voice “status paid”, etc. */
  setInvoiceStatus?: (status: Status) => void

  /** Move browser focus to the status dropdown after voice updates it. */
  focusInvoiceStatus?: () => void

  /** Invoice / Estimate / Contract — only one active; same as CustomerSection checkboxes. */
  setFormTypeOption?: (t: FormTypes) => void
  setInvoiceType?: (t: InvoiceTypes) => void
  setWarrantyType?: (t: WarrantyVoiceValue) => void
  focusInvoiceService?: () => void
  focusInvoiceWarranty?: () => void
  liveCaption?: boolean
  useLlmFallback?: boolean

  /** Structured interior scope + customer patches (Interior Customer Form Implementation agent). */
  applyInteriorProfile?: (profile: InteriorCustomerProfile) => { ok: boolean; errors: string[] }

  /** After Groq applies parseVoiceIntentText RHF updates (matrix, extras, windows, etc.). */
  onVoiceIntentRhfApplied?: (paths: string[]) => void
}

type Listener = () => void

let snapshot: VoiceCustomerGroqBridgeValue | null = null
const listeners = new Set<Listener>()

/** Create Invoice (or other pages) call this so the bottom FAB can fill the form. Clear on unmount. */
export function registerVoiceCustomerGroq(value: VoiceCustomerGroqBridgeValue | null) {
  snapshot = value
  listeners.forEach(l => l())
}

export function getVoiceCustomerGroq(): VoiceCustomerGroqBridgeValue | null {
  return snapshot
}

export function subscribeVoiceCustomerGroq(listener: Listener): () => void {
  listeners.add(listener)

  return () => listeners.delete(listener)
}
