import { createClient } from '@/lib/supabase/server'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { TutorService } from '@/services/tutor.service'
import { z } from 'zod'

const tutorSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('concept'),
    question: z.string().min(1)
  }),
  z.object({
    type: z.literal('code'),
    code: z.string().min(1),
    errorMsg: z.string(),
    language: z.string().min(1)
  })
])

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const user = await validateSession(supabase)

    const body = await req.json()
    const parsed = tutorSchema.parse(body)

    let result = ''
    if (parsed.type === 'concept') {
      result = await TutorService.askConceptQuestion(parsed.question, user.id)
      
      // Log dialogue to chat_sessions
      await supabase.from('chat_sessions').insert({
        user_id: user.id,
        context_type: 'concept',
        messages: [
          { role: 'user', content: parsed.question },
          { role: 'assistant', content: result }
        ]
      })
    } else {
      result = await TutorService.debugCode(parsed.code, parsed.errorMsg, parsed.language)
      
      // Log dialogue to chat_sessions
      await supabase.from('chat_sessions').insert({
        user_id: user.id,
        context_type: 'code',
        messages: [
          { role: 'user', content: `Code: ${parsed.code}\nError: ${parsed.errorMsg}` },
          { role: 'assistant', content: result }
        ]
      })
    }

    return apiResponse({ response: result })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiError(error.errors[0].message, 400)
    }
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to query tutor service', error.message === 'Unauthorized' ? 401 : 500)
  }
}
