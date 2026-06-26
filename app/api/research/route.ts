import { createClient } from '@/lib/supabase/server'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { ResearchService } from '@/services/research.service'
import { z } from 'zod'

const synthesizeSchema = z.object({
  action: z.literal('synthesize'),
  topic: z.string().min(1),
  sources: z.array(z.string().min(1)).min(1)
})

const integritySchema = z.object({
  action: z.literal('check_integrity'),
  text: z.string().min(1)
})

const searchSchema = z.object({
  action: z.literal('search'),
  query: z.string().min(1),
  limit: z.number().int().min(1).max(50).optional()
})

const researchSchema = z.union([synthesizeSchema, integritySchema, searchSchema])

export async function GET() {
  try {
    const supabase = await createClient()
    const user = await validateSession(supabase)

    const { data: projects, error } = await supabase
      .from('research_projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return apiResponse(projects)
  } catch (error: any) {
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to fetch research projects', error.message === 'Unauthorized' ? 401 : 500)
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const user = await validateSession(supabase)

    const body = await req.json()
    const parsed = researchSchema.parse(body)

    if (parsed.action === 'synthesize') {
      const data = await ResearchService.synthesizeResearch(parsed.topic, parsed.sources, user.id)
      return apiResponse(data)
    } else if (parsed.action === 'check_integrity') {
      const report = await ResearchService.checkAcademicIntegrity(parsed.text)
      return apiResponse(report)
    } else {
      const results = await ResearchService.searchLiterature(parsed.query, parsed.limit || 10)
      return apiResponse(results)
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiError(error.errors[0].message, 400)
    }
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : error.message || 'Failed to process research action', error.message === 'Unauthorized' ? 401 : 500)
  }
}
