import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import UndoIcon from '@mui/icons-material/Undo'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import { Alert, Box, Button, Collapse, IconButton, Paper, TextField, Tooltip, Typography } from '@mui/material'
import type { UseFormReset, UseFormSetFocus, UseFormSetValue } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { useVoice } from 'src/hooks/useVoice'
import { parseVoiceIntentText } from 'src/lib/voiceIntent/parseVoiceIntent'
import {
  buildIntentSourceText,
  mergeVoiceIntentUpdates
} from 'src/lib/voiceIntent/voiceRealtimePreprocess'
import {
  CUSTOMER_FIELD_LABELS,
  type CustomerRhfField
} from 'src/lib/voiceForm/parseCustomerVoiceCommands'
import type { VoiceIntentUpdate } from 'src/types/voiceIntent'

const AUTO_THRESHOLD = 0.95

/** Customer detail fields always auto-apply when confidence is at least this (below global 0.95). */
const CUSTOMER_RHF_PATHS = new Set([
  'customer_name',
  'phone_number',
  'email',
  'address',
  'city',
  'state',
  'zip_code',
  'issue_date'
])
const CUSTOMER_AUTO_MIN_CONF = 0.8

const NEVER_AUTO_RHF = new Set([
  'total_cost',
  'down_payment',
  'balance_due',
  'handyMan_total_cost',
  'handyMan_down_payment',
  'handyMan_balance_due',
  'pay_link'
])

const NEVER_AUTO_STATE = new Set(['invoiceType', 'selectedOption', 'warrantyType'])

export type VoiceRealtimeFilledPath = CustomerRhfField | 'issue_date'

function labelForVoiceRhfPath(path: string): string {
  if (path === 'issue_date') return 'Issue Date'

  return CUSTOMER_FIELD_LABELS[path as CustomerRhfField] ?? path
}

function sameLocalCalendarDay(a: unknown, b: unknown): boolean {
  const toDay = (v: unknown): { y: number; m: number; d: number } | null => {
    if (v instanceof Date && !Number.isNaN(v.getTime())) {
      return { y: v.getFullYear(), m: v.getMonth(), d: v.getDate() }
    }
    if (typeof v === 'string' || typeof v === 'number') {
      const dt = new Date(v)

      return Number.isNaN(dt.getTime()) ? null : { y: dt.getFullYear(), m: dt.getMonth(), d: dt.getDate() }
    }

    return null
  }

  const da = toDay(a)
  const db = toDay(b)
  if (!da || !db) return false

  return da.y === db.y && da.m === db.m && da.d === db.d
}

function rhfValueUnchanged(path: string, cur: unknown, next: unknown): boolean {
  if (path === 'issue_date') return sameLocalCalendarDay(cur, next)

  return String(cur ?? '') === String(next ?? '')
}

export interface VoiceSnapshot {
  form: Record<string, unknown>
  selectedOption: string
  invoiceType: string
  warrantyType: 'None' | 'Interior' | 'Exterior' | 'Both'
}

export interface VoiceInvoiceAssistantProps {
  disabled?: boolean
  getValues: () => Record<string, unknown>
  setValue: UseFormSetValue<any>
  reset: UseFormReset<any>
  setFocus?: UseFormSetFocus<any>
  selectedOption: string
  setSelectedOption: (v: string) => void
  invoiceType: string
  setInvoiceType: (v: string) => void
  warrantyType: 'None' | 'Interior' | 'Exterior' | 'Both'
  setWarrantyType: (v: 'None' | 'Interior' | 'Exterior' | 'Both') => void

  /** Live Web Speech: customer + issue date fields that were auto-applied (green vs orange highlight). */
  onRealtimeCustomerVoiceApplied?: (paths: VoiceRealtimeFilledPath[], kind: 'fill' | 'correct') => void
}

function labelForUpdate(u: VoiceIntentUpdate): string {
  if (u.target === 'rhf' && u.path) return u.path
  if (u.target === 'state' && u.key) return u.key

  return 'field'
}

function shouldAutoApply(u: VoiceIntentUpdate): boolean {
  if (u.target === 'rhf' && u.path && CUSTOMER_RHF_PATHS.has(u.path)) {
    return u.confidence >= CUSTOMER_AUTO_MIN_CONF
  }
  if (u.confidence < AUTO_THRESHOLD) return false
  if (u.target === 'rhf' && u.path && NEVER_AUTO_RHF.has(u.path)) return false
  if (u.target === 'state' && u.key && NEVER_AUTO_STATE.has(u.key)) return false

  return true
}

