import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { VoiceService } from '@/services/voice.service'

export async function POST(req: Request) {
  try {
    await validateSession()
    const body = await req.json()
    const response = await VoiceService.generateConversationalResponse(body.text || '', body.context || [])
    return apiResponse({ response })
  } catch (error: any) {
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to process voice', error.message === 'Unauthorized' ? 401 : 500)
  }
}
