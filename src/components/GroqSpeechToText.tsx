import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useGroqSpeechRecorder } from 'src/hooks/useGroqSpeechRecorder'
import { useVoice } from 'src/hooks/useVoice'
import {
  getVoiceCustomerGroq,
  subscribeVoiceCustomerGroq,
  type VoiceCustomerGroqBridgeValue
} from 'src/lib/voiceForm/voiceCustomerGroqBridge'
import {
  applyCustomerVoiceText,
  applyIncrementalCustomerVoiceForm,
  applyIncrementalInvoiceMetaForm,
  applyInvoiceMetaFromTextFinal,
  createInvoiceMetaLiveState,
  createLiveVoiceApplyState,
  type InvoiceMetaLiveState,
  type LiveVoiceApplyState
} from 'src/lib/voiceForm/applyCustomerVoiceText'
import {
  customerVoiceFieldKeys,
  restoreCustomerVoiceFields,
  snapshotCustomerVoiceFields,
  type CustomerVoiceSnapshot
} from 'src/lib/voiceForm/customerVoiceSnapshot'
import { toast } from 'react-hot-toast'
import styles from './GroqSpeechToText.module.css'

type PanelStatus = 'idle' | 'listening' | 'processing'

/**
 * Floating Groq FAB + panel. On Create Invoice, the page registers handlers via registerVoiceCustomerGroq
 * so speech can fill customer fields. Otherwise generic transcript only.
 */