function mergePendingUnique(prev: VoiceIntentUpdate[], manual: VoiceIntentUpdate[]): VoiceIntentUpdate[] {
  const next = [...prev]
  for (const u of manual) {
    const idx = next.findIndex(
      x =>
        (x.target === 'rhf' && u.target === 'rhf' && x.path === u.path) ||
        (x.target === 'state' && u.target === 'state' && x.key === u.key)
    )
    if (idx >= 0) next[idx] = u
    else next.push(u)
  }

  return next
}

function stateValueUnchanged(
  u: VoiceIntentUpdate,
  p: { selectedOption: string; invoiceType: string; warrantyType: string }
): boolean {
  if (u.target !== 'state' || !u.key) return false
  if (u.key === 'selectedOption') return p.selectedOption === String(u.value ?? '')
  if (u.key === 'invoiceType') return p.invoiceType === String(u.value ?? '')
  if (u.key === 'warrantyType') return p.warrantyType === u.value

  return false
}

function applyStateUpdate(
  u: VoiceIntentUpdate,
  p: Pick<
    VoiceInvoiceAssistantProps,
    'setSelectedOption' | 'setInvoiceType' | 'setWarrantyType'
  >
) {
  if (u.target !== 'state' || !u.key) return
  switch (u.key) {
    case 'selectedOption':
      p.setSelectedOption(String(u.value ?? ''))
      break
    case 'invoiceType':
      p.setInvoiceType(String(u.value ?? ''))
      break
    case 'warrantyType':
      p.setWarrantyType(u.value as 'None' | 'Interior' | 'Exterior' | 'Both')
      break
    default:
      break
  }
}

function cloneFormValues(values: Record<string, unknown>): Record<string, unknown> {
  try {
    return structuredClone(values) as Record<string, unknown>
  } catch {
    return JSON.parse(JSON.stringify(values)) as Record<string, unknown>
  }
}

