import { useCallback, useRef, useState } from 'react'
import axios from 'axios'

function pickMimeType(): string {
  if (typeof MediaRecorder === 'undefined') return 'audio/webm'
  const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4']
  for (const t of types) {
    if (MediaRecorder.isTypeSupported(t)) return t
  }
  
return 'audio/webm'
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onloadend = () => {
      const s = String(r.result || '')
      const i = s.indexOf(',')
      resolve(i >= 0 ? s.slice(i + 1) : s)
    }
    r.onerror = () => reject(new Error('read failed'))
    r.readAsDataURL(blob)
  })
}

export interface UseGroqSpeechRecorderResult {
  isRecording: boolean
  isTranscribing: boolean
  error: string | null
  clearError: () => void
  startRecording: () => Promise<void>

  /** Stops capture, uploads to /api/groq-transcribe, returns trimmed text or null on failure */
  stopRecording: () => Promise<string | null>
}

/**
 * Records from the mic and sends audio to the Next.js Groq proxy (no API key on the client).
 */
export function useGroqSpeechRecorder(): UseGroqSpeechRecorderResult {
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mediaRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])

  const clearError = useCallback(() => setError(null), [])

  const startRecording = useCallback(async () => {
    setError(null)
    if (typeof MediaRecorder === 'undefined') {
      setError('Recording is not supported in this browser.')
      
return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRef.current = stream
      chunksRef.current = []
      const mimeType = pickMimeType()
      const rec = new MediaRecorder(stream, { mimeType })
      recorderRef.current = rec
      rec.ondataavailable = e => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      rec.start(250)
      setIsRecording(true)
    } catch {
      setError('Microphone permission denied or no microphone available.')
    }
  }, [])

  const stopRecording = useCallback(async (): Promise<string | null> => {
    const rec = recorderRef.current
    const stream = mediaRef.current
    recorderRef.current = null
    mediaRef.current = null
    if (!rec) {
      setIsRecording(false)
      
return null
    }

    return new Promise(resolve => {
      rec.onstop = async () => {
        stream?.getTracks().forEach(t => t.stop())
        setIsRecording(false)
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || 'audio/webm' })
        chunksRef.current = []
        if (blob.size < 200) {
          setError('Recording was too short. Hold the mic a little longer.')
          resolve(null)
          
return
        }
        setIsTranscribing(true)
        setError(null)
        try {
          const audioBase64 = await blobToBase64(blob)
          const { data } = await axios.post<{ text?: string; error?: string }>('/api/groq-transcribe', {
            audioBase64,
            mimeType: blob.type || 'audio/webm'
          })
          if (data.error) {
            setError(data.error)
            resolve(null)
            
return
          }
          const text = (data.text || '').trim()
          if (!text) {
            setError('No speech detected. Try speaking closer to the microphone.')
            resolve(null)
            
return
          }
          resolve(text)
        } catch (e: any) {
          const msg = e?.response?.data?.error || e?.message || 'Transcription failed'
          setError(String(msg))
          resolve(null)
        } finally {
          setIsTranscribing(false)
        }
      }
      try {
        rec.stop()
      } catch {
        setIsRecording(false)
        setIsTranscribing(false)
        resolve(null)
      }
    })
  }, [])

  return {
    isRecording,
    isTranscribing,
    error,
    clearError,
    startRecording,
    stopRecording
  }
}
