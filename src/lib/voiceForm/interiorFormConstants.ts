/** Shared INTERIOR paint-code matrix labels and aliases (CreateInvoice + voice intent). */

export const INTERIOR_PAINT_CODE_HEADERS = ['WALL', 'CEILING', 'CLOSET', 'DOOR', 'BASEBOARD'] as const

export const INTERIOR_ROOMS: readonly string[] = [
  'OFFICE/STUDY',
  'LIVING ROOM',
  'ENTRY',
  'HALLWAY',
  'KITCHEN',
  'MASTER BED',
  'MASTER BATH',
  'BEDROOM A',
  'BEDROOM B',
  'BATHROOM B',
  'BEDROOM C',
  'LAUNDRY ROOM',
  'BASEMENT',
  'REPAIR',
  'DRY WALL',
  'BUILT-IN BOOK SHELVES',
  'CABINETS',
  'POWDER BATHROOM'
]

/** Spoken / shorthand → column index 1..5 (matches parseVoiceIntent + Controller names). */
export const INTERIOR_SURFACES: Record<string, number> = {
  wall: 1,
  walls: 1,
  ceiling: 2,
  closet: 3,
  door: 4,
  baseboard: 5,
  baseboards: 5
}

export const INTERIOR_ROOM_ALIASES: Record<string, string> = {
  office: 'OFFICE/STUDY',
  study: 'OFFICE/STUDY',
  'office study': 'OFFICE/STUDY',
  'office/study': 'OFFICE/STUDY',
  'living room': 'LIVING ROOM',
  lr: 'LIVING ROOM',
  entry: 'ENTRY',
  hallway: 'HALLWAY',
  hall: 'HALLWAY',
  kitchen: 'KITCHEN',
  'master bed': 'MASTER BED',
  'master bedroom': 'MASTER BED',
  'master bath': 'MASTER BATH',
  'bedroom a': 'BEDROOM A',
  'bedroom b': 'BEDROOM B',
  'bedroom c': 'BEDROOM C',
  'bathroom b': 'BATHROOM B',
  'laundry room': 'LAUNDRY ROOM',
  laundry: 'LAUNDRY ROOM',
  basement: 'BASEMENT',
  repair: 'REPAIR',
  repairs: 'REPAIR',
  'dry wall': 'DRY WALL',
  drywall: 'DRY WALL',
  'built-in book shelves': 'BUILT-IN BOOK SHELVES',
  'built-in shelves': 'BUILT-IN BOOK SHELVES',
  'built in shelves': 'BUILT-IN BOOK SHELVES',
  'built in book shelves': 'BUILT-IN BOOK SHELVES',
  cabinets: 'CABINETS',
  cabinet: 'CABINETS',
  'powder bathroom': 'POWDER BATHROOM',
  'powder room': 'POWDER BATHROOM'
}

export function interiorMatrixPath(rowIndex: number, col1To5: number): string {
  return `interiorRows.row-${rowIndex}-col-${col1To5}`
}

/** Resolve a spoken room phrase to the canonical row label, or null. */
export function resolveInteriorRoomPhraseToCanonical(phrase: string): string | null {
  const t = phrase.trim().toLowerCase()
  if (INTERIOR_ROOM_ALIASES[t]) return INTERIOR_ROOM_ALIASES[t]
  const exact = INTERIOR_ROOMS.find(r => r.toLowerCase() === t)

  return exact ?? null
}

export function interiorRoomCanonicalToRowIndex(canonical: string): number {
  return INTERIOR_ROOMS.indexOf(canonical)
}

export type InteriorSurfaceKey = 'wall' | 'ceiling' | 'closet' | 'door' | 'baseboard'

export function interiorSurfaceKeyToCol(key: InteriorSurfaceKey): number {
  const map: Record<InteriorSurfaceKey, number> = {
    wall: 1,
    ceiling: 2,
    closet: 3,
    door: 4,
    baseboard: 5
  }

  return map[key]
}