const VoiceInvoiceAssistant: React.FC<VoiceInvoiceAssistantProps> = ({
  disabled = false,
  getValues,
  setValue,
  reset,
  setFocus,
  selectedOption,
  setSelectedOption,
  invoiceType,
  setInvoiceType,
  warrantyType,
  setWarrantyType,
  onRealtimeCustomerVoiceApplied
}) => {
  const {
    supported,
    isListening,
    transcript,
    interimTranscript,
    error: voiceError,
    start,
    stop,
    clearTranscript
  } = useVoice('en-US')

  const [pasteText, setPasteText] = useState('')
  const [pending, setPending] = useState<VoiceIntentUpdate[]>([])
  const [expanded, setExpanded] = useState(true)
  const lastSnapshot = useRef<VoiceSnapshot | null>(null)
  const streamDebounceRef = useRef<number | null>(null)

  const liveIntentText = useMemo(
    () => [transcript, interimTranscript].filter(Boolean).join(' ').trim(),
    [transcript, interimTranscript]
  )

  const takeSnapshot = useCallback((): VoiceSnapshot => {
    return {
      form: cloneFormValues(getValues() as Record<string, unknown>),
      selectedOption,
      invoiceType,
      warrantyType
    }
  }, [getValues, selectedOption, invoiceType, warrantyType])

  const applyRhf = useCallback(
    (u: VoiceIntentUpdate) => {
      if (u.target !== 'rhf' || !u.path) return
      setValue(u.path as any, u.value, { shouldDirty: true, shouldTouch: true })
      setFocus?.(u.path as any)
    },
    [setFocus, setValue]
  )

  const processUpdates = useCallback(
    (updates: VoiceIntentUpdate[]) => {
      const empty = {
        appliedAutoCount: 0,
        customerRhfApplied: [] as string[],
        manualCount: 0
      }
      if (!updates.length) return empty

      if (!lastSnapshot.current) {
        lastSnapshot.current = takeSnapshot()
      }

      const manual: VoiceIntentUpdate[] = []
      let appliedAutoCount = 0
      const customerRhfApplied: string[] = []
      const stateCtx = { selectedOption, invoiceType, warrantyType }

      for (const u of updates) {
        if (!shouldAutoApply(u)) {
          manual.push(u)
          continue
        }
        if (u.target === 'rhf' && u.path) {
          const cur = (getValues() as Record<string, unknown>)[u.path]
          if (rhfValueUnchanged(u.path, cur, u.value)) continue
          applyRhf(u)
          appliedAutoCount++
          if (CUSTOMER_RHF_PATHS.has(u.path)) customerRhfApplied.push(u.path)
          continue
        }
        if (u.target === 'state' && u.key) {
          if (stateValueUnchanged(u, stateCtx)) continue
          applyStateUpdate(u, {
            setSelectedOption,
            setInvoiceType,
            setWarrantyType
          })
          appliedAutoCount++
        }
      }

      if (manual.length) {
        setPending(prev => mergePendingUnique(prev, manual))
      }

      return {
        appliedAutoCount,
        customerRhfApplied,
        manualCount: manual.length
      }
    },
    [
      applyRhf,
      getValues,
      invoiceType,
      selectedOption,
      setInvoiceType,
      setSelectedOption,
      setWarrantyType,
      takeSnapshot,
      warrantyType
    ]
  )

  const runIntent = useCallback(
    (text: string, opts?: { quiet?: boolean; clearTranscriptAfterApply?: boolean }) => {
      const t = text.trim()
      if (!t) return
      try {
        const { source, correction } = buildIntentSourceText(t)
        let updates: VoiceIntentUpdate[]
        if (correction) {
          const rawUpdates = parseVoiceIntentText(t).updates ?? []
          const preUpdates = parseVoiceIntentText((source.trim() || t).trim()).updates ?? []
          updates = mergeVoiceIntentUpdates(rawUpdates, preUpdates)
        } else {
          updates = parseVoiceIntentText(t).updates ?? []
        }

        const result = processUpdates(updates)

        const quiet = opts?.quiet ?? false
        const hadNonCustomerAuto = result.appliedAutoCount > result.customerRhfApplied.length

        if (result.customerRhfApplied.length) {
          const paths = result.customerRhfApplied as VoiceRealtimeFilledPath[]
          const kind: 'fill' | 'correct' = correction ? 'correct' : 'fill'
          onRealtimeCustomerVoiceApplied?.(paths, kind)
          const icon = correction ? '🔁' : '✅'
          const suffix = correction ? 'corrected' : 'updated'
          for (const path of result.customerRhfApplied) {
            const lbl = labelForVoiceRhfPath(path)
            toast.success(`${lbl} ${suffix}`, { icon })
          }
        }

        if (opts?.clearTranscriptAfterApply && result.appliedAutoCount > 0) {
          clearTranscript()
        }

        if (!quiet && hadNonCustomerAuto) {
          toast.success(`Voice: applied ${result.appliedAutoCount - result.customerRhfApplied.length} other update(s)`)
        }
        if (!quiet && result.manualCount > 0) {
          toast(`${result.manualCount} suggestion(s) need your confirmation`, { icon: '👆' })
        }
      } catch (e) {
        console.error('parseVoiceIntentText', e)
        if (!opts?.quiet) toast.error('Voice parse failed')
      }
    },
    [clearTranscript, onRealtimeCustomerVoiceApplied, processUpdates]
  )

  const runIntentRef = useRef(runIntent)
  runIntentRef.current = runIntent

  /** Web Speech: final + interim text, client-side parse, ~130ms debounce. */
  useEffect(() => {
    if (disabled || !isListening || liveIntentText.length === 0) return

    if (streamDebounceRef.current) clearTimeout(streamDebounceRef.current)
    streamDebounceRef.current = window.setTimeout(() => {
      runIntentRef.current(liveIntentText, { quiet: true, clearTranscriptAfterApply: true })
      streamDebounceRef.current = null
    }, 100)

    return () => {
      if (streamDebounceRef.current) {
        clearTimeout(streamDebounceRef.current)
        streamDebounceRef.current = null
      }
    }
  }, [disabled, isListening, liveIntentText])

  const handleUndo = () => {
    const snap = lastSnapshot.current
    if (!snap) {
      toast.error('Nothing to undo')

      return
    }
    reset(snap.form as any)
    setSelectedOption(snap.selectedOption)
    setInvoiceType(snap.invoiceType)
    setWarrantyType(snap.warrantyType)
    lastSnapshot.current = null
    setPending([])
    toast.success('Voice changes reverted')
  }

  const acceptOne = (u: VoiceIntentUpdate) => {
    if (!lastSnapshot.current) {
      lastSnapshot.current = takeSnapshot()
    }
    if (u.target === 'rhf') applyRhf(u)
    else
      applyStateUpdate(u, {
        setSelectedOption,
        setInvoiceType,
        setWarrantyType
      })
    setPending(prev => prev.filter(x => x !== u))
    toast.success('Applied suggestion')
  }

  const dismissOne = (u: VoiceIntentUpdate) => {
    setPending(prev => prev.filter(x => x !== u))
  }

  if (disabled) return null

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
      <Box display='flex' alignItems='center' justifyContent='space-between' flexWrap='wrap' gap={1}>
        <Typography variant='subtitle1' fontWeight='bold'>
          Voice assistant
        </Typography>
        <Button type='button' size='small' onClick={() => setExpanded(e => !e)}>
          {expanded ? 'Hide' : 'Show'}
        </Button>
      </Box>

      <Collapse in={expanded}>
        {!supported && (
          <Alert severity='warning' sx={{ mt: 1 }}>
            Speech recognition is unavailable here (use Chrome or Edge). Use &quot;Paste or type&quot; below and Parse
            text, or use the Groq voice button for speech-to-text.
          </Alert>
        )}
        {supported &&
          typeof window !== 'undefined' &&
          !window.isSecureContext &&
          window.location.hostname !== 'localhost' &&
          window.location.hostname !== '127.0.0.1' && (
            <Alert severity='warning' sx={{ mt: 1 }}>
              Web Speech often needs <strong>HTTPS</strong> or <strong>localhost</strong>. If the mic does nothing, open
              the app via https:// or http://127.0.0.1:3000 and allow the microphone when prompted.
            </Alert>
          )}

        {voiceError && (
          <Alert severity='error' sx={{ mt: 1 }}>
            {voiceError}
          </Alert>
        )}

        <Box display='flex' alignItems='center' gap={1} mt={1} flexWrap='wrap'>
          <Tooltip title={isListening ? 'Stop listening' : 'Start microphone'}>
            <span>
              <IconButton
                type='button'
                color={isListening ? 'error' : 'primary'}
                onClick={() => {
                  if (isListening) stop()
                  else void start()
                }}
                disabled={!supported}
                aria-label='toggle voice'
              >
                {isListening ? <MicOffIcon /> : <MicIcon />}
              </IconButton>
            </span>
          </Tooltip>
          <Typography variant='body2' color={isListening ? 'primary' : 'text.secondary'}>
            {isListening ? 'Listening…' : 'Mic off'}
          </Typography>
          <Tooltip title='Undo all voice changes since first suggestion in this session'>
            <span>
              <Button
                type='button'
                startIcon={<UndoIcon />}
                size='small'
                onClick={handleUndo}
                disabled={!lastSnapshot.current}
              >
                Undo
              </Button>
            </span>
          </Tooltip>
        </Box>

        <TextField
          fullWidth
          size='small'
          label='Live transcript'
          value={`${transcript}${interimTranscript ? ` ${interimTranscript}` : ''}`}
          InputProps={{ readOnly: true }}
          sx={{ mt: 1 }}
          helperText='Live: fields update while you speak (final + interim text, ~100ms debounce; transcript clears after each apply).'
        />

        <Box display='flex' gap={1} mt={2} alignItems='flex-start' flexWrap='wrap'>
          <TextField
            fullWidth
            size='small'
            label='Paste or type instead'
            multiline
            minRows={2}
            value={pasteText}
            onChange={e => setPasteText(e.target.value)}
            sx={{ flex: '1 1 240px' }}
          />
          <Button type='button' variant='contained' sx={{ alignSelf: 'flex-start' }} onClick={() => runIntent(pasteText)}>
            Parse text
          </Button>
        </Box>

        {pending.length > 0 && (
          <Box mt={2}>
            <Typography variant='body2' fontWeight='bold' gutterBottom>
              Suggestions — confirm to apply
            </Typography>
            <Box display='flex' flexDirection='column' gap={1}>
              {pending.map((u, i) => (
                <Box
                  key={`${labelForUpdate(u)}-${i}-${String(u.value)}`}
                  display='flex'
                  alignItems='center'
                  gap={1}
                  flexWrap='wrap'
                  sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1 }}
                >
                  <Typography variant='body2' sx={{ flex: '1 1 200px' }}>
                    <strong>{labelForUpdate(u)}</strong> → {String(u.value)}{' '}
                    <Typography component='span' variant='caption' color='text.secondary'>
                      ({Math.round(u.confidence * 100)}%)
                    </Typography>
                  </Typography>
                  <Tooltip title='Apply'>
                    <IconButton
                      type='button'
                      size='small'
                      color='primary'
                      onClick={() => acceptOne(u)}
                      aria-label='apply suggestion'
                    >
                      <CheckIcon fontSize='small' />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title='Dismiss'>
                    <IconButton type='button' size='small' onClick={() => dismissOne(u)} aria-label='dismiss suggestion'>
                      <CloseIcon fontSize='small' />
                    </IconButton>
                  </Tooltip>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Collapse>
    </Paper>
  )
}

export default VoiceInvoiceAssistant
