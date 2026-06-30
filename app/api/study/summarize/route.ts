import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { SummarizerService } from '@/services/summarizer.service'
import { z } from 'zod'

const summarizeSchema = z.object({ text: z.string().min(1) })

export async function POST(req: Request) {
  try {
    const user = await validateSession()
    const body = await req.json()
    const parsed = summarizeSchema.parse(body)
    const result = await SummarizerService.generateSummary(parsed.text, user.id)
    return apiResponse(result)
  } catch (error: any) {
    if (error instanceof z.ZodError) return apiError(error.errors[0].message, 400)
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to summarize', error.message === 'Unauthorized' ? 401 : 500)
  }
}
