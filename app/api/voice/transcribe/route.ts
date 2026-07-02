import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { VoiceService } from '@/services/voice.service'

export async function POST(req: Request) {
  try {
    await validateSession()
    
    // Parse FormData instead of JSON to handle the audio blob
    const formData = await req.formData()
    const audioFile = formData.get('audio') as File
    
    if (!audioFile) {
      return apiError('Audio file is required', 400)
    }

    // 1. Transcribe audio using Groq Whisper API
    const whisperFormData = new FormData()
    whisperFormData.append('file', audioFile)
    whisperFormData.append('model', 'whisper-large-v3-turbo')
    
    const transcribeRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: whisperFormData as any
    })
    
    if (!transcribeRes.ok) {
      const errText = await transcribeRes.text()
      throw new Error(`Audio transcription failed: ${errText}`)
    }
    
    const transcribeData = await transcribeRes.json()
    const userText = transcribeData.text || ''

    if (!userText.trim()) {
      return apiResponse({ userText: '', aiResponse: 'I couldn\'t hear anything. Could you try again?' })
    }

    // 2. Generate Conversational AI Response
    const aiResponse = await VoiceService.generateConversationalResponse(userText, [])
    
    return apiResponse({ userText, aiResponse })
  } catch (error: any) {
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : (error.message || 'Failed to process voice'), error.message === 'Unauthorized' ? 401 : 500)
  }
}
