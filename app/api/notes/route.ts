import { createClient } from '@/lib/supabase/server'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { z } from 'zod'

const noteSchema = z.object({
  material_id: z.string().uuid().optional().nullable(),
  title: z.string().min(1),
  content: z.string().min(1)
})

export async function GET() {
  try {
    const supabase = await createClient()
    const user = await validateSession(supabase)

    const { data, error } = await supabase
      .from('notes')
      .select('id, material_id, title, content, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return apiResponse(data)
  } catch (error: any) {
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to fetch notes', error.message === 'Unauthorized' ? 401 : 500)
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const user = await validateSession(supabase)

    const body = await req.json()
    const parsed = noteSchema.parse(body)

    const { data, error } = await supabase
      .from('notes')
      .insert({
        user_id: user.id,
        material_id: parsed.material_id,
        title: parsed.title,
        content: parsed.content
      })
      .select()
      .single()

    if (error) throw error
    return apiResponse(data, 201)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiError(error.errors[0].message, 400)
    }
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to save note', error.message === 'Unauthorized' ? 401 : 500)
  }
}
