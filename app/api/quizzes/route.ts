import { createClient } from '@/lib/supabase/server'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { AnalyticsService } from '@/services/analytics.service'
import { z } from 'zod'

const quizAttemptSchema = z.object({
  topic: z.string().min(1),
  score: z.number().int().nonnegative(),
  max_score: z.number().int().positive()
})

export async function GET() {
  try {
    const supabase = await createClient()
    const user = await validateSession(supabase)

    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return apiResponse(data)
  } catch (error: any) {
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to fetch quiz attempts', error.message === 'Unauthorized' ? 401 : 500)
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const user = await validateSession(supabase)

    const body = await req.json()
    const parsed = quizAttemptSchema.parse(body)

    const { data, error } = await supabase
      .from('quiz_attempts')
      .insert({
        user_id: user.id,
        topic: parsed.topic,
        score: parsed.score,
        max_score: parsed.max_score
      })
      .select()
      .single()

    if (error) throw error

    // Triggers weakness analytics recalculation asynchronously or inline
    await AnalyticsService.calculateWeaknesses(user.id).catch(err => {
      console.error('Failed to calculate weaknesses:', err)
    })

    return apiResponse(data, 201)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiError(error.errors[0].message, 400)
    }
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to save quiz attempt', error.message === 'Unauthorized' ? 401 : 500)
  }
}
