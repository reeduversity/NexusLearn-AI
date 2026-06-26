import { createClient } from '@/lib/supabase/server'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { z } from 'zod'

const materialSchema = z.object({
  course_id: z.string().uuid(),
  title: z.string().min(1),
  type: z.enum(['pdf', 'video', 'docx']),
  url: z.string().url()
})

export async function GET() {
  try {
    const supabase = await createClient()
    const user = await validateSession(supabase)

    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return apiResponse(data)
  } catch (error: any) {
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to fetch materials', error.message === 'Unauthorized' ? 401 : 500)
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const user = await validateSession(supabase)

    const body = await req.json()
    const parsed = materialSchema.parse(body)

    const { data, error } = await supabase
      .from('materials')
      .insert({
        user_id: user.id,
        course_id: parsed.course_id,
        title: parsed.title,
        type: parsed.type,
        url: parsed.url,
        status: 'uploaded'
      })
      .select()
      .single()

    if (error) throw error
    return apiResponse(data, 201)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiError(error.errors[0].message, 400)
    }
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to upload material', error.message === 'Unauthorized' ? 401 : 500)
  }
}
