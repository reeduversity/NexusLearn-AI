import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { z } from 'zod'

const translateSchema = z.object({ text: z.string().min(1), target_language: z.string().min(1) })

export async function POST(req: Request) {
  try {
    await validateSession()
    const body = await req.json()
    const parsed = translateSchema.parse(body)
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST', headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'llama-3.1-8b-instant', messages: [{ role: 'system', content: `Translate the following text to ${parsed.target_language}. Return ONLY the translation.` }, { role: 'user', content: parsed.text }] }),
    })
    const data = await response.json()
    return apiResponse({ translation: data.choices[0].message.content })
  } catch (error: any) {
    if (error instanceof z.ZodError) return apiError(error.errors[0].message, 400)
    return apiError('Failed to translate', 500)
  }
}