export default function GroqSpeechToText() {
  const [invoiceCtx, setInvoiceCtx] = useState<VoiceCustomerGroqBridgeValue | null>(() => getVoiceCustomerGroq())

  useEffect(() => {
    setInvoiceCtx(getVoiceCustomerGroq())

    return subscribeVoiceCustomerGroq(() => setInvoiceCtx(getVoiceCustomerGroq()))
  }, [])
  const fillCustomer = Boolean(invoiceCtx && !invoiceCtx.disabled)
  const liveCaption = fillCustomer && invoiceCtx?.liveCaption !== false
  const useLlmFallback = invoiceCtx?.useLlmFallback !== false

  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [visible, setVisible] = useState(false)
  const [transcript, setTranscript] = useState('')
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const applyingRef = useRef(false)
  const [recMs, setRecMs] = useState(0)
  const [canUndoCustomerVoice, setCanUndoCustomerVoice] = useState(false)
  const undoCustomerSnapRef = useRef<CustomerVoiceSnapshot | null>(null)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const invoiceCtxRef = useRef(invoiceCtx)
  const liveVoiceStateRef = useRef<LiveVoiceApplyState>(createLiveVoiceApplyState())
  const invoiceMetaLiveStateRef = useRef<InvoiceMetaLiveState>(createInvoiceMetaLiveState())
  const liveGateRef = useRef(false)
  const clearTranscriptRef = useRef<() => void>(() => {})

  useEffect(() => {
    invoiceCtxRef.current = invoiceCtx
  }, [invoiceCtx])

  const onLiveCombined = useCallback((combined: string) => {
    if (!liveGateRef.current) return
    const ctx = invoiceCtxRef.current
    if (!ctx || ctx.disabled) return
    const customerTouched = applyIncrementalCustomerVoiceForm(
      combined,
      {
        setValue: ctx.setValue,
        setFocus: ctx.setFocus,
        onCustomerFieldsApplied: ctx.onCustomerFieldsApplied
      },
      liveVoiceStateRef.current
    )
    const metaTouched = applyIncrementalInvoiceMetaForm(
      combined,
      {
        setValue: ctx.setValue,
        setFocus: ctx.setFocus,
        setInvoiceStatus: ctx.setInvoiceStatus,
        focusInvoiceStatus: ctx.focusInvoiceStatus,
        setInvoiceType: ctx.setInvoiceType,
        setWarrantyType: ctx.setWarrantyType,
        focusInvoiceService: ctx.focusInvoiceService,
        focusInvoiceWarranty: ctx.focusInvoiceWarranty,
        onHighlight: ctx.onCustomerFieldsApplied
      },
      invoiceMetaLiveStateRef.current
    )
    if (customerTouched || metaTouched) clearTranscriptRef.current()
  }, [])

  const voiceOptions = useMemo(
    () => (fillCustomer && liveCaption ? { onLiveCombined } : undefined),
    [fillCustomer, liveCaption, onLiveCombined]
  )

  const { isRecording, isTranscribing, error, clearError, startRecording, stopRecording } = useGroqSpeechRecorder()

  const {
    supported: voiceSupported,
    transcript: voiceTranscript,
    interimTranscript: voiceInterim,
    error: voiceError,
    start: voiceStart,
    stop: voiceStop,
    clearTranscript
  } = useVoice('en-US', voiceOptions)

  useEffect(() => {
    clearTranscriptRef.current = clearTranscript
  }, [clearTranscript])

  useEffect(() => {
    setMounted(true)

    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))

    return () => cancelAnimationFrame(id)
  }, [open])

  useEffect(() => {
    if (!isRecording) return
    const t0 = Date.now()
    const id = window.setInterval(() => setRecMs(Date.now() - t0), 250)

    return () => clearInterval(id)
  }, [isRecording])

  useEffect(() => {
    if (!isRecording) setRecMs(0)
  }, [isRecording])

  useEffect(() => {
    if (!fillCustomer || !liveCaption || !voiceSupported || !open) return
    if (!isRecording) {
      liveGateRef.current = false
      voiceStop()

      return
    }
    const t = window.setTimeout(() => {
      liveGateRef.current = true
      void voiceStart()
    }, 400)

    return () => {
      liveGateRef.current = false
      clearTimeout(t)
      voiceStop()
    }
  }, [fillCustomer, liveCaption, voiceSupported, voiceStart, voiceStop, isRecording, open])

  useEffect(() => {
    if (!fillCustomer) {
      setCanUndoCustomerVoice(false)
      undoCustomerSnapRef.current = null
    }
  }, [fillCustomer])

  const status: PanelStatus = useMemo(() => {
    if (isTranscribing) return 'processing'
    if (isRecording) return 'listening'

    return 'idle'
  }, [isRecording, isTranscribing])

  const statusLabel = useMemo(() => {
    if (status === 'processing') return 'Processing…'
    if (status === 'listening') return 'Listening…'

    return 'Idle'
  }, [status])

  const liveDisplay =
    voiceInterim || voiceTranscript
      ? `${voiceTranscript}${voiceInterim ? ` ${voiceInterim}` : ''}`.trim()
      : ''

  const toggleMic = useCallback(async () => {
    clearError()
    if (isTranscribing || applyingRef.current) return

    if (isRecording) {
      const text = await stopRecording()
      if (!text?.trim()) return

      setTranscript(prev => (prev ? `${prev.trim()}\n${text}` : text).trim())

      if (fillCustomer && invoiceCtx) {
        applyingRef.current = true
        try {
          const snap = undoCustomerSnapRef.current
          const ok = await applyCustomerVoiceText(text, {
            setValue: invoiceCtx.setValue,
            setFocus: invoiceCtx.setFocus,
            onCustomerFieldsApplied: invoiceCtx.onCustomerFieldsApplied,
            useLlmFallback
          })
          applyInvoiceMetaFromTextFinal(text, {
            setValue: invoiceCtx.setValue,
            setFocus: invoiceCtx.setFocus,
            setInvoiceStatus: invoiceCtx.setInvoiceStatus,
            focusInvoiceStatus: invoiceCtx.focusInvoiceStatus,
            setInvoiceType: invoiceCtx.setInvoiceType,
            setWarrantyType: invoiceCtx.setWarrantyType,
            focusInvoiceService: invoiceCtx.focusInvoiceService,
            focusInvoiceWarranty: invoiceCtx.focusInvoiceWarranty,
            onHighlight: invoiceCtx.onCustomerFieldsApplied
          })
          if (ok && snap) {
            setCanUndoCustomerVoice(true)
          }
        } finally {
          applyingRef.current = false
        }
      }

      requestAnimationFrame(() => {
        textareaRef.current?.focus()
        const el = textareaRef.current
        if (el) {
          const len = el.value.length
          el.setSelectionRange(len, len)
        }
      })
    } else {
      voiceStop()
      clearTranscript()
      liveVoiceStateRef.current = createLiveVoiceApplyState()
      invoiceMetaLiveStateRef.current = createInvoiceMetaLiveState()
      if (fillCustomer && invoiceCtx?.getValues) {
        undoCustomerSnapRef.current = snapshotCustomerVoiceFields(invoiceCtx.getValues)
        setCanUndoCustomerVoice(false)
      }
      await startRecording()
    }
  }, [
    clearError,
    fillCustomer,
    invoiceCtx,
    isRecording,
    isTranscribing,
    startRecording,
    stopRecording,
    useLlmFallback,
    voiceStop,
    clearTranscript
  ])

  const applyFromTranscript = useCallback(async () => {
    if (!fillCustomer || !invoiceCtx || !transcript.trim() || applyingRef.current) return
    applyingRef.current = true
    try {
      const snap =
        invoiceCtx.getValues != null ? snapshotCustomerVoiceFields(invoiceCtx.getValues) : null
      const ok = await applyCustomerVoiceText(transcript, {
        setValue: invoiceCtx.setValue,
        setFocus: invoiceCtx.setFocus,
        onCustomerFieldsApplied: invoiceCtx.onCustomerFieldsApplied,
        useLlmFallback
      })
      applyInvoiceMetaFromTextFinal(transcript, {
        setValue: invoiceCtx.setValue,
        setFocus: invoiceCtx.setFocus,
        setInvoiceStatus: invoiceCtx.setInvoiceStatus,
        focusInvoiceStatus: invoiceCtx.focusInvoiceStatus,
        setInvoiceType: invoiceCtx.setInvoiceType,
        setWarrantyType: invoiceCtx.setWarrantyType,
        focusInvoiceService: invoiceCtx.focusInvoiceService,
        focusInvoiceWarranty: invoiceCtx.focusInvoiceWarranty,
        onHighlight: invoiceCtx.onCustomerFieldsApplied
      })
      if (ok && snap) {
        undoCustomerSnapRef.current = snap
        setCanUndoCustomerVoice(true)
      }
    } finally {
      applyingRef.current = false
    }
  }, [fillCustomer, invoiceCtx, transcript, useLlmFallback])

  const undoCustomerVoice = useCallback(() => {
    const snap = undoCustomerSnapRef.current
    if (!snap || !invoiceCtx) return
    restoreCustomerVoiceFields(invoiceCtx.setValue, snap)
    undoCustomerSnapRef.current = null
    setCanUndoCustomerVoice(false)
    invoiceCtx.onCustomerFieldsApplied?.([...customerVoiceFieldKeys()])
    toast.success('Customer fields undone')
  }, [invoiceCtx])

  const handleClose = useCallback(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    setVisible(false)
    if (isRecording) void stopRecording()
    voiceStop()
    closeTimerRef.current = setTimeout(() => {
      setOpen(false)
      closeTimerRef.current = null
    }, 220)
  }, [isRecording, stopRecording, voiceStop])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', onKey)

    return () => window.removeEventListener('keydown', onKey)
  }, [open, handleClose])

  if (!mounted) return null

  const micIcon = (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.66 5.99 6.14V21c0 .55.45 1 1 1s1-.45 1-1v-3.86c3.1-.48 5.5-3.14 5.99-6.14.1-.6-.39-1.14-1-1.14z" />
    </svg>
  )

  const stopIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  )

  const panelTitle = fillCustomer ? 'Voice — customer details' : 'Speech to text'

  const ui = (
    <>
      <button
        type="button"
        className={styles.launcher}
        aria-label={open ? 'Close speech to text' : 'Open speech to text'}
        aria-expanded={open}
        onClick={() => {
          if (open) handleClose()
          else {
            if (closeTimerRef.current) {
              clearTimeout(closeTimerRef.current)
              closeTimerRef.current = null
            }
            setOpen(true)
          }
        }}
      >
        {micIcon}
      </button>

      <div
        className={`${styles.backdrop} ${open && visible ? styles.visible : ''}`}
        aria-hidden={!open}
        onClick={handleClose}
      />

      <div
        className={`${styles.panelWrap} ${open && visible ? styles.visible : ''} ${
          fillCustomer ? styles.panelWrapWide : ''
        }`}
      >
        {open ? (
          <div className={styles.panel} role="dialog" aria-label={panelTitle}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>{panelTitle}</h2>
              <button type="button" className={styles.closeBtn} onClick={handleClose} aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </div>

            <div className={styles.statusRow}>
              <span
                className={`${styles.statusDot} ${
                  status === 'listening' ? styles.dotListening : status === 'processing' ? styles.dotProcessing : styles.dotIdle
                }`}
                aria-hidden
              />
              <span>{statusLabel}</span>
            </div>

            <div className={styles.body}>
              {fillCustomer && isRecording ? (
                <div className={styles.liveBox}>
                  <p className={styles.liveMeta}>Listening… {Math.floor(recMs / 1000)}s</p>
                  <p className={liveDisplay ? styles.liveText : styles.liveTextMuted}>
                    {liveDisplay ||
                      (liveCaption && voiceSupported
                        ? 'Live caption starting…'
                        : 'Release the mic to transcribe with Groq.')}
                  </p>
                  {liveCaption && voiceError ? <p className={styles.liveWarn}>Live caption: {voiceError}</p> : null}
                </div>
              ) : null}

              <div className={styles.micRow}>
                <button
                  type="button"
                  className={`${styles.micBtn} ${isRecording ? styles.recording : ''}`}
                  onClick={() => void toggleMic()}
                  disabled={isTranscribing}
                  aria-pressed={isRecording}
                  aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                >
                  {isRecording ? stopIcon : micIcon}
                </button>
              </div>

              <textarea
                ref={textareaRef}
                className={styles.textarea}
                value={transcript}
                onChange={e => setTranscript(e.target.value)}
                placeholder={
                  fillCustomer
                    ? 'Transcript + customer fields. Example: “Customer name John, phone 5551234567”.'
                    : 'Transcribed text appears here. You can edit it.'
                }
                aria-label="Transcript"
              />

              {fillCustomer ? (
                <div className={styles.actionRow}>
                  <button
                    type="button"
                    className={styles.textBtn}
                    disabled={!transcript.trim() || isTranscribing || isRecording}
                    onClick={() => void applyFromTranscript()}
                  >
                    Apply fields from transcript
                  </button>
                  <button
                    type="button"
                    className={styles.undoBtn}
                    disabled={!canUndoCustomerVoice || isTranscribing || isRecording}
                    onClick={undoCustomerVoice}
                  >
                    Undo last fill
                  </button>
                </div>
              ) : null}

              {error ? <p className={styles.error}>{error}</p> : null}
              <p className={styles.hint}>
                {fillCustomer
                  ? 'Live caption fills fields as you speak (partial words); Groq refines when you release the mic. API key stays on the server.'
                  : 'Audio is sent to your server, then to Groq for transcription. The API key is never exposed in the browser.'}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </>
  )

  return createPortal(ui, document.body)
}
