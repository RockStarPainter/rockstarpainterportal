/**
 * Interior work order: structured NL → RHF paths (windows, extras/services, paint-code matrix).
 * Designed for incremental apply + merge by path with parseVoiceIntent / voiceRealtimePreprocess.
 */

import type { VoiceIntentUpdate } from 'src/types/voiceIntent'
import {
  INTERIOR_ROOM_ALIASES,
  INTERIOR_ROOMS,
  interiorMatrixPath,
  interiorRoomCanonicalToRowIndex,
  interiorSurfaceKeyToCol,
  resolveInteriorRoomPhraseToCanonical,
  type InteriorSurfaceKey
} from 'src/lib/voiceForm/interiorFormConstants'
import {
  INTERIOR_WINDOW_FIELD_PATHS,
  interiorExtraPath,
  type InteriorExtraKey
} from 'src/lib/voiceForm/interiorFormFieldMap'

const CONF = 0.88 as const

export type InteriorWindowLogicalField = 'windowTrim' | 'windowSeal'

export interface InteriorWindowStructuredUpdate {
  field: InteriorWindowLogicalField

  /** true = YES, false = NO */
  value: boolean
}

export interface InteriorServiceStructuredUpdate {
  service: InteriorExtraKey
  value: boolean
}

export interface InteriorRoomStructuredUpdate {

  /** Canonical row label e.g. KITCHEN */
  roomCanonical: string
  surface: InteriorSurfaceKey
  value: boolean
}

export interface InteriorVoiceStructuredResult {
  windowUpdates: InteriorWindowStructuredUpdate[]
  serviceUpdates: InteriorServiceStructuredUpdate[]
  roomUpdates: InteriorRoomStructuredUpdate[]

  /** Free-text interior paint / stain notes when detected */
  paintNotes?: string
  stainNotes?: string
}

/** Spoken fragments → extras key (longest keys first for matching). */
const SERVICE_PHRASE_TO_KEY: { phrase: string; key: InteriorExtraKey }[] = [
  { phrase: 'patch cracks', key: 'patch_cracks' },
  { phrase: 'patch crack', key: 'patch_cracks' },
  { phrase: 'apply primer', key: 'apply_primer' },
  { phrase: 'plastic', key: 'plastic' },
  { phrase: 'caulking', key: 'caulking' },
  { phrase: 'caulk', key: 'caulking' },
  { phrase: 'primer', key: 'primer' },
  { phrase: 'paper', key: 'paper' },
  { phrase: 'tape', key: 'tape' },
  { phrase: 'paint', key: 'paint' },
  { phrase: 'stain', key: 'stain' }
]

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Room sub-phrases for regex alternation (longest first). */
function buildRoomAlternation(): string {
  const phrases = new Set<string>()
  for (const k of Object.keys(INTERIOR_ROOM_ALIASES)) phrases.add(k)
  for (const r of INTERIOR_ROOMS) phrases.add(r.toLowerCase())

  return [...phrases].sort((a, b) => b.length - a.length).map(escapeRe).join('|')
}

const ROOM_ALT = buildRoomAlternation()
const SURF_LIST = 'walls?|ceilings?|ceil(?:ing)?|closets?|doors?|baseboards?|base\\s*board'

function norm(s: string): string {
  return s.replace(/\s+/g, ' ').trim()
}

function splitClauses(text: string): string[] {
  const t = norm(text)
  if (!t) return []
  const chunks = t.split(/\s*[,;]\s*/)
  const out: string[] = []
  for (const ch of chunks) {
    const q = ch.replace(/^\s*and\s+/i, '').trim()
    if (q) out.push(q)
  }

  return out.length ? out : [t]
}

function parseSurfaceTokens(fragment: string): InteriorSurfaceKey[] {
  const raw = norm(fragment).toLowerCase()
  if (!raw) return []
  const parts = raw.split(/\s*,\s*|\s+and\s+/)
  const out: InteriorSurfaceKey[] = []
  for (const p of parts) {
    const pt = p.trim()
    if (/^walls?$/.test(pt)) out.push('wall')
    else if (/^ceilings?$|^ceil$/.test(pt)) out.push('ceiling')
    else if (/^closets?$/.test(pt)) out.push('closet')
    else if (/^doors?$/.test(pt)) out.push('door')
    else if (/^baseboards?$|^base(?:\s*)board$/.test(pt)) out.push('baseboard')
  }

  return [...new Set(out)]
}

