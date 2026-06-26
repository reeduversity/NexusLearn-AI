import { createClient } from '@/lib/supabase/server'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { ExamService } from '@/services/exam.service'
import { z } from 'zod'

const startMockSchema = z.object({
  course_id: z.string().min(1)
})

const gradeMockSchema = z.object({
  test_id: z.string().uuid(),
  answers: z.array(z.string())
})

const mockSchema = z.union([startMockSchema, gradeMockSchema])

export async function GET() {
  try {
    const supabase = await createClient()
    const user = await validateSession(supabase)

    const { data: tests, error } = await supabase
      .from('mock_tests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return apiResponse(tests)
  } catch (error: any) {
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to fetch mock tests', error.message === 'Unauthorized' ? 401 : 500)
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const user = await validateSession(supabase)

    const body = await req.json()
    const parsed = mockSchema.parse(body)

    if ('test_id' in parsed) {
      // Grade a mock test
      const { data: test, error: fetchError } = await supabase
        .from('mock_tests')
        .select('*')
        .eq('id', parsed.test_id)
        .eq('user_id', user.id)
        .single()

      if (fetchError || !test) throw new Error('Mock test not found')

      const questions = (test.content as any)?.questions || test.content || []
      let correctCount = 0

      questions.forEach((q: any, i: number) => {
        const userAnswer = parsed.answers[i]
        q.user_answer = userAnswer || ''
        if (userAnswer === q.ans) {
          correctCount++
        }
      })

      const score = Math.round((correctCount / questions.length) * 100)

      const { data: updatedTest, error: updateError } = await supabase
        .from('mock_tests')
        .update({
          content: { questions },
          score,
          status: 'completed'
        })
        .eq('id', parsed.test_id)
        .select()
        .single()

      if (updateError) throw updateError

      return apiResponse(updatedTest)
    } else {
      // Create a mock test
      const test = await ExamService.generateMockTest(user.id, parsed.course_id)
      return apiResponse(test, 201)
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiError(error.errors[0].message, 400)
    }
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : error.message || 'Failed to process mock test', error.message === 'Unauthorized' ? 401 : 500)
  }
}
