import { createClient } from '@/lib/supabase/server'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { PyqService } from '@/services/pyq.service'
import { ParserService } from '@/services/parser.service'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    await validateSession(supabase)

    const formData = await req.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return apiError('No files uploaded', 400)
    }

    const parsedTexts: string[] = []

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const text = await ParserService.parseFile(buffer, file.type)
        if (text && text.trim().length > 10) {
          parsedTexts.push(text)
        }
      }
    }

    if (parsedTexts.length === 0) {
      return apiError('Could not extract text from the provided files (images not supported yet).', 400)
    }

    const analysis = await PyqService.analyzePyqs(parsedTexts)

    return apiResponse(analysis)
  } catch (error: any) {
    console.error('PYQ API Error:', error)
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to analyze PYQs', error.message === 'Unauthorized' ? 401 : 500)
  }
}
