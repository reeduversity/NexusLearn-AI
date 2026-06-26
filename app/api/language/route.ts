import { createClient } from '@/lib/supabase/server'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { z } from 'zod'

const schema = z.object({
  text: z.string().min(1),
  targetLanguage: z.string()
})

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    await validateSession(supabase)

    const body = await req.json()
    const parsed = schema.parse(body)

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are an expert AI language tutor. The user is trying to learn ${parsed.targetLanguage}.
They just sent a sentence in either English or ${parsed.targetLanguage}.
Analyze their sentence. Return valid JSON only with the following keys:
{
  "translation": "The translation of their sentence to the target language (or English if they typed in the target language)",
  "correction": "Any grammar/spelling corrections if they tried to type in the target language. If perfect or in English, say 'Looks good!'",
  "reply": "A conversational reply in ${parsed.targetLanguage} to keep the conversation going."
}`
          },
          {
            role: 'user',
            content: parsed.text
          }
        ],
        response_format: { type: 'json_object' }
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to get response from Groq')
    }

    const data = await response.json()
    return apiResponse(JSON.parse(data.choices[0].message.content))
  } catch (error: any) {
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to process language request', error.message === 'Unauthorized' ? 401 : 500)
  }
}
