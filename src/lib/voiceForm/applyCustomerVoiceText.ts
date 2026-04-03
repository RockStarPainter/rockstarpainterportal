import axios from 'axios'
import { flushSync } from 'react-dom'
import { toast } from 'react-hot-toast'
import type { InvoiceTypes } from 'src/enums/FormTypes'
import type { Status } from 'src/enums'
import type { UseFormSetFocus, UseFormSetValue } from 'react-hook-form'
import {
  CUSTOMER_FIELD_LABELS,
  normalizeVoiceTypos,
  parseAllCustomerVoiceCommands,
  type CustomerRhfField
} from './parseCustomerVoiceCommands'
import {
  parseIncrementalCustomerVoice,
  splitCorrectionSegments,
  stripTrailingCorrectionRejections,
  trimTextBeforeInvoiceMetaCues
} from './incrementalCustomerVoice'
import {
  type InvoiceMetaLiveState,
  type ParsedInvoiceMeta,
  type WarrantyVoiceValue,
  parseInvoiceMetaFromUtterance,
  parseInvoiceMetaStreaming
} from './parseInvoiceMetaVoice'
import type { VoiceHighlightedField } from './voiceCustomerGroqBridge'

export { createInvoiceMetaLiveState } from './parseInvoiceMetaVoice'
export type { InvoiceMetaLiveState }

const ALLOWED_FIELDS: CustomerRhfField[] = [
  'customer_name',
  'phone_number',
  'email',
  'address',
  'city',
  'state',
  'zip_code'
]

export async function resolveCustomerVoiceCommands(
  rawText: string,
  useLlmFallback: boolean
): Promise<{ field: CustomerRhfField; value: string }[]> {
  const normalized = normalizeVoiceTypos(rawText).trim()
  const customerPart = trimTextBeforeInvoiceMetaCues(normalized)
  const segs = splitCorrectionSegments(customerPart)
  const byField = new Map<CustomerRhfField, string>()
  for (const seg of segs) {
    for (const c of parseAllCustomerVoiceCommands(seg)) {
      const v = stripTrailingCorrectionRejections(c.value, c.field)
      if (v) byField.set(c.field, v)
    }
  }
  let cmds = [...byField.entries()].map(([field, value]) => ({ field, value }))
  if (!cmds.length && useLlmFallback && customerPart.length > 3) {
    try {
      const { data } = await axios.post<{ commands?: { field: string; value: string }[] }>(
        '/api/groq-extract-customer-fields',
        { text: customerPart }
      )
      const list = data.commands || []
      const set = new Set(ALLOWED_FIELDS)
      cmds = list
        .filter(c => c.field && set.has(c.field as CustomerRhfField))
        .map(c => {
          const field = c.field as CustomerRhfField
          const value = stripTrailingCorrectionRejections(String(c.value || '').trim(), field)

          return { field, value }
        })
        .filter(c => c.value)
    } catch {
      /* ignore */
    }
  }

  return cmds
}

export interface ApplyCustomerVoiceOptions {
  setValue: UseFormSetValue<any>
  setFocus?: UseFormSetFocus<any>
  onCustomerFieldsApplied?: (fields: CustomerRhfField[]) => void
  useLlmFallback?: boolean

  /** When false, skip error toast if nothing matched */
  showEmptyToast?: boolean
}

/** Reset per mic session via `createLiveVoiceApplyState()`. */
export interface LiveVoiceApplyState {
  completeSignature: string
  /** Last value written per RHF field — sealed fields stop updating when a new keyword takes over. */
  appliedByField: Partial<Record<CustomerRhfField, string>>
  notifiedFields: Set<CustomerRhfField>
  /** Rightmost field keyword — when it changes, context switches and the previous field is no longer live-updated. */
  lastActiveField: CustomerRhfField | null
}

export function createLiveVoiceApplyState(): LiveVoiceApplyState {
  return {
    completeSignature: '',
    appliedByField: {},
    notifiedFields: new Set(),
    lastActiveField: null
  }
}

/**
 * Synchronous apply from streaming speech (Web Speech interim/final chunks).
 * Smart switching: a new field keyword seals earlier fields and becomes the only streaming target.
 * @returns true if the form or focus was updated (caller may clear voice transcript).
 */
