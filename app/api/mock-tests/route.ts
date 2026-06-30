import { prisma } from '@/lib/prisma'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { ExamService } from '@/services/exam.service'
import { z } from 'zod'

const generateSchema = z.object({ course_id: z.string().min(1) })

export async function GET() {
  try {
    const user = await validateSession()
    const tests = await prisma.mockTest.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } })
    return apiResponse(tests)
  } catch (error: any) {
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to fetch mock tests', error.message === 'Unauthorized' ? 401 : 500)
  }
}

export async function POST(req: Request) {
  try {
    const user = await validateSession()
    const body = await req.json()
    const parsed = generateSchema.parse(body)
    const test = await ExamService.generateMockTest(user.id, parsed.course_id)
    return apiResponse(test, 201)
  } catch (error: any) {
    if (error instanceof z.ZodError) return apiError(error.errors[0].message, 400)
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to generate mock test', error.message === 'Unauthorized' ? 401 : 500)
  }
}
