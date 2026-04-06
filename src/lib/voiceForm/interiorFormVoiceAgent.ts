/**
 * Interior Customer Form Implementation — Steps 2–3: apply profile, validate, audit log.
 */

import type { FieldValues, UseFormGetValues, UseFormSetValue } from 'react-hook-form'
import {
  interiorMatrixPath,
  interiorRoomCanonicalToRowIndex,
  interiorSurfaceKeyToCol,
  resolveInteriorRoomPhraseToCanonical,
  type InteriorSurfaceKey
} from 'src/lib/voiceForm/interiorFormConstants'
import {
  INTERIOR_AGENT_TASK_LABEL,
  INTERIOR_WINDOW_FIELD_PATHS,
  interiorExtraPath,
  type InteriorExtraKey
} from 'src/lib/voiceForm/interiorFormFieldMap'

export { INTERIOR_AGENT_TASK_LABEL }

export type InteriorAgentLogLevel = 'info' | 'warn' | 'error'

export interface InteriorAgentLogEntry {
  ts: number
  level: InteriorAgentLogLevel
  action: string
  detail?: Record<string, unknown>
}

const AUDIT_MAX = 200
const auditLog: InteriorAgentLogEntry[] = []

export function interiorAgentLog(level: InteriorAgentLogLevel, action: string, detail?: Record<string, unknown>): void {
  const entry: InteriorAgentLogEntry = { ts: Date.now(), level, action, detail }
  auditLog.push(entry)
  if (auditLog.length > AUDIT_MAX) auditLog.splice(0, auditLog.length - AUDIT_MAX)
  if (process.env.NODE_ENV !== 'production') {
    const payload = detail ? ` ${JSON.stringify(detail)}` : ''
    console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](`[${INTERIOR_AGENT_TASK_LABEL}] ${action}${payload}`)
  }
}

export function getInteriorAgentAuditLog(): InteriorAgentLogEntry[] {
  return [...auditLog]
}

export function clearInteriorAgentAuditLog(): void {
  auditLog.length = 0
}

export interface InteriorCustomerProfile {
  customer_name?: string
  phone_number?: string
  email?: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
  notes?: string
  paintNotes?: string
  stainNotes?: string

  /** Clears opposite checkbox when set. */
  windowTrim?: 'yes' | 'no' | 'unset'
  windowSeal?: 'yes' | 'no' | 'unset'
  extras?: Partial<Record<InteriorExtraKey, boolean>>

  /** Room phrase or canonical label + surfaces to check. */
  matrixSelections?: Array<{ room: string; surfaces: InteriorSurfaceKey[] }>

  /** When true, clears all interior matrix checkboxes before applying selections. */
  clearMatrixFirst?: boolean
}

export interface InteriorAgentFormAdapter<T extends FieldValues = FieldValues> {
  setValue: UseFormSetValue<T>
  getValues: UseFormGetValues<T>
}

const setOpts = { shouldDirty: true, shouldTouch: true, shouldValidate: false } as const

function setTriStateWindow(
  form: InteriorAgentFormAdapter<FieldValues>,
  yesPath: string,
  noPath: string,
  choice: 'yes' | 'no' | 'unset',
  label: string
): void {
  if (choice === 'unset') return
  if (choice === 'yes') {
    form.setValue(yesPath as any, true, setOpts)
    form.setValue(noPath as any, false, setOpts)
    interiorAgentLog('info', 'window_row_set', { label, choice: 'yes', yesPath, noPath })
  } else {
    form.setValue(yesPath as any, false, setOpts)
    form.setValue(noPath as any, true, setOpts)
    interiorAgentLog('info', 'window_row_set', { label, choice: 'no', yesPath, noPath })
  }
}

/** Enforce YES/NO mutual exclusion for WINDOW TRIM and WINDOW SEAL. */
export function applyInteriorWindowChoices(form: InteriorAgentFormAdapter<FieldValues>, profile: InteriorCustomerProfile): void {
  if (profile.windowTrim) {
    setTriStateWindow(
      form,
      INTERIOR_WINDOW_FIELD_PATHS.trimYes,
      INTERIOR_WINDOW_FIELD_PATHS.trimNo,
      profile.windowTrim,
      'WINDOW TRIM'
    )
  }
  if (profile.windowSeal) {
    setTriStateWindow(
      form,
      INTERIOR_WINDOW_FIELD_PATHS.sealYes,
      INTERIOR_WINDOW_FIELD_PATHS.sealNo,
      profile.windowSeal,
      'WINDOW SEAL'
    )
  }
}

export function validateInteriorWindowRows(getValues: UseFormGetValues<FieldValues>): { ok: boolean; errors: string[] } {
  const errors: string[] = []
  const tY = getValues(INTERIOR_WINDOW_FIELD_PATHS.trimYes as any)
  const tN = getValues(INTERIOR_WINDOW_FIELD_PATHS.trimNo as any)
  const sY = getValues(INTERIOR_WINDOW_FIELD_PATHS.sealYes as any)
  const sN = getValues(INTERIOR_WINDOW_FIELD_PATHS.sealNo as any)
  if (tY && tN) errors.push('Window trim: YES and NO are both selected')
  if (sY && sN) errors.push('Window seal: YES and NO are both selected')

  return { ok: errors.length === 0, errors }
}

