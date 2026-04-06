/**
 * Interior Customer Form Implementation — Step 1: field map.
 * RHF paths match CreateInvoice.tsx (flat dotted names).
 */

import { INTERIOR_PAINT_CODE_HEADERS, INTERIOR_ROOMS } from 'src/lib/voiceForm/interiorFormConstants'

export const INTERIOR_AGENT_TASK_LABEL = 'Interior Customer Form Implementation' as const

export type InteriorFieldKind = 'checkbox' | 'textarea' | 'text' | 'select' | 'date' | 'number'

export interface InteriorFieldMapEntry {
  path: string
  kind: InteriorFieldKind
  label: string
  required: boolean

  /** Human-readable dependency notes (UI does not enforce paint-type → finish rules yet). */
  dependsOnDescription?: string
  allowedValuesDescription?: string
}

/** Customer / invoice header fields often filled together with interior scope. */
export const INTERIOR_AGENT_CUSTOMER_FIELDS: InteriorFieldMapEntry[] = [
  { path: 'customer_name', kind: 'text', label: 'Customer name', required: false },
  { path: 'phone_number', kind: 'text', label: 'Phone', required: false },
  { path: 'email', kind: 'text', label: 'Email', required: false },
  { path: 'address', kind: 'text', label: 'Address', required: false },
  { path: 'city', kind: 'text', label: 'City', required: false },
  { path: 'state', kind: 'text', label: 'State', required: false },
  { path: 'zip_code', kind: 'text', label: 'ZIP', required: false },
  { path: 'notes', kind: 'textarea', label: 'Notes', required: false }
]

export const INTERIOR_AGENT_TEXT_FIELDS: InteriorFieldMapEntry[] = [
  {
    path: 'interiorData.paint_textarea',
    kind: 'textarea',
    label: 'Paint (interior)',
    required: false,
    dependsOnDescription: 'Relevant when paint work is in scope; may correlate with matrix WALL/CEILING/etc.'
  },
  {
    path: 'interiorData.stain_textarea',
    kind: 'textarea',
    label: 'Stain (interior)',
    required: false,
    dependsOnDescription: 'Often relevant when DOOR/CABINET wood stain is in scope.'
  }
]

/** YES/NO per row: mutually exclusive (agent must clear opposite checkbox). */
export const INTERIOR_WINDOW_FIELD_PATHS = {
  trimYes: 'interiorData.window.row-0-col-2',
  trimNo: 'interiorData.window.row-0-col-3',
  sealYes: 'interiorData.window.row-1-col-2',
  sealNo: 'interiorData.window.row-1-col-3'
} as const

export const INTERIOR_AGENT_WINDOW_FIELDS: InteriorFieldMapEntry[] = [
  {
    path: INTERIOR_WINDOW_FIELD_PATHS.trimYes,
    kind: 'checkbox',
    label: 'Window trim — YES',
    required: false,
    dependsOnDescription: 'Mutually exclusive with trim NO'
  },
  {
    path: INTERIOR_WINDOW_FIELD_PATHS.trimNo,
    kind: 'checkbox',
    label: 'Window trim — NO',
    required: false,
    dependsOnDescription: 'Mutually exclusive with trim YES'
  },
  {
    path: INTERIOR_WINDOW_FIELD_PATHS.sealYes,
    kind: 'checkbox',
    label: 'Window seal — YES',
    required: false,
    dependsOnDescription: 'Mutually exclusive with seal NO'
  },
  {
    path: INTERIOR_WINDOW_FIELD_PATHS.sealNo,
    kind: 'checkbox',
    label: 'Window seal — NO',
    required: false,
    dependsOnDescription: 'Mutually exclusive with seal YES'
  }
]

export type InteriorExtraKey =
  | 'paint'
  | 'patch_cracks'
  | 'primer'
  | 'apply_primer'
  | 'paper'
  | 'caulking'
  | 'plastic'
  | 'stain'
  | 'tape'

const EXTRA_LABELS: Record<InteriorExtraKey, string> = {
  paint: 'Extras — Paint',
  patch_cracks: 'Extras — Patch cracks',
  primer: 'Extras — Primer',
  apply_primer: 'Extras — Apply primer',
  paper: 'Extras — Paper',
  caulking: 'Extras — Caulking',
  plastic: 'Extras — Plastic',
  stain: 'Extras — Stain',
  tape: 'Extras — Tape'
}

export function interiorExtraPath(key: InteriorExtraKey): string {
  return `interiorData.extras.${key}`
}

export const INTERIOR_AGENT_EXTRAS_FIELDS: InteriorFieldMapEntry[] = (Object.keys(EXTRA_LABELS) as InteriorExtraKey[]).map(
  key => ({
    path: interiorExtraPath(key),
    kind: 'checkbox' as const,
    label: EXTRA_LABELS[key],
    required: false
  })
)

/** Matrix: 18 rows × 5 columns; path template interiorRows.row-{i}-col-{1..5}. */
export function buildInteriorPaintCodeFieldSummary(): {
  pathTemplate: string
  rows: readonly string[]
  columns: readonly string[]
  cellKind: InteriorFieldKind
  required: boolean
} {
  return {
    pathTemplate: 'interiorRows.row-{rowIndex}-col-{1|2|3|4|5}',
    rows: INTERIOR_ROOMS,
    columns: INTERIOR_PAINT_CODE_HEADERS,
    cellKind: 'checkbox',
    required: false
  }
}

/** Flat list for tools / LLM context (window + extras + text + customer; matrix described separately). */
export function getInteriorAgentFlatFieldMap(): InteriorFieldMapEntry[] {
  return [
    ...INTERIOR_AGENT_CUSTOMER_FIELDS,
    ...INTERIOR_AGENT_TEXT_FIELDS,
    ...INTERIOR_AGENT_WINDOW_FIELDS,
    ...INTERIOR_AGENT_EXTRAS_FIELDS
  ]
}
