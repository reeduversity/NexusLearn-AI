import { createClient } from '@/lib/supabase/server'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { CareerService } from '@/services/career.service'
import { z } from 'zod'

const startInterviewSchema = z.object({
  action: z.literal('start'),
  role: z.string().min(1)
})

const answerInterviewSchema = z.object({
  action: z.literal('answer'),
  session_id: z.string().uuid(),
  question_index: z.number().int().nonnegative(),
  answer: z.string().min(1)
})

const interviewSchema = z.union([startInterviewSchema, answerInterviewSchema])

export async function GET() {
  try {
    const supabase = await createClient()
    const user = await validateSession(supabase)

    const { data: sessions, error } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return apiResponse(sessions)
  } catch (error: any) {
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to fetch interview history', error.message === 'Unauthorized' ? 401 : 500)
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const user = await validateSession(supabase)

    const body = await req.json()
    const parsed = interviewSchema.parse(body)

    if (parsed.action === 'start') {
      const mockQuestions = [
        { q: `Tell me about a challenging engineering project you worked on and how you resolved technical trade-offs.` },
        { q: `How do you approach optimizing performance in web applications?` },
        { q: `Explain how you handle conflicts within a software engineering team.` }
      ]

      const { data: session, error } = await supabase
        .from('interview_sessions')
        .insert({
          user_id: user.id,
          role: parsed.role,
          questions: mockQuestions,
          status: 'in_progress',
          score: null
        })
        .select()
        .single()

      if (error) throw error

      return apiResponse(session, 201)
    } else {
      const { data: session, error: fetchError } = await supabase
        .from('interview_sessions')
        .select('*')
        .eq('id', parsed.session_id)
        .eq('user_id', user.id)
        .single()

      if (fetchError || !session) throw new Error('Session not found')

      const questions = session.questions || []
      const currentQuestion = questions[parsed.question_index]

      if (!currentQuestion) throw new Error('Question not found')

      const aiResponse = await CareerService.conductMockInterview(
        session.role,
        `Question: ${currentQuestion.q}\nCandidate Answer: ${parsed.answer}`
      )

      currentQuestion.user_answer = parsed.answer
      currentQuestion.feedback = aiResponse.feedback
      currentQuestion.score = aiResponse.score

      const nextIndex = parsed.question_index + 1
      const isFinished = nextIndex >= questions.length

      let finalScore = session.score
      let status = session.status

      if (isFinished) {
        status = 'completed'
        const totalScore = questions.reduce((sum: number, q: any) => sum + (q.score || 0), 0)
        finalScore = Math.round((totalScore / (questions.length * 10)) * 100)
      }

      const { data: updatedSession, error: updateError } = await supabase
        .from('interview_sessions')
        .update({
          questions,
          score: finalScore,
          status
        })
        .eq('id', parsed.session_id)
        .select()
        .single()

      if (updateError) throw updateError

      return apiResponse({
        session: updatedSession,
        feedback: aiResponse.feedback,
        follow_up: aiResponse.follow_up_question || (isFinished ? null : questions[nextIndex].q),
        is_finished: isFinished
      })
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiError(error.errors[0].message, 400)
    }
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : error.message || 'Failed to process interview response', error.message === 'Unauthorized' ? 401 : 500)
  }
}