export function applyIncrementalCustomerVoiceForm(
  combined: string,
  opts: Pick<ApplyCustomerVoiceOptions, 'setValue' | 'setFocus' | 'onCustomerFieldsApplied'>,
  state: LiveVoiceApplyState
): boolean {
  const parsed = parseIncrementalCustomerVoice(combined)
  const highlightFields = new Set<CustomerRhfField>()
  let wrote = false

  const sig = JSON.stringify(parsed.completeCommands)
  if (sig !== state.completeSignature) {
    state.completeSignature = sig
    for (const c of parsed.completeCommands) {
      if (!c.value) continue
      if (state.appliedByField[c.field] === c.value) continue
      state.appliedByField[c.field] = c.value
      flushSync(() => {
        opts.setValue(c.field as any, c.value, { shouldDirty: true, shouldTouch: true })
      })
      wrote = true
      opts.setFocus?.(c.field as any)
      if (!state.notifiedFields.has(c.field)) {
        state.notifiedFields.add(c.field)
        highlightFields.add(c.field)
      }
    }
  }

  for (const s of parsed.sealedFields) {
    if (!s.value) continue
    if (state.appliedByField[s.field] === s.value) continue
    state.appliedByField[s.field] = s.value
    flushSync(() => {
      opts.setValue(s.field as any, s.value, { shouldDirty: true, shouldTouch: true })
    })
    wrote = true
    opts.setFocus?.(s.field as any)
    if (!state.notifiedFields.has(s.field)) {
      state.notifiedFields.add(s.field)
      highlightFields.add(s.field)
    }
  }

  if (parsed.activeField != null) {
    const switched = parsed.activeField !== state.lastActiveField
    if (switched) {
      state.lastActiveField = parsed.activeField
      opts.setFocus?.(parsed.activeField as any)
      highlightFields.add(parsed.activeField)
      if (parsed.activeValue.length === 0) wrote = true
    }
    if (parsed.activeValue.length > 0) {
      if (state.appliedByField[parsed.activeField] !== parsed.activeValue) {
        state.appliedByField[parsed.activeField] = parsed.activeValue
        flushSync(() => {
          opts.setValue(parsed.activeField as any, parsed.activeValue, {
            shouldDirty: true,
            shouldTouch: true
          })
        })
        wrote = true
        opts.setFocus?.(parsed.activeField as any)
        if (!state.notifiedFields.has(parsed.activeField)) {
          state.notifiedFields.add(parsed.activeField)
          highlightFields.add(parsed.activeField)
        }
      }
    }
  } else if (parsed.phase === 'prepare' && parsed.focusField) {
    if (parsed.focusField !== state.lastActiveField) {
      state.lastActiveField = parsed.focusField
      opts.setFocus?.(parsed.focusField as any)
      highlightFields.add(parsed.focusField)
      wrote = true
    } else {
      opts.setFocus?.(parsed.focusField as any)
    }
  }

  if (highlightFields.size) {
    opts.onCustomerFieldsApplied?.([...highlightFields])
  }

  return wrote || highlightFields.size > 0
}

export type InvoiceMetaApplyOpts = {
  setValue: UseFormSetValue<any>
  setFocus?: UseFormSetFocus<any>
  setInvoiceStatus?: (status: Status) => void
  /** Focus the status &lt;Select&gt; in the DOM (RHF setFocus does not cover it). */
  focusInvoiceStatus?: () => void
  setInvoiceType?: (t: InvoiceTypes) => void
  setWarrantyType?: (t: WarrantyVoiceValue) => void
  focusInvoiceService?: () => void
  focusInvoiceWarranty?: () => void
  onHighlight?: (paths: VoiceHighlightedField[]) => void
}

