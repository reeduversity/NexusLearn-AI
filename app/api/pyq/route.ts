import { createClient } from '@/lib/supabase/server'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { ExamService } from '@/services/exam.service'
import { z } from 'zod'

const pyqSchema = z.object({
  course_id: z.string().min(1),
  year: z.number().int().min(1900).max(new Date().getFullYear()),
  content: z.string().min(1),
  topic_tags: z.array(z.string()).optional()
})

export async function GET() {
  try {
    const supabase = await createClient()
    const user = await validateSession(supabase)

    const { data: papers, error } = await supabase
      .from('pyq_papers')
      .select('*')
      .eq('user_id', user.id)
      .order('year', { ascending: false })

    if (error) throw error
    return apiResponse(papers)
  } catch (error: any) {
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to fetch PYQs', error.message === 'Unauthorized' ? 401 : 500)
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const user = await validateSession(supabase)

    const body = await req.json()
    const parsed = pyqSchema.parse(body)

    // Simulate extracting topics if not provided
    const tags = parsed.topic_tags || ['Data Structures', 'Algorithms', 'Trees', 'Graphs', 'Big-O Analysis']

    const { data: paper, error } = await supabase
      .from('pyq_papers')
      .insert({
        user_id: user.id,
        course_id: parsed.course_id,
        year: parsed.year,
        content: parsed.content,
        topic_tags: tags
      })
      .select()
      .single()

    if (error) throw error

    // Fetch predictions based on course ID
    const predictions = await ExamService.predictImportantTopics(parsed.course_id).catch(() => [])

    return apiResponse({ paper, predictions }, 201)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiError(error.errors[0].message, 400)
    }
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to save PYQ paper', error.message === 'Unauthorized' ? 401 : 500)
  }
}
