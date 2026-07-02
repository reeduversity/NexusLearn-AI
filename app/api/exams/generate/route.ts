import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { ExamService } from '@/services/exam.service'
import { z } from 'zod'

const examSchema = z.object({ text: z.string().min(1), difficulty: z.string().optional(), language: z.string().optional() })

export async function POST(req: Request) {
  try {
    const user = await validateSession()
    const body = await req.json()
    const parsed = examSchema.parse(body)
    const result = await ExamService.generateExamFromDocument(parsed.text, { difficulty: parsed.difficulty || 'medium', language: parsed.language || 'english' }, user.id)
    return apiResponse(result)
  } catch (error: any) {
    if (error instanceof z.ZodError) return apiError(error.errors[0].message, 400)
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : (error.message || 'Failed to generate exam'), error.message === 'Unauthorized' ? 401 : 500)
  }
}
