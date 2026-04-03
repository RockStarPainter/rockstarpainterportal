import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

type SpeechRec = {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((ev: any) => void) | null
  onerror: ((ev: any) => void) | null
  onend: (() => void) | null
}

export interface UseVoiceOptions {
  /**
   * Called synchronously on each speech recognition result (final + interim chunks).
   * Use for sub-100ms streaming parsers; not batched with React state.
   */
  onLiveCombined?: (combined: string) => void
}

export interface UseVoiceResult {
  supported: boolean
  isListening: boolean
  transcript: string
  interimTranscript: string
  error: string | null
  start: () => Promise<void>
  stop: () => void

  /** Clears accumulated final + interim text (e.g. after a live field apply). */
  clearTranscript: () => void
}

function getRecognitionCtor(): (new () => SpeechRec) | null {
  if (typeof window === 'undefined') return null
  const w = window as any
  
return w.SpeechRecognition || w.webkitSpeechRecognition || null
}

export function useVoice(lang = 'en-US', options?: UseVoiceOptions): UseVoiceResult {
  const [supported, setSupported] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)

  const recRef = useRef<SpeechRec | null>(null)
  const wantSessionRef = useRef(false)
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const transcriptRef = useRef('')
  const onLiveCombinedRef = useRef<UseVoiceOptions['onLiveCombined']>(options?.onLiveCombined)
  const beginRecognitionRef = useRef<() => void>(() => {
    /* set in useLayoutEffect */
  })

  useLayoutEffect(() => {
    onLiveCombinedRef.current = options?.onLiveCombined
  }, [options?.onLiveCombined])

  useEffect(() => {
    setSupported(Boolean(getRecognitionCtor()))
  }, [])

  const clearRestartTimer = () => {
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current)
      restartTimerRef.current = null
    }
  }

  const beginRecognition = useCallback(() => {
    const Ctor = getRecognitionCtor()
    if (!Ctor || !wantSessionRef.current) return

    const rec = new Ctor()
    rec.lang = lang
    rec.continuous = true
    rec.interimResults = true
    rec.maxAlternatives = 1

    rec.onresult = (event: any) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const piece = String(result[0]?.transcript ?? '')
        if (result.isFinal) {
          const chunk = piece.trim()
          if (chunk) {
            transcriptRef.current = transcriptRef.current
              ? `${transcriptRef.current} ${chunk}`.trim()
              : chunk
          }
        } else {
          interim += piece
        }
      }
      const interimTrim = interim.trim()
      setTranscript(transcriptRef.current)
      setInterimTranscript(interimTrim)
      const combined = [transcriptRef.current, interimTrim].filter(Boolean).join(' ').trim()
      onLiveCombinedRef.current?.(combined)
    }

    rec.onerror = (ev: any) => {
      const code = ev?.error ? String(ev.error) : 'recognition error'
      if (code === 'aborted') return
      if (code === 'no-speech') return

      let message = code
      if (code === 'not-allowed') {
        message = 'Microphone blocked. Allow mic for this site (address bar → site settings).'
      } else if (code === 'audio-capture') {
        message = 'No microphone found or it is in use by another app.'
      } else if (code === 'service-not-allowed') {
        message = 'Speech not allowed. Use Chrome or Edge over HTTPS (or http://localhost).'
      } else if (code === 'network') {
        message = 'Speech recognition network error. Check your connection (Google STT is used in Chrome).'
      } else if (code === 'language-not-supported') {
        message = 'Language not supported for speech recognition.'
      }
      setError(message)
    }

    rec.onend = () => {
      recRef.current = null
      if (!wantSessionRef.current) {
        setIsListening(false)
        setInterimTranscript('')
        
return
      }
      restartTimerRef.current = setTimeout(() => {
        restartTimerRef.current = null
        if (!wantSessionRef.current) return
        try {
          beginRecognitionRef.current()
        } catch {
          setError('Could not restart listening')
          wantSessionRef.current = false
          setIsListening(false)
        }
      }, 350)
    }

    try {
      recRef.current = rec
      rec.start()
    } catch {
      setError('Could not start microphone')
      wantSessionRef.current = false
      setIsListening(false)
    }
  }, [lang])

  useLayoutEffect(() => {
    beginRecognitionRef.current = beginRecognition
  }, [beginRecognition])

  const clearTranscript = useCallback(() => {
    transcriptRef.current = ''
    setTranscript('')
    setInterimTranscript('')
  }, [])

  const stop = useCallback(() => {
    wantSessionRef.current = false
    clearRestartTimer()
    try {
      recRef.current?.stop?.()
    } catch {
      /* ignore */
    }
    recRef.current = null
    setIsListening(false)
    setInterimTranscript('')
  }, [])

  const start = useCallback(async () => {
    if (!getRecognitionCtor()) {
      setError('Speech recognition is not supported. Use Chrome or Edge.')
      
return
    }
    setError(null)

    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true })
      } catch {
        setError('Microphone permission denied. Allow the microphone when the browser prompts.')
        
return
      }
    }

    wantSessionRef.current = true
    clearRestartTimer()
    try {
      if (recRef.current) {
        try {
          recRef.current.abort?.()
        } catch {
          /* ignore */
        }
        recRef.current = null
      }
      beginRecognition()
      setIsListening(true)
    } catch {
      wantSessionRef.current = false
      setError('Could not start microphone')
      setIsListening(false)
    }
  }, [beginRecognition])

  useEffect(() => {
    return () => {
      wantSessionRef.current = false
      clearRestartTimer()
      try {
        recRef.current?.abort?.()
      } catch {
        /* ignore */
      }
      recRef.current = null
    }
  }, [])

  return { supported, isListening, transcript, interimTranscript, error, start, stop, clearTranscript }
}
