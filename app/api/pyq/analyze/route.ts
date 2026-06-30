import { prisma } from '@/lib/prisma'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { PyqService } from '@/services/pyq.service'

export async function POST(req: Request) {
  try {
    const user = await validateSession()
    const body = await req.json()
    const courseId = body.course_id
    const papers = await prisma.pyqPaper.findMany({ where: { userId: user.id, ...(courseId ? { courseId } : {}) }, select: { content: true } })
    const texts = papers.map(p => p.content).filter(Boolean) as string[]
    if (texts.length === 0) return apiError('No PYQ papers found to analyze', 400)
    const result = await PyqService.analyzePyqs(texts)
    return apiResponse(result)
  } catch (error: any) {
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to analyze PYQs', error.message === 'Unauthorized' ? 401 : 500)
  }
}
