import { createClient } from '@/lib/supabase/server'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { PlannerService } from '@/services/planner.service'
import { ParserService } from '@/services/parser.service'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const user = await validateSession(supabase)

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const targetDate = formData.get('targetDate') as string || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // default 30 days

    if (!file) {
      return apiError('No syllabus file uploaded', 400)
    }

    // Extract text
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const extractedText = await ParserService.parseFile(buffer, file.type)

    if (!extractedText || extractedText.trim().length < 20) {
      return apiError('Could not extract sufficient text from syllabus', 400)
    }

    // Generate study plan
    const planData = await PlannerService.autoPlanSyllabus(extractedText, user.id, targetDate)

    return apiResponse(planData)
  } catch (error: any) {
    console.error('Planner API Error:', error)
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to generate study plan', error.message === 'Unauthorized' ? 401 : 500)
  }
}
