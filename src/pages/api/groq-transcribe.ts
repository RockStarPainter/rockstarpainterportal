/**
 * Server-side proxy for Groq OpenAI-compatible speech-to-text.
 * Keeps GROQ_API_KEY out of the browser; never log the key or full audio.
 *
 * Transcription language: ISO 639-1 (e.g. en). Defaults to English when GROQ_STT_LANGUAGE is unset.
 * Set GROQ_STT_LANGUAGE= (empty) to omit the field and let Groq auto-detect (multilingual).
 */

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb'
    }
  }
}

const GROQ_TRANSCRIPTIONS = 'https://api.groq.com/openai/v1/audio/transcriptions'
const MAX_BASE64_CHARS = 28_000_000

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])

    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return res.status(503).json({
      error: 'GROQ_API_KEY is not configured on the server. Add it to your environment (e.g. .env).'
    })
  }

  const { audioBase64, mimeType } = req.body || {}
  if (!audioBase64 || typeof audioBase64 !== 'string') {
    return res.status(400).json({ error: 'audioBase64 is required' })
  }
  if (audioBase64.length > MAX_BASE64_CHARS) {
    return res.status(413).json({ error: 'Audio payload too large' })
  }

  const model = process.env.GROQ_STT_MODEL || 'whisper-large-v3-turbo'
  const langRaw =
    process.env.GROQ_STT_LANGUAGE !== undefined ? process.env.GROQ_STT_LANGUAGE.trim() : 'en'
  const langCode =
    langRaw.length >= 2 ? langRaw.split(/[-_]/)[0]!.toLowerCase().slice(0, 2) : ''
  const safeMime = typeof mimeType === 'string' && mimeType.startsWith('audio/') ? mimeType : 'audio/webm'

  let buffer: Buffer
  try {
    buffer = Buffer.from(audioBase64, 'base64')
  } catch {
    return res.status(400).json({ error: 'Invalid base64 audio' })
  }

  if (buffer.length < 100) {
    return res.status(400).json({ error: 'Audio too short or empty' })
  }

  const ext = safeMime.includes('wav') ? 'wav' : safeMime.includes('mp4') ? 'm4a' : 'webm'
  const filename = `recording.${ext}`

  // Native FormData lets fetch set multipart boundaries correctly (Node 18+).
  const form = new FormData()
  form.append('model', model)
  form.append('response_format', 'json')
  if (/^[a-z]{2}$/i.test(langCode)) {
    form.append('language', langCode.toLowerCase())
  }
  form.append('file', new Blob([new Uint8Array(buffer)], { type: safeMime }), filename)

  try {
    const groqRes = await fetch(GROQ_TRANSCRIPTIONS, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`
      },
      body: form
    })

    const raw = await groqRes.text()
    let parsed: { text?: string; error?: { message?: string } }
    try {
      parsed = JSON.parse(raw) as { text?: string; error?: { message?: string } }
    } catch {
      return res.status(502).json({ error: 'Invalid response from transcription service' })
    }

    if (!groqRes.ok) {
      const msg = parsed?.error?.message || raw.slice(0, 200) || `Groq error (${groqRes.status})`

      return res.status(groqRes.status >= 400 && groqRes.status < 600 ? groqRes.status : 502).json({
        error: msg
      })
    }

    const text = typeof parsed.text === 'string' ? parsed.text.trim() : ''

    return res.status(200).json({ text })
  } catch (e: any) {
    console.error('groq-transcribe:', e?.message || e)

    return res.status(502).json({ error: e?.message || 'Transcription request failed' })
  }
}
