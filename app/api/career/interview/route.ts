import { prisma } from '@/lib/prisma'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { CareerService } from '@/services/career.service'
import { z } from 'zod'

const interviewSchema = z.object({ role: z.string().min(1), question: z.string().min(1) })

export async function POST(req: Request) {
  try {
    const user = await validateSession()
    const body = await req.json()
    const parsed = interviewSchema.parse(body)
    const result = await CareerService.conductMockInterview(parsed.role, parsed.question)

    await prisma.interviewSession.create({
      data: { userId: user.id, role: parsed.role, questions: [{ q: parsed.question, ...result }], score: result.score, status: 'completed' },
    })

    return apiResponse(result)
  } catch (error: any) {
    if (error instanceof z.ZodError) return apiError(error.errors[0].message, 400)
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : (error.message || 'Failed to conduct interview'), error.message === 'Unauthorized' ? 401 : 500)
  }
}
