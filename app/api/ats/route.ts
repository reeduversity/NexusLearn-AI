import { createClient } from '@/lib/supabase/server'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { CareerService } from '@/services/career.service'
import { z } from 'zod'

const analyzeSchema = z.object({
  action: z.literal('analyze'),
  resume_text: z.string().min(1)
})

const matchSchema = z.object({
  action: z.literal('match'),
  resume_text: z.string().min(1),
  jd_text: z.string().min(1)
})

const coverLetterSchema = z.object({
  action: z.literal('cover_letter'),
  job_title: z.string().min(1),
  company: z.string().min(1),
  resume_text: z.string().min(1)
})

const atsSchema = z.union([analyzeSchema, matchSchema, coverLetterSchema])

export async function GET() {
  try {
    const supabase = await createClient()
    const user = await validateSession(supabase)

    const { data: reports, error } = await supabase
      .from('ats_reports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return apiResponse(reports)
  } catch (error: any) {
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to fetch ATS reports', error.message === 'Unauthorized' ? 401 : 500)
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const user = await validateSession(supabase)

    const body = await req.json()
    const parsed = atsSchema.parse(body)

    if (parsed.action === 'analyze') {
      const data = await CareerService.analyzeResume(parsed.resume_text, user.id)
      return apiResponse(data)
    } else if (parsed.action === 'match') {
      const result = await CareerService.matchJD(parsed.resume_text, parsed.jd_text)
      return apiResponse(result)
    } else {
      const letter = await CareerService.generateCoverLetter(parsed.job_title, parsed.company, parsed.resume_text)
      return apiResponse({ cover_letter: letter })
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiError(error.errors[0].message, 400)
    }
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : error.message || 'Failed to process ATS request', error.message === 'Unauthorized' ? 401 : 500)
  }
}
