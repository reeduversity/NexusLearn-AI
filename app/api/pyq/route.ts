import { prisma } from '@/lib/prisma'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { z } from 'zod'

const pyqSchema = z.object({ course_id: z.string().optional(), content: z.string().min(1), year: z.number().int(), topic_tags: z.array(z.string()).optional() })

export async function GET() {
  try {
    const user = await validateSession()
    const papers = await prisma.pyqPaper.findMany({ where: { userId: user.id }, orderBy: { year: 'desc' } })
    return apiResponse(papers)
  } catch (error: any) {
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to fetch PYQs', error.message === 'Unauthorized' ? 401 : 500)
  }
}

export async function POST(req: Request) {
  try {
    const user = await validateSession()
    const body = await req.json()
    const parsed = pyqSchema.parse(body)
    const paper = await prisma.pyqPaper.create({ data: { userId: user.id, courseId: parsed.course_id, content: parsed.content, year: parsed.year, topicTags: parsed.topic_tags || [] } })
    return apiResponse(paper, 201)
  } catch (error: any) {
    if (error instanceof z.ZodError) return apiError(error.errors[0].message, 400)
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to save PYQ', error.message === 'Unauthorized' ? 401 : 500)
  }
}
