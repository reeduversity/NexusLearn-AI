import { createClient } from '@/lib/supabase/server'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { CampusService } from '@/services/campus.service'
import { z } from 'zod'

const joinGroupSchema = z.object({
  group_id: z.string().uuid()
})

export async function GET(req: Request) {
  try {
    const supabase = await createClient()
    const user = await validateSession(supabase)

    const url = new URL(req.url)
    const interestsParam = url.searchParams.get('interests')
    const interests = interestsParam ? interestsParam.split(',') : []

    const groups = await CampusService.matchStudyGroups(user.id, interests)
    return apiResponse(groups)
  } catch (error: any) {
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to match study groups', error.message === 'Unauthorized' ? 401 : 500)
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const user = await validateSession(supabase)

    const body = await req.json()
    const parsed = joinGroupSchema.parse(body)

    const { data: member, error } = await supabase
      .from('study_group_members')
      .insert({
        group_id: parsed.group_id,
        user_id: user.id
      })
      .select()
      .single()

    if (error) throw error
    return apiResponse(member, 201)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiError(error.errors[0].message, 400)
    }
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to join study group', error.message === 'Unauthorized' ? 401 : 500)
  }
}
