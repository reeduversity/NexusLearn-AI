import { prisma } from '@/lib/prisma'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'

export async function GET() {
  try {
    const user = await validateSession()
    const weaknesses = await prisma.weakness.findMany({ where: { userId: user.id, status: 'active' }, orderBy: { currentStrength: 'asc' } })
    const notes = await prisma.note.findMany({ where: { userId: user.id }, select: { id: true, title: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: 10 })
    return apiResponse({ weaknesses, notes })
  } catch (error: any) {
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to fetch revision data', error.message === 'Unauthorized' ? 401 : 500)
  }
}

export async function POST(req: Request) {
  try {
    const user = await validateSession()
    const body = await req.json()
    await prisma.studySession.create({ data: { userId: user.id, durationMinutes: body.duration_minutes || 30 } })
    return apiResponse({ success: true }, 201)
  } catch (error: any) {
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to log revision session', error.message === 'Unauthorized' ? 401 : 500)
  }
}