function resolveRoom(raw: string): string | null {
  const t = norm(raw).toLowerCase()

  return resolveInteriorRoomPhraseToCanonical(t)
}

function appendRoomUpdates(
  list: InteriorRoomStructuredUpdate[],
  roomCanon: string,
  surfaces: InteriorSurfaceKey[],
  value: boolean
): void {
  for (const s of surfaces) {
    list.push({ roomCanonical: roomCanon, surface: s, value })
  }
}

function tryParseWindows(clause: string, out: InteriorWindowStructuredUpdate[]): void {
  const c = norm(clause)
  if (!c) return
  const low = c.toLowerCase()

  const tryRow = (yes: boolean, kind: 'trim' | 'seal') => {
    const field: InteriorWindowLogicalField = kind === 'trim' ? 'windowTrim' : 'windowSeal'
    out.push({ field, value: yes })
  }

  let m: RegExpMatchArray | null

  m = low.match(/\b(yes|no)\s+(?:for\s+)?window\s+(trim|seal(?:ing)?)\b/)
  if (m) {
    tryRow(m[1] === 'yes', m[2].startsWith('trim') ? 'trim' : 'seal')

    return
  }

  m = low.match(/\bwindow\s+(trim|seal(?:ing)?)\s+(yes|no)\b/)
  if (m) {
    tryRow(m[2] === 'yes', m[1].startsWith('trim') ? 'trim' : 'seal')

    return
  }

  m = low.match(/\b(change|set)\s+(?:that\s+to\s+)?(yes|no)\s+(?:for\s+)?window\s+(trim|seal)\b/)
  if (m) {
    tryRow(m[2] === 'yes', m[3].startsWith('trim') ? 'trim' : 'seal')
  }
}

function extractServiceKeysFromTail(tail: string): InteriorExtraKey[] {
  const low = tail.toLowerCase()
  const found: InteriorExtraKey[] = []
  const used: boolean[] = new Array(low.length).fill(false)

  const sorted = [...SERVICE_PHRASE_TO_KEY].sort((a, b) => b.phrase.length - a.phrase.length)
  for (const { phrase, key } of sorted) {
    let from = 0
    while (from < low.length) {
      const idx = low.indexOf(phrase, from)
      if (idx < 0) break
      const end = idx + phrase.length
      let overlap = false
      for (let i = idx; i < end; i++) {
        if (used[i]) {
          overlap = true
          break
        }
      }
      if (!overlap) {
        for (let i = idx; i < end; i++) used[i] = true
        found.push(key)
      }
      from = idx + 1
    }
  }

  return [...new Set(found)]
}

