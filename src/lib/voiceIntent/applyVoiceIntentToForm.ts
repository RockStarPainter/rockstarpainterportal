import { flushSync } from 'react-dom'
import type { UseFormSetFocus, UseFormSetValue } from 'react-hook-form'
import { parseVoiceIntentText } from 'src/lib/voiceIntent/parseVoiceIntent'
import type { VoiceIntentUpdate } from 'src/types/voiceIntent'

/** Never apply these via bulk voice intent (money / payment). */
export const VOICE_BLOCKED_RHF_PATHS = new Set<string>([
  'total_cost',
  'down_payment',
  'balance_due',
  'handyMan_total_cost',
  'handyMan_down_payment',
  'handyMan_balance_due',
  'pay_link'
])

const VOICE_DEBUG =
  typeof process !== 'undefined' && process.env.NODE_ENV === 'development' && typeof window !== 'undefined'

export interface ApplyVoiceIntentToFormOpts {
  setValue: UseFormSetValue<any>
  setFocus?: UseFormSetFocus<any>

  /** Live streaming: avoid stealing focus on every partial phrase. */
  suppressFocus?: boolean

  /** Called with paths after each flushSync apply (for highlights). */
  onPathsApplied?: (paths: string[]) => void

  /** dev / localStorage VOICE_DEBUG=1 */
  debugLabel?: string
}

/**
 * Runs parseVoiceIntentText and writes every safe RHF update (interior matrix, extras, windows,
 * customer duplicates, exterior rows, newForm, etc.). Used by Groq / any path that does not use
 * VoiceInvoiceAssistant.processUpdates.
 */
export function applyVoiceIntentRhfFromText(text: string, opts: ApplyVoiceIntentToFormOpts): string[] {
  const t = text.trim()
  if (!t) return []

  let updates: VoiceIntentUpdate[] = []
  try {
    const res = parseVoiceIntentText(t)
    updates = res.updates ?? []
  } catch (e) {
    if (VOICE_DEBUG && window.localStorage?.getItem('VOICE_DEBUG') === '1') {
      console.error('[voice intent] parse failed', e)
    }

    return []
  }

  if (VOICE_DEBUG && window.localStorage?.getItem('VOICE_DEBUG') === '1') {
    console.log(opts.debugLabel ?? '[voice intent]', 'transcript:', t)
    console.log(opts.debugLabel ?? '[voice intent]', 'parsed updates:', updates)
  }

  const applied: string[] = []
  for (const u of updates) {
    if (u.target !== 'rhf' || !u.path) continue
    if (VOICE_BLOCKED_RHF_PATHS.has(u.path)) continue
    flushSync(() => {
      opts.setValue(u.path as any, u.value, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: false
      })
    })
    applied.push(u.path)
    if (!opts.suppressFocus) opts.setFocus?.(u.path as any)
  }

  if (applied.length && opts.onPathsApplied) opts.onPathsApplied(applied)

  if (VOICE_DEBUG && window.localStorage?.getItem('VOICE_DEBUG') === '1') {
    console.log(opts.debugLabel ?? '[voice intent]', 'applied RHF paths:', applied)
  }

  return applied
}
