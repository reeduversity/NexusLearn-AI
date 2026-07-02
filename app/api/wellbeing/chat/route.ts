import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { WellbeingService } from '@/services/wellbeing.service'
import { z } from 'zod'

const chatSchema = z.object({ message: z.string().min(1) })

export async function POST(req: Request) {
  try {
    const user = await validateSession()
    const body = await req.json()
    const parsed = chatSchema.parse(body)
    const reply = await WellbeingService.getWellbeingAdvice(user.id, parsed.message)
    return apiResponse({ reply })
  } catch (error: any) {
    if (error instanceof z.ZodError) return apiError(error.errors[0].message, 400)
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : (error.message || 'Failed to get wellbeing advice'), error.message === 'Unauthorized' ? 401 : 500)
  }
}
