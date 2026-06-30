import { prisma } from '@/lib/prisma'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { EventsService } from '@/services/events.service'

export async function GET(req: Request) {
  try {
    await validateSession()
    const url = new URL(req.url)
    const query = url.searchParams.get('q') || ''
    const events = await prisma.event.findMany({ orderBy: { date: 'asc' } })
    if (!query) return apiResponse(events)
    const matchedIds = await EventsService.filterEvents(query, events)
    const filtered = events.filter((e: any) => matchedIds.includes(e.id))
    return apiResponse(filtered)
  } catch (error: any) {
    return apiError('Failed to search events', 500)
  }
}
