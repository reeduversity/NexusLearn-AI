import { createClient } from '@/lib/supabase/server'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { InterviewService } from '@/services/interview.service'
import { z } from 'zod'

const interviewSchema = z.object({
  question: z.string().min(1),
  transcript: z.string().min(1)
})

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const user = await validateSession(supabase)

    const body = await req.json()
    const parsed = interviewSchema.parse(body)

    const feedback = await InterviewService.analyzeResponse(parsed.question, parsed.transcript)

    // Log to interview_sessions
    await supabase.from('interview_sessions').insert({
      user_id: user.id,
      session_data: {
        question: parsed.question,
        transcript: parsed.transcript,
        feedback: feedback
      }
    })

    return apiResponse(feedback)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiError(error.errors[0].message, 400)
    }
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to analyze interview', error.message === 'Unauthorized' ? 401 : 500)
  }
}
