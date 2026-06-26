import { createClient } from '@/lib/supabase/server'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { VoiceService } from '@/services/voice.service'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    await validateSession(supabase)

    const formData = await req.formData()
    const file = formData.get('audio') as File | null

    if (!file) {
      return apiError('No audio file provided', 400)
    }

    // 1. Transcribe with Groq Whisper
    const groqFormData = new FormData()
    groqFormData.append('file', file)
    groqFormData.append('model', 'whisper-large-v3-turbo')

    const whisperRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: groqFormData
    })

    if (!whisperRes.ok) {
      throw new Error(`Audio transcription failed: ${await whisperRes.text()}`)
    }

    const whisperData = await whisperRes.json()
    const userText = whisperData.text

    if (!userText || userText.trim().length === 0) {
      return apiResponse({ userText: '', aiResponse: 'I didn\'t quite catch that. Could you repeat?' })
    }

    // 2. Generate Conversational Response
    // For simplicity in this endpoint, context is empty, but we could pass history from client.
    const aiResponse = await VoiceService.generateConversationalResponse(userText, [])

    return apiResponse({ userText, aiResponse })
  } catch (error: any) {
    console.error('Voice API Error:', error)
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to process voice', error.message === 'Unauthorized' ? 401 : 500)
  }
}
