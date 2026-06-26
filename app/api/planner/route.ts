import { createClient } from '@/lib/supabase/server'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { PlannerService } from '@/services/planner.service'
import { z } from 'zod'

const plannerSchema = z.object({
  syllabus_text: z.string().min(1),
  target_date: z.string()
})

export async function GET() {
  try {
    const supabase = await createClient()
    const user = await validateSession(supabase)

    const { data: plans, error } = await supabase
      .from('study_plans')
      .select('*, assignments(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return apiResponse(plans)
  } catch (error: any) {
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to fetch study plans', error.message === 'Unauthorized' ? 401 : 500)
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const user = await validateSession(supabase)

    const body = await req.json()
    const parsed = plannerSchema.parse(body)

    const plan = await PlannerService.autoPlanSyllabus(parsed.syllabus_text, user.id, parsed.target_date)
    return apiResponse(plan, 201)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiError(error.errors[0].message, 400)
    }
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to generate study plan', error.message === 'Unauthorized' ? 401 : 500)
  }
}
