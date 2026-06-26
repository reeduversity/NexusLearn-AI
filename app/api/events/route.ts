import { createClient } from '@/lib/supabase/server'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { z } from 'zod'

const eventSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  date: z.string(),
  location: z.string().optional()
})

export async function GET() {
  try {
    const supabase = await createClient()
    await validateSession(supabase)

    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true })

    if (error) throw error
    return apiResponse(events)
  } catch (error: any) {
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to fetch events', error.message === 'Unauthorized' ? 401 : 500)
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    await validateSession(supabase)

    const body = await req.json()
    const parsed = eventSchema.parse(body)

    const { data: event, error } = await supabase
      .from('events')
      .insert({
        title: parsed.title,
        description: parsed.description,
        date: parsed.date,
        location: parsed.location
      })
      .select()
      .single()

    if (error) throw error
    return apiResponse(event, 201)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiError(error.errors[0].message, 400)
    }
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to create event', error.message === 'Unauthorized' ? 401 : 500)
  }
}
