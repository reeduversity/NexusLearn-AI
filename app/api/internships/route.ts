import { createClient } from '@/lib/supabase/server'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { InternshipService } from '@/services/internship.service'
import { z } from 'zod'

const schema = z.object({
  skills: z.string().min(5, 'Please provide more details about your skills.')
})

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const user = await validateSession(supabase)

    const body = await req.json()
    const parsed = schema.parse(body)

    const matches = await InternshipService.findMatches(parsed.skills)

    // Log the search
    await supabase.from('search_logs').insert({
      user_id: user.id,
      search_type: 'internship',
      query: parsed.skills
    }).select().single()

    return apiResponse(matches)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiError(error.errors[0].message, 400)
    }
    if (error.code && error.code.startsWith('42')) {
      try {
        const body = await req.json()
        const matches = await InternshipService.findMatches(schema.parse(body).skills)
        return apiResponse(matches)
      } catch (innerErr) {
        // Fallthrough
      }
    }
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to find internships', error.message === 'Unauthorized' ? 401 : 500)
  }
}
