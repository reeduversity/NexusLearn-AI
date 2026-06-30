import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { PlannerService } from '@/services/planner.service'
import { z } from 'zod'

const plannerSchema = z.object({ text: z.string().min(1), target_date: z.string().min(1) })

export async function POST(req: Request) {
  try {
    const user = await validateSession()
    const body = await req.json()
    const parsed = plannerSchema.parse(body)
    const result = await PlannerService.autoPlanSyllabus(parsed.text, user.id, parsed.target_date)
    return apiResponse(result)
  } catch (error: any) {
    if (error instanceof z.ZodError) return apiError(error.errors[0].message, 400)
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to generate plan', error.message === 'Unauthorized' ? 401 : 500)
  }
}
