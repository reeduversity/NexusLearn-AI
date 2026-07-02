import { prisma } from '@/lib/prisma'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { z } from 'zod'

const quizSchema = z.object({ material_id: z.string().uuid().optional().nullable(), questions: z.any(), difficulty: z.string().optional(), language: z.string().optional() })

export async function GET() {
  try {
    const user = await validateSession()
    const quizzes = await prisma.quiz.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } })
    return apiResponse(quizzes)
  } catch (error: any) {
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : (error.message || 'Failed to fetch quizzes'), error.message === 'Unauthorized' ? 401 : 500)
  }
}

export async function POST(req: Request) {
  try {
    const user = await validateSession()
    const body = await req.json()
    const parsed = quizSchema.parse(body)
    const quiz = await prisma.quiz.create({ data: { userId: user.id, materialId: parsed.material_id || null, questions: parsed.questions, difficulty: parsed.difficulty, language: parsed.language } })
    return apiResponse(quiz, 201)
  } catch (error: any) {
    if (error instanceof z.ZodError) return apiError(error.errors[0].message, 400)
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : (error.message || 'Failed to save quiz'), error.message === 'Unauthorized' ? 401 : 500)
  }
}
