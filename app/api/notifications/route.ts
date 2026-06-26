import { createClient } from '@/lib/supabase/server'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { z } from 'zod'

const markReadSchema = z.object({
  id: z.string().uuid().optional(),
  all: z.boolean().optional()
})

export async function GET() {
  try {
    const supabase = await createClient()
    const user = await validateSession(supabase)

    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return apiResponse(notifications)
  } catch (error: any) {
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to fetch notifications', error.message === 'Unauthorized' ? 401 : 500)
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const user = await validateSession(supabase)

    const body = await req.json()
    const parsed = markReadSchema.parse(body)

    let query = supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id)

    if (parsed.id) {
      query = query.eq('id', parsed.id)
    } else if (!parsed.all) {
      return apiError('Missing id or all flag', 400)
    }

    const { data, error } = await query.select()
    if (error) throw error

    return apiResponse(data)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiError(error.errors[0].message, 400)
    }
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to update notification', error.message === 'Unauthorized' ? 401 : 500)
  }
}
