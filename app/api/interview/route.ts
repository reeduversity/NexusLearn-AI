import { prisma } from '@/lib/prisma'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { InterviewService } from '@/services/interview.service'
import { z } from 'zod'

const feedbackSchema = z.object({ question: z.string().min(1), transcript: z.string().min(1) })

export async function POST(req: Request) {
  try {
    const user = await validateSession()
    const body = await req.json()
    const parsed = feedbackSchema.parse(body)
    const result = await InterviewService.analyzeResponse(parsed.question, parsed.transcript)
    return apiResponse(result)
  } catch (error: any) {
    if (error instanceof z.ZodError) return apiError(error.errors[0].message, 400)
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to analyze interview', error.message === 'Unauthorized' ? 401 : 500)
  }
}
