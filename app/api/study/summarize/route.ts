import { createClient } from '@/lib/supabase/server'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { SummarizerService } from '@/services/summarizer.service'
import { ParserService } from '@/services/parser.service'
import { OCRService } from '@/services/ocr.service'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const user = await validateSession(supabase)

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return apiError('No file uploaded', 400)
    }

    let extractedText = ''
    
    // Check if it's an audio or video file
    if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
      // Use Groq Whisper API
      const groqFormData = new FormData()
      groqFormData.append('file', file)
      groqFormData.append('model', 'whisper-large-v3-turbo') // or whisper-large-v3

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
      extractedText = whisperData.text
    } 
    // Check if it's an image
    else if (file.type.startsWith('image/')) {
      const arrayBuffer = await file.arrayBuffer()
      const base64 = Buffer.from(arrayBuffer).toString('base64')
      const dataUri = `data:${file.type};base64,${base64}`
      
      const { extractedText: ocrText } = await OCRService.processDoubtImage(dataUri, user.id)
      extractedText = ocrText
    } 
    // Otherwise assume it's a document (PDF, TXT, DOCX)
    else {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      extractedText = await ParserService.parseFile(buffer, file.type)
    }

    if (!extractedText || extractedText.trim().length < 20) {
      return apiError('Could not extract sufficient text/audio from the file', 400)
    }

    // Generate structured summary
    const summaryData = await SummarizerService.generateSummary(extractedText, user.id)

    return apiResponse(summaryData)
  } catch (error: any) {
    console.error('Summarizer API Error:', error)
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to generate summary', error.message === 'Unauthorized' ? 401 : 500)
  }
}
