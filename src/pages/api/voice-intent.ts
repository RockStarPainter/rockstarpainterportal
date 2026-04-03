import { parseVoiceIntentText } from 'src/lib/voiceIntent/parseVoiceIntent'

const MAX_TEXT = 4000

export default function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])

    return res.status(405).json({ error: 'Method not allowed' })
  }

  const text = typeof req.body?.text === 'string' ? req.body.text : typeof req.body === 'string' ? req.body : ''
  const trimmed = text.trim().slice(0, MAX_TEXT)

  if (!trimmed) {
    return res.status(400).json({ error: 'text is required' })
  }

  try {
    const result = parseVoiceIntentText(trimmed)

    return res.status(200).json(result)
  } catch (e) {
    console.error('voice-intent:', e)

    return res.status(500).json({ error: 'intent parse failed' })
  }
}
