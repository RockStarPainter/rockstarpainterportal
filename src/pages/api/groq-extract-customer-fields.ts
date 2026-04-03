/**
 * Optional LLM fallback: structured customer fields from free-form speech text.
 * Uses GROQ_API_KEY server-side only.
 */

const GROQ_CHAT = 'https://api.groq.com/openai/v1/chat/completions'

const ALLOWED = new Set([
  'customer_name',
  'phone_number',
  'email',
  'address',
  'city',
  'state',
  'zip_code'
])

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])

    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return res.status(503).json({ error: 'GROQ_API_KEY is not configured' })
  }

  const text = typeof req.body?.text === 'string' ? req.body.text.trim().slice(0, 4000) : ''
  if (!text) {
    return res.status(400).json({ error: 'text is required' })
  }

  const model = process.env.GROQ_VOICE_LLM_MODEL || 'llama-3.1-8b-instant'

  const userPrompt = `Extract customer form fields from this spoken phrase. Return JSON only with shape {"commands":[{"field":"...","value":"..."}]}.
Allowed field keys only: customer_name, phone_number, email, address, city, state, zip_code.
Use snake_case keys. Omit fields you cannot infer. For phone store digits or common formatting. For state prefer 2-letter US if clear.

Text:
${text}`

  try {
    const groqRes = await fetch(GROQ_CHAT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        temperature: 0.1,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'You output only valid JSON. No markdown. The user message asks for field extraction; respond with {"commands":[]} or non-empty commands array.'
          },
          { role: 'user', content: userPrompt }
        ]
      })
    })

    const raw = await groqRes.text()
    if (!groqRes.ok) {
      let errMsg = 'Groq chat failed'
      try {
        const errBody = JSON.parse(raw) as { error?: { message?: string } }
        errMsg = errBody?.error?.message || errMsg
      } catch {
        /* ignore */
      }

      return res.status(502).json({ error: errMsg })
    }

    let outer: { choices?: { message?: { content?: string } }[] }
    try {
      outer = JSON.parse(raw) as { choices?: { message?: { content?: string } }[] }
    } catch {
      return res.status(502).json({ error: 'Invalid LLM response envelope' })
    }

    const content = String(outer?.choices?.[0]?.message?.content || '').trim()
    let parsed: { commands?: unknown }
    try {
      parsed = JSON.parse(content) as { commands?: unknown }
    } catch {
      return res.status(502).json({ error: 'LLM did not return valid JSON' })
    }

    const rawList = Array.isArray(parsed.commands) ? parsed.commands : []
    const commands: { field: string; value: string }[] = []
    for (const row of rawList) {
      if (!row || typeof row !== 'object') continue
      const field = String((row as any).field || '').trim()
      const value = String((row as any).value ?? '').trim()
      if (!ALLOWED.has(field) || !value) continue
      commands.push({ field, value })
    }

    return res.status(200).json({ commands })
  } catch (e: any) {
    console.error('groq-extract-customer-fields:', e?.message || e)

    return res.status(502).json({ error: e?.message || 'LLM request failed' })
  }
}
