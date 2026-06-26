import { createClient } from '@/lib/supabase/server'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { ResearchService } from '@/services/research.service'
import { z } from 'zod'

const citationSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  year: z.string(),
  url: z.string().url().optional().nullable(),
  format: z.enum(['APA', 'MLA', 'IEEE'])
})

export async function GET() {
  try {
    const supabase = await createClient()
    const user = await validateSession(supabase)

    const { data: citations, error } = await supabase
      .from('citations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return apiResponse(citations)
  } catch (error: any) {
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to fetch citations', error.message === 'Unauthorized' ? 401 : 500)
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const user = await validateSession(supabase)

    const body = await req.json()
    const parsed = citationSchema.parse(body)

    const citationOutput = await ResearchService.generateCitation({
      title: parsed.title,
      author: parsed.author,
      year: parsed.year,
      url: parsed.url || undefined
    }, parsed.format)

    // Save to database
    const { data: citation, error } = await supabase
      .from('citations')
      .insert({
        user_id: user.id,
        title: parsed.title,
        author: parsed.author,
        year: parsed.year,
        url: parsed.url,
        format: parsed.format,
        citation_output: citationOutput
      })
      .select()
      .single()

    if (error) throw error

    return apiResponse(citation, 201)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiError(error.errors[0].message, 400)
    }
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : error.message || 'Failed to generate citation', error.message === 'Unauthorized' ? 401 : 500)
  }
}
