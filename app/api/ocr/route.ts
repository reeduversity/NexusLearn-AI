import { createClient } from '@/lib/supabase/server'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { OCRService } from '@/services/ocr.service'
import { z } from 'zod'

const ocrSchema = z.object({
  image_url: z.string() // Allow base64 data URIs as well as URLs
})

export async function GET() {
  try {
    const supabase = await createClient()
    const user = await validateSession(supabase)

    const { data, error } = await supabase
      .from('ocr_jobs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return apiResponse(data)
  } catch (error: any) {
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to fetch OCR history', error.message === 'Unauthorized' ? 401 : 500)
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const user = await validateSession(supabase)

    const body = await req.json()
    const parsed = ocrSchema.parse(body)

    const solution = await OCRService.processDoubtImage(parsed.image_url, user.id)
    return apiResponse({ solution })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiError(error.errors[0].message, 400)
    }
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to process image doubt', error.message === 'Unauthorized' ? 401 : 500)
  }
}
