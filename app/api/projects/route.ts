import { createClient } from '@/lib/supabase/server'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { z } from 'zod'

const projectSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional()
})

export async function GET() {
  try {
    const supabase = await createClient()
    const user = await validateSession(supabase)

    // Fetch projects where the user is an owner or member
    const { data: memberProjects, error: fetchMembersError } = await supabase
      .from('project_members')
      .select('project_id')
      .eq('user_id', user.id)

    if (fetchMembersError) throw fetchMembersError
    const projectIds = (memberProjects || []).map(p => p.project_id)

    // Query projects table
    let query = supabase.from('projects').select('*, project_tasks(*), project_messages(*)')
    if (projectIds.length > 0) {
      query = query.or(`user_id.eq.${user.id},id.in.(${projectIds.join(',')})`)
    } else {
      query = query.eq('user_id', user.id)
    }

    const { data: projects, error } = await query.order('created_at', { ascending: false })
    if (error) throw error

    return apiResponse(projects)
  } catch (error: any) {
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to fetch projects', error.message === 'Unauthorized' ? 401 : 500)
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const user = await validateSession(supabase)

    const body = await req.json()
    const parsed = projectSchema.parse(body)

    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        title: parsed.title,
        description: parsed.description,
        status: 'in_progress'
      })
      .select()
      .single()

    if (error) throw error

    // Create the member mapping for owner
    await supabase.from('project_members').insert({
      project_id: project.id,
      user_id: user.id,
      role: 'owner'
    })

    return apiResponse(project, 201)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiError(error.errors[0].message, 400)
    }
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to create project', error.message === 'Unauthorized' ? 401 : 500)
  }
}
