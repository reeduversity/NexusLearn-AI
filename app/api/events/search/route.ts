import { createClient } from '@/lib/supabase/server'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { EventsService } from '@/services/events.service'
import { z } from 'zod'

const schema = z.object({
  query: z.string().min(2),
  events: z.array(z.any())
})

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    await validateSession(supabase)

    const body = await req.json()
    const parsed = schema.parse(body)

    const matchedIds = await EventsService.filterEvents(parsed.query, parsed.events)

    return apiResponse(matchedIds)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiError(error.errors[0].message, 400)
    }
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to search events', error.message === 'Unauthorized' ? 401 : 500)
  }
}
