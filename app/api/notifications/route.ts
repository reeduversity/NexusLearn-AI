import { prisma } from '@/lib/prisma'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { z } from 'zod'

const markReadSchema = z.object({ id: z.string().uuid().optional(), all: z.boolean().optional() })

export async function GET() {
  try {
    const user = await validateSession()
    const notifications = await prisma.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } })
    return apiResponse(notifications)
  } catch (error: any) {
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to fetch notifications', error.message === 'Unauthorized' ? 401 : 500)
  }
}

export async function POST(req: Request) {
  try {
    const user = await validateSession()
    const body = await req.json()
    const parsed = markReadSchema.parse(body)
    if (parsed.id) {
      await prisma.notification.update({ where: { id: parsed.id, userId: user.id }, data: { isRead: true } })
    } else if (parsed.all) {
      await prisma.notification.updateMany({ where: { userId: user.id }, data: { isRead: true } })
    } else {
      return apiError('Missing id or all flag', 400)
    }
    const updated = await prisma.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } })
    return apiResponse(updated)
  } catch (error: any) {
    if (error instanceof z.ZodError) return apiError(error.errors[0].message, 400)
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to update notification', error.message === 'Unauthorized' ? 401 : 500)
  }
}
