import { createClient } from '@/lib/supabase/server'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { ScholarshipService } from '@/services/scholarship.service'
import { z } from 'zod'

const schema = z.object({
  profile: z.string().min(10, 'Please provide more details about your profile.')
})

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const user = await validateSession(supabase)

    const body = await req.json()
    const parsed = schema.parse(body)

    const matches = await ScholarshipService.findMatches(parsed.profile)

    // Log the search (optional but good for tracking)
    await supabase.from('search_logs').insert({
      user_id: user.id,
      search_type: 'scholarship',
      query: parsed.profile
    }).select().single() // Fire and forget basically, although we await it here

    return apiResponse(matches)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiError(error.errors[0].message, 400)
    }
    // Note: search_logs table might not exist, let's catch postgrest errors gracefully
    if (error.code && error.code.startsWith('42')) {
      // Table missing, ignore log failure
      try {
        const body = await req.json()
        const matches = await ScholarshipService.findMatches(schema.parse(body).profile)
        return apiResponse(matches)
      } catch (innerErr) {
        // Fallthrough
      }
    }
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to find scholarships', error.message === 'Unauthorized' ? 401 : 500)
  }
}
