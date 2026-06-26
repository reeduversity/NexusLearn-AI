import { createClient } from '@/lib/supabase/server'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { z } from 'zod'

const schema = z.object({
  message: z.string().min(1),
  mood: z.string()
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
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `You are an empathetic, supportive, and non-judgmental student well-being coach. 
The student is feeling: ${parsed.mood}.
Keep your response short (2-3 sentences), warm, and encouraging. Offer a simple grounding technique if they are stressed.`
          },
          {
            role: 'user',
            content: parsed.message
          }
        ]
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to get response from Groq')
    }

    const data = await response.json()
    return apiResponse({ reply: data.choices[0].message.content })
  } catch (error: any) {
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to process message', error.message === 'Unauthorized' ? 401 : 500)
  }
}
