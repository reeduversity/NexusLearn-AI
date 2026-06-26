import { createClient } from '@/lib/supabase/server'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { ExamService } from '@/services/exam.service'
import { ParserService } from '@/services/parser.service'
import { OCRService } from '@/services/ocr.service'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const user = await validateSession(supabase)

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const difficulty = formData.get('difficulty') as string || 'Medium'
    const language = formData.get('language') as string || 'English'

    if (!file) {
      return apiError('No file uploaded', 400)
    }

    // Process file based on type
    let extractedText = ''
    
    if (file.type.startsWith('image/')) {
      // Use OCR for images
      const arrayBuffer = await file.arrayBuffer()
      const base64 = Buffer.from(arrayBuffer).toString('base64')
      const dataUri = `data:${file.type};base64,${base64}`
      
      const { extractedText: ocrText } = await OCRService.processDoubtImage(dataUri, user.id)
      extractedText = ocrText
    } else {
      // Use ParserService for PDFs/Docs
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      extractedText = await ParserService.parseFile(buffer, file.type)
    }

    if (!extractedText || extractedText.trim().length < 20) {
      return apiError('Could not extract sufficient text from the file', 400)
    }

    const examData = await ExamService.generateExamFromDocument(
      extractedText,
      { difficulty, language },
      user.id
    )

    return apiResponse(examData)
  } catch (error: any) {
    console.error('Exam API Error:', error)
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to generate exam', error.message === 'Unauthorized' ? 401 : 500)
  }
}
