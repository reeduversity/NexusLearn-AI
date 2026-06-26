import { createClient } from '@/lib/supabase/server'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { z } from 'zod'

const resourceSchema = z.object({
  title: z.string().min(1),
  url: z.string().url(),
  type: z.string().optional()
})

export async function GET() {
  try {
    const supabase = await createClient()
    const user = await validateSession(supabase)

    const { data: resources, error } = await supabase
      .from('resources')
      .select('*, profiles(full_name)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return apiResponse(resources)
  } catch (error: any) {
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to fetch resources', error.message === 'Unauthorized' ? 401 : 500)
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const user = await validateSession(supabase)

    const body = await req.json()
    const parsed = resourceSchema.parse(body)

    const { data: resource, error } = await supabase
      .from('resources')
      .insert({
        user_id: user.id,
        title: parsed.title,
        url: parsed.url,
        type: parsed.type
      })
      .select()
      .single()

    if (error) throw error
    return apiResponse(resource, 201)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiError(error.errors[0].message, 400)
    }
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to add resource', error.message === 'Unauthorized' ? 401 : 500)
  }
}