/** @returns true if date or status was applied (caller may clear voice transcript). */
export function applyInvoiceMetaParsed(
  meta: ParsedInvoiceMeta,
  opts: InvoiceMetaApplyOpts,
  state: InvoiceMetaLiveState
): boolean {
  const paths: VoiceHighlightedField[] = []
  if (meta.issueDate && meta.issueDateIso) {
    if (meta.issueDateIso !== state.lastIssueDateIso) {
      state.lastIssueDateIso = meta.issueDateIso
      flushSync(() => {
        opts.setValue('issue_date' as any, meta.issueDate, { shouldDirty: true, shouldTouch: true })
      })
      opts.setFocus?.('issue_date' as any)
      paths.push('issue_date')
    }
  }
  if (meta.status != null && meta.status !== state.lastStatus) {
    state.lastStatus = meta.status
    opts.setInvoiceStatus?.(meta.status)
    opts.focusInvoiceStatus?.()
    paths.push('invoice_status')
  }
  if (meta.invoiceType != null && meta.invoiceType !== state.lastInvoiceType) {
    state.lastInvoiceType = meta.invoiceType
    opts.setInvoiceType?.(meta.invoiceType)
    opts.focusInvoiceService?.()
    paths.push('invoice_service')
  }
  if (meta.warrantyType != null && meta.warrantyType !== state.lastWarrantyType) {
    state.lastWarrantyType = meta.warrantyType
    opts.setWarrantyType?.(meta.warrantyType)
    opts.focusInvoiceWarranty?.()
    paths.push('invoice_warranty')
  }
  if (paths.length) opts.onHighlight?.(paths)

  return paths.length > 0
}

export function applyIncrementalInvoiceMetaForm(
  combined: string,
  opts: InvoiceMetaApplyOpts,
  state: InvoiceMetaLiveState
): boolean {
  const meta = parseInvoiceMetaStreaming(combined, state)

  return applyInvoiceMetaParsed(meta, opts, state)
}

/** After Groq / transcript: always write parsed meta (no streaming dedupe). */
export function applyInvoiceMetaFromTextFinal(text: string, opts: InvoiceMetaApplyOpts): void {
  const meta = parseInvoiceMetaFromUtterance(text)
  const paths: VoiceHighlightedField[] = []
  if (meta.issueDate) {
    flushSync(() => {
      opts.setValue('issue_date' as any, meta.issueDate, { shouldDirty: true, shouldTouch: true })
    })
    opts.setFocus?.('issue_date' as any)
    paths.push('issue_date')
  }
  if (meta.status != null) {
    opts.setInvoiceStatus?.(meta.status)
    opts.focusInvoiceStatus?.()
    paths.push('invoice_status')
  }
  if (meta.invoiceType != null) {
    opts.setInvoiceType?.(meta.invoiceType)
    opts.focusInvoiceService?.()
    paths.push('invoice_service')
  }
  if (meta.warrantyType != null) {
    opts.setWarrantyType?.(meta.warrantyType)
    opts.focusInvoiceWarranty?.()
    paths.push('invoice_warranty')
  }
  if (paths.length) opts.onHighlight?.(paths)
}

/**
 * Parses text and writes customer RHF fields; toasts per field. Returns whether any field was set.
 */
export async function applyCustomerVoiceText(
  raw: string,
  opts: ApplyCustomerVoiceOptions
): Promise<boolean> {
  const trimmed = raw.trim()
  if (!trimmed) return false

  const useLlm = opts.useLlmFallback !== false
  const cmds = await resolveCustomerVoiceCommands(trimmed, useLlm)
  if (!cmds.length) {
    const metaOnly = parseInvoiceMetaFromUtterance(trimmed)
    const hadInvoiceMeta = Boolean(
      metaOnly.issueDate ||
        metaOnly.status != null ||
        metaOnly.invoiceType != null ||
        metaOnly.warrantyType != null
    )
    if (!hadInvoiceMeta && opts.showEmptyToast !== false) {
      toast.error('Could not match any customer fields. Try: "Customer name John, phone 555-123-4567".')
    }

    return false
  }

  const fields: CustomerRhfField[] = []
  for (const { field, value } of cmds) {
    flushSync(() => {
      opts.setValue(field as any, value, { shouldDirty: true, shouldTouch: true })
    })
    fields.push(field)
    opts.setFocus?.(field as any)
  }
  opts.onCustomerFieldsApplied?.(fields)

  const labels = cmds.map(c => CUSTOMER_FIELD_LABELS[c.field]).join(', ')
  toast.success(cmds.length === 1 ? `${labels} filled` : `Filled: ${labels}`)

  return true
}