function tryParseServices(clause: string, out: InteriorServiceStructuredUpdate[]): void {
  const c = norm(clause)
  if (!c) return
  const low = c.toLowerCase()

  let tail = ''
  let value: boolean | null = null

  let m =
    c.match(/^(?:remove|exclude|don'?t\s+need|no\s+more|uncheck|disable|clear|drop)\s+(.+)$/i) ||
    c.match(/^(?:no|not)\s+(?:the\s+)?(.+)$/i)
  if (m) {
    tail = m[1]
    value = false
  } else {
    m =
      c.match(/^(?:add|include|we\s+need|enable|turn\s+on|check|select|use)\s+(.+)$/i) ||
      c.match(/^need\s+(.+)$/i)
    if (m) {
      tail = m[1]
      value = true
    }
  }

  if (value === null) {
    const m2 = low.match(/\b(?:remove|exclude|don'?t\s+need|no\s+more|uncheck)\s+([a-z\s]+)$/)
    if (m2) {
      tail = m2[1]
      value = false
    } else return
  }

  tail = tail.replace(/\b(everywhere|please|thanks)\b/gi, ' ').trim()
  const keys = extractServiceKeysFromTail(tail)
  for (const k of keys) out.push({ service: k, value })
}

function tryParseRoomClause(clause: string, out: InteriorRoomStructuredUpdate[]): void {
  const c = norm(clause)
  if (!c) return
  const low = c.toLowerCase()

  const roomRe = new RegExp(`(${ROOM_ALT})`, 'i')

  // "no baseboards in bedroom b" / "no doors in bedroom a"
  let m = low.match(
    new RegExp(`^no\\s+(${SURF_LIST}(?:\\s+and\\s+${SURF_LIST})*)\\s+in\\s+(?:the\\s+)?(${ROOM_ALT})\\s*$`, 'i')
  )
  if (m) {
    const surfaces = parseSurfaceTokens(m[1])
    const room = resolveRoom(m[2])
    if (room && surfaces.length) {
      appendRoomUpdates(out, room, surfaces, false)

      return
    }
  }

  // "don't paint doors in bedroom a"
  m = low.match(
    new RegExp(
      `^(?:don'?t|dont)\\s+(?:paint\\s+)?(${SURF_LIST}(?:\\s+and\\s+${SURF_LIST})*)\\s+in\\s+(?:the\\s+)?(${ROOM_ALT})\\s*$`,
      'i'
    )
  )
  if (m) {
    const surfaces = parseSurfaceTokens(m[1])
    const room = resolveRoom(m[2])
    if (room && surfaces.length) {
      appendRoomUpdates(out, room, surfaces, false)

      return
    }
  }

  // "remove walls from kitchen" / "exclude ceiling from hallway"
  m = low.match(
    new RegExp(
      `^(?:remove|exclude)\\s+(${SURF_LIST}(?:\\s+and\\s+${SURF_LIST})*)\\s+from\\s+(?:the\\s+)?(${ROOM_ALT})\\s*$`,
      'i'
    )
  )
  if (m) {
    const surfaces = parseSurfaceTokens(m[1])
    const room = resolveRoom(m[2])
    if (room && surfaces.length) {
      appendRoomUpdates(out, room, surfaces, false)

      return
    }
  }

  // "paint kitchen walls" / "do the living room ceiling and doors"
  m = low.match(
    new RegExp(`^(?:paint|do)\\s+(?:the\\s+)?(${ROOM_ALT})\\s+(${SURF_LIST}(?:\\s+and\\s+${SURF_LIST})*)\\s*$`, 'i')
  )
  if (m) {
    const room = resolveRoom(m[1])
    const surfaces = parseSurfaceTokens(m[2])
    if (room && surfaces.length) {
      appendRoomUpdates(out, room, surfaces, true)

      return
    }
  }

  // "actually remove paint from kitchen walls" → treat as clear wall in kitchen
  m = low.match(
    new RegExp(
      `^(?:actually\\s+)?(?:remove|exclude)\\s+(?:paint\\s+)?(?:from\\s+)?(?:the\\s+)?(${ROOM_ALT})\\s+(${SURF_LIST}(?:\\s+and\\s+${SURF_LIST})*)\\s*$`,
      'i'
    )
  )
  if (m) {
    const room = resolveRoom(m[1])
    const surfaces = parseSurfaceTokens(m[2])
    if (room && surfaces.length) {
      appendRoomUpdates(out, room, surfaces, false)

      return
    }
  }

  // "ceiling and doors in the living room" / "walls in kitchen"
  m = low.match(
    new RegExp(`^(${SURF_LIST}(?:\\s+and\\s+${SURF_LIST})*)\\s+in\\s+(?:the\\s+)?(${ROOM_ALT})\\s*$`, 'i')
  )
  if (m) {
    const surfaces = parseSurfaceTokens(m[1])
    const room = resolveRoom(m[2])
    if (room && surfaces.length) {
      appendRoomUpdates(out, room, surfaces, true)

      return
    }
  }

  // "in the kitchen walls and ceiling"
  m = low.match(new RegExp(`^in\\s+(?:the\\s+)?(${ROOM_ALT})\\s+(${SURF_LIST}(?:\\s+and\\s+${SURF_LIST})*)\\s*$`, 'i'))
  if (m) {
    const room = resolveRoom(m[1])
    const surfaces = parseSurfaceTokens(m[2])
    if (room && surfaces.length) {
      appendRoomUpdates(out, room, surfaces, true)

      return
    }
  }

  // Fallback: room substring + surface words anywhere in clause (one room per clause)
  if (!roomRe.test(low)) return
  const matchRoom = low.match(new RegExp(`\\b(${ROOM_ALT})\\b`, 'i'))
  if (!matchRoom) return
  const room = resolveRoom(matchRoom[1])
  if (!room) return
  const surfaces = parseSurfaceTokens(low)
  if (!surfaces.length) return
  const negCtx = /\b(no|not|don'?t|dont|remove|exclude)\b/i.test(low)
  appendRoomUpdates(out, room, surfaces, !negCtx)
}

/** Full-text pass: "kitchen walls" without comma */
function globalRoomSurfacePass(text: string, out: InteriorRoomStructuredUpdate[]): void {
  const low = norm(text).toLowerCase()
  const re = new RegExp(`\\b(${ROOM_ALT})\\s+(${SURF_LIST}(?:\\s+and\\s+${SURF_LIST})*)\\b`, 'gi')
  let m: RegExpExecArray | null
  while ((m = re.exec(low)) !== null) {
    const room = resolveRoom(m[1])
    const surfaces = parseSurfaceTokens(m[2])
    if (room && surfaces.length) {
      const start = m.index
      const before = low.slice(Math.max(0, start - 24), start)
      const neg = /\b(no|not|don'?t|remove|exclude)\s+$/.test(before)
      appendRoomUpdates(out, room, surfaces, !neg)
    }
  }

  const re2 = new RegExp(`\\b(${SURF_LIST}(?:\\s+and\\s+${SURF_LIST})*)\\s+in\\s+(?:the\\s+)?(${ROOM_ALT})\\b`, 'gi')
  while ((m = re2.exec(low)) !== null) {
    const room = resolveRoom(m[2])
    const surfaces = parseSurfaceTokens(m[1])
    if (room && surfaces.length) {
      const start = m.index
      const before = low.slice(Math.max(0, start - 24), start)
      const neg = /\b(no|not|don'?t|remove|exclude)\s+$/.test(before)
      appendRoomUpdates(out, room, surfaces, !neg)
    }
  }
}

function tryParseFreeTextNotes(text: string, acc: InteriorVoiceStructuredResult): void {
  const t = norm(text)
  const paintM = t.match(/\b(?:interior\s+)?paint\s*(?:notes?|details?|specs?)?\s*(?:is|:)\s*(.+)$/i)
  if (paintM) acc.paintNotes = norm(paintM[1])

  const stainM = t.match(/\b(?:interior\s+)?stain\s*(?:notes?|details?)?\s*(?:is|:)\s*(.+)$/i)
  if (stainM) acc.stainNotes = norm(stainM[1])
}

function mergeByPathKey(
  windows: InteriorWindowStructuredUpdate[],
  services: InteriorServiceStructuredUpdate[],
  rooms: InteriorRoomStructuredUpdate[]
): void {
  const lastW = new Map<InteriorWindowLogicalField, InteriorWindowStructuredUpdate>()
  for (const u of windows) lastW.set(u.field, u)
  windows.length = 0
  windows.push(...lastW.values())

  const lastS = new Map<InteriorExtraKey, InteriorServiceStructuredUpdate>()
  for (const u of services) lastS.set(u.service, u)
  services.length = 0
  services.push(...lastS.values())

  const lastR = new Map<string, InteriorRoomStructuredUpdate>()
  for (const u of rooms) {
    const k = `${u.roomCanonical}|${u.surface}`
    lastR.set(k, u)
  }
  rooms.length = 0
  rooms.push(...lastR.values())
}

export function parseInteriorVoiceStructured(raw: string): InteriorVoiceStructuredResult {
  const windowUpdates: InteriorWindowStructuredUpdate[] = []
  const serviceUpdates: InteriorServiceStructuredUpdate[] = []
  const roomUpdates: InteriorRoomStructuredUpdate[] = []
  const acc: InteriorVoiceStructuredResult = { windowUpdates, serviceUpdates, roomUpdates }

  const text = norm(raw)
  if (!text) return acc

  tryParseFreeTextNotes(text, acc)

  const clauses = splitClauses(text)
  for (const clause of clauses) {
    tryParseWindows(clause, windowUpdates)
    tryParseServices(clause, serviceUpdates)
    tryParseRoomClause(clause, roomUpdates)
  }

  globalRoomSurfacePass(text, roomUpdates)

  mergeByPathKey(windowUpdates, serviceUpdates, roomUpdates)

  return acc
}

function windowToRhf(u: InteriorWindowStructuredUpdate): VoiceIntentUpdate[] {
  const yes =
    u.field === 'windowTrim' ? INTERIOR_WINDOW_FIELD_PATHS.trimYes : INTERIOR_WINDOW_FIELD_PATHS.sealYes
  const no =
    u.field === 'windowTrim' ? INTERIOR_WINDOW_FIELD_PATHS.trimNo : INTERIOR_WINDOW_FIELD_PATHS.sealNo
  if (u.value) {
    return [
      { target: 'rhf', path: yes, value: true, confidence: CONF, source: 'rule' },
      { target: 'rhf', path: no, value: false, confidence: CONF, source: 'rule' }
    ]
  }

  return [
    { target: 'rhf', path: yes, value: false, confidence: CONF, source: 'rule' },
    { target: 'rhf', path: no, value: true, confidence: CONF, source: 'rule' }
  ]
}

function roomToRhf(u: InteriorRoomStructuredUpdate): VoiceIntentUpdate | null {
  const row = interiorRoomCanonicalToRowIndex(u.roomCanonical)
  if (row < 0) return null
  const col = interiorSurfaceKeyToCol(u.surface)
  const path = interiorMatrixPath(row, col)

  return { target: 'rhf', path, value: u.value, confidence: CONF, source: 'rule' }
}

export function interiorStructuredResultToVoiceUpdates(struct: InteriorVoiceStructuredResult): VoiceIntentUpdate[] {
  const out: VoiceIntentUpdate[] = []
  for (const w of struct.windowUpdates) out.push(...windowToRhf(w))
  for (const s of struct.serviceUpdates) {
    out.push({
      target: 'rhf',
      path: interiorExtraPath(s.service),
      value: s.value,
      confidence: CONF,
      source: 'rule'
    })
  }
  for (const r of struct.roomUpdates) {
    const u = roomToRhf(r)
    if (u) out.push(u)
  }
  if (struct.paintNotes) {
    out.push({
      target: 'rhf',
      path: 'interiorData.paint_textarea',
      value: struct.paintNotes,
      confidence: CONF,
      source: 'rule'
    })
  }
  if (struct.stainNotes) {
    out.push({
      target: 'rhf',
      path: 'interiorData.stain_textarea',
      value: struct.stainNotes,
      confidence: CONF,
      source: 'rule'
    })
  }

  return out
}

export function parseInteriorVoiceToUpdates(raw: string): VoiceIntentUpdate[] {
  return interiorStructuredResultToVoiceUpdates(parseInteriorVoiceStructured(raw))
}

/** Alias: structured parse for agent / tooling (`windowUpdates`, `serviceUpdates`, `roomUpdates`). */
export const parseInteriorVoiceCommand = parseInteriorVoiceStructured

/** One-line preview for the voice assistant panel */
export function summarizeInteriorVoiceStructured(s: InteriorVoiceStructuredResult): string {
  const parts: string[] = []
  for (const w of s.windowUpdates) {
    parts.push(`${w.field}=${w.value ? 'yes' : 'no'}`)
  }
  for (const x of s.serviceUpdates) {
    parts.push(`${x.service}:${x.value ? 'on' : 'off'}`)
  }
  for (const r of s.roomUpdates) {
    parts.push(`${r.roomCanonical} ${r.surface}:${r.value ? 'on' : 'off'}`)
  }
  if (s.paintNotes) parts.push(`paint notes`)
  if (s.stainNotes) parts.push(`stain notes`)

  return parts.length ? parts.join(' · ') : ''
}
