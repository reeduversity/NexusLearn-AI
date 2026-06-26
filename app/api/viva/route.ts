import { createClient } from '@/lib/supabase/server'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { z } from 'zod'

const startVivaSchema = z.object({
  topic: z.string().min(1)
})

const answerVivaSchema = z.object({
  session_id: z.string().uuid(),
  question_index: z.number().int().nonnegative(),
  answer: z.string().min(1)
})

const vivaSchema = z.union([startVivaSchema, answerVivaSchema])

export async function GET() {
  try {
    const supabase = await createClient()
    const user = await validateSession(supabase)

    const { data: sessions, error } = await supabase
      .from('viva_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return apiResponse(sessions)
  } catch (error: any) {
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to fetch viva sessions', error.message === 'Unauthorized' ? 401 : 500)
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const user = await validateSession(supabase)

    const body = await req.json()
    const parsed = vivaSchema.parse(body)

    if ('session_id' in parsed) {
      // User is submitting an answer to a question in a viva session
      const { data: session, error: fetchError } = await supabase
        .from('viva_sessions')
        .select('*')
        .eq('id', parsed.session_id)
        .eq('user_id', user.id)
        .single()

      if (fetchError || !session) throw new Error('Session not found')

      const questions = session.questions || []
      const currentQuestion = questions[parsed.question_index]

      if (!currentQuestion) {
        throw new Error('Question not found')
      }

      // Grade the answer using a mock AI evaluator
      const isCorrect = parsed.answer.toLowerCase().includes(currentQuestion.keyword || 'explain')
      const feedback = isCorrect 
        ? "Excellent answer. You correctly described the core concept."
        : `Your response was partial. Make sure to cover the background details and core definitions.`

      currentQuestion.user_answer = parsed.answer
      currentQuestion.feedback = feedback
      currentQuestion.graded_score = isCorrect ? 10 : 5

      const nextIndex = parsed.question_index + 1
      const isFinished = nextIndex >= questions.length

      let finalScore = session.score
      let status = session.status

      if (isFinished) {
        status = 'completed'
        const totalScore = questions.reduce((sum: number, q: any) => sum + (q.graded_score || 0), 0)
        finalScore = Math.round((totalScore / (questions.length * 10)) * 100)
      }

      const { data: updatedSession, error: updateError } = await supabase
        .from('viva_sessions')
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
        feedback,
        is_finished: isFinished,
        next_index: nextIndex
      })
    } else {
      // Starting a new viva session
      const mockQuestions = [
        { q: `Explain the key difference between a stack and a queue in Memory Management.`, keyword: 'lifo' },
        { q: `What is the time complexity of searching in a binary search tree in the worst case?`, keyword: 'log' },
        { q: `Explain how a hash collision is handled in databases.`, keyword: 'chaining' }
      ]

      const { data: session, error } = await supabase
        .from('viva_sessions')
        .insert({
          user_id: user.id,
          topic: parsed.topic,
          questions: mockQuestions,
          score: null,
          status: 'in_progress'
        })
        .select()
        .single()

      if (error) throw error
      return apiResponse(session, 201)
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiError(error.errors[0].message, 400)
    }
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : error.message || 'Failed to process viva request', error.message === 'Unauthorized' ? 401 : 500)
  }
}
