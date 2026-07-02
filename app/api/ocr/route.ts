import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { OCRService } from '@/services/ocr.service'
import { z } from 'zod'

const ocrSchema = z.object({ image_url: z.string().min(1) })

export async function POST(req: Request) {
  try {
    const user = await validateSession()
    const body = await req.json()
    const parsed = ocrSchema.parse(body)
    const result = await OCRService.processDoubtImage(parsed.image_url, user.id)
    return apiResponse(result)
  } catch (error: any) {
    if (error instanceof z.ZodError) return apiError(error.errors[0].message, 400)
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : (error.message || 'Failed to process image'), error.message === 'Unauthorized' ? 401 : 500)
  }
}
