import { prisma } from '@/lib/prisma'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'

export async function GET() {
  try {
    await validateSession()
    const events = await prisma.event.findMany({ orderBy: { date: 'asc' } })
    return apiResponse(events)
  } catch (error: any) {
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to fetch events', error.message === 'Unauthorized' ? 401 : 500)
  }
}