export function validateInteriorAgentProfile(profile: InteriorCustomerProfile): { ok: boolean; errors: string[] } {
  const errors: string[] = []
  if (profile.windowTrim && !['yes', 'no', 'unset'].includes(profile.windowTrim)) {
    errors.push('Invalid windowTrim')
  }
  if (profile.windowSeal && !['yes', 'no', 'unset'].includes(profile.windowSeal)) {
    errors.push('Invalid windowSeal')
  }
  if (profile.matrixSelections) {
    for (const sel of profile.matrixSelections) {
      const canonical = resolveInteriorRoomPhraseToCanonical(sel.room)
      if (canonical === null) errors.push(`Unknown interior room: ${sel.room}`)
      else if (interiorRoomCanonicalToRowIndex(canonical) < 0) errors.push(`Room not in matrix: ${canonical}`)
    }
  }

  return { ok: errors.length === 0, errors }
}

function clearInteriorMatrix(form: InteriorAgentFormAdapter<FieldValues>, rowCount: number, colCount: number): void {
  for (let r = 0; r < rowCount; r++) {
    for (let c = 1; c <= colCount; c++) {
      const path = interiorMatrixPath(r, c)
      form.setValue(path as any, false, setOpts)
    }
  }
  interiorAgentLog('info', 'matrix_cleared', { rowCount, colCount })
}

function applyMatrixSelections(form: InteriorAgentFormAdapter<FieldValues>, profile: InteriorCustomerProfile): void {
  if (!profile.matrixSelections?.length) return
  for (const sel of profile.matrixSelections) {
    const canonical = resolveInteriorRoomPhraseToCanonical(sel.room)
    if (!canonical) {
      interiorAgentLog('warn', 'matrix_skip_unknown_room', { room: sel.room })
      continue
    }
    const rowIndex = interiorRoomCanonicalToRowIndex(canonical)
    if (rowIndex < 0) continue
    for (const surf of sel.surfaces) {
      const col = interiorSurfaceKeyToCol(surf)
      const path = interiorMatrixPath(rowIndex, col)
      form.setValue(path as any, true, setOpts)
      interiorAgentLog('info', 'matrix_cell_set', { path, room: canonical, surface: surf })
    }
  }
}

/**
 * Maps structured customer / interior preferences into RHF. Validates profile shape first; optional window row validation after apply.
 */
export function applyInteriorCustomerProfile(
  form: InteriorAgentFormAdapter<FieldValues>,
  profile: InteriorCustomerProfile,
  options?: { matrixRows?: number; matrixCols?: number; runWindowValidation?: boolean }
): { ok: boolean; errors: string[] } {
  const pre = validateInteriorAgentProfile(profile)
  if (!pre.ok) {
    interiorAgentLog('warn', 'profile_validation_failed', { errors: pre.errors })

    return pre
  }

  interiorAgentLog('info', 'apply_profile_start', { task: INTERIOR_AGENT_TASK_LABEL })

  const patch = <K extends keyof InteriorCustomerProfile>(key: K, path: string) => {
    const v = profile[key]
    if (v === undefined || v === '') return
    form.setValue(path as any, v as any, setOpts)
    interiorAgentLog('info', 'field_set', { path })
  }

  patch('customer_name', 'customer_name')
  patch('phone_number', 'phone_number')
  patch('email', 'email')
  patch('address', 'address')
  patch('city', 'city')
  patch('state', 'state')
  patch('zip_code', 'zip_code')
  patch('notes', 'notes')
  patch('paintNotes', 'interiorData.paint_textarea')
  patch('stainNotes', 'interiorData.stain_textarea')

  if (profile.extras) {
    for (const [k, v] of Object.entries(profile.extras) as [InteriorExtraKey, boolean | undefined][]) {
      if (typeof v !== 'boolean') continue
      const path = interiorExtraPath(k)
      form.setValue(path as any, v, setOpts)
      interiorAgentLog('info', 'extra_set', { path, value: v })
    }
  }

  const rows = options?.matrixRows ?? 18
  const cols = options?.matrixCols ?? 5
  if (profile.clearMatrixFirst) clearInteriorMatrix(form, rows, cols)
  applyMatrixSelections(form, profile)
  applyInteriorWindowChoices(form, profile)

  if (options?.runWindowValidation) {
    const w = validateInteriorWindowRows(form.getValues)
    if (!w.ok) interiorAgentLog('warn', 'window_validation_after_apply', { errors: w.errors })
  }

  interiorAgentLog('info', 'apply_profile_complete', {})

  return { ok: true, errors: [] }
}
