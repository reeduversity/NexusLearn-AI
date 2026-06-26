import { createClient } from '@/lib/supabase/server'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { z } from 'zod'

const wellbeingSchema = z.object({
  mood: z.number().int().min(1).max(5),
  energy: z.number().int().min(1).max(5),
  notes: z.string().optional()
})

export async function GET() {
  try {
    const supabase = await createClient()
    const user = await validateSession(supabase)

    const { data: logs, error } = await supabase
      .from('wellbeing_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return apiResponse(logs)
  } catch (error: any) {
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to fetch wellbeing logs', error.message === 'Unauthorized' ? 401 : 500)
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const user = await validateSession(supabase)

    const body = await req.json()
    const parsed = wellbeingSchema.parse(body)

    const { data: log, error } = await supabase
      .from('wellbeing_logs')
      .insert({
        user_id: user.id,
        mood: parsed.mood,
        energy: parsed.energy,
        notes: parsed.notes
      })
      .select()
      .single()

    if (error) throw error
    return apiResponse(log, 201)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiError(error.errors[0].message, 400)
    }
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to save wellbeing log', error.message === 'Unauthorized' ? 401 : 500)
  }
}
