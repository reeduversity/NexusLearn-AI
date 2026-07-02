import { prisma } from '@/lib/prisma'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { ParserService } from '@/services/parser.service'

export async function POST(req: Request) {
  try {
    const user = await validateSession()
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return apiError('File is required', 400)
    const buffer = Buffer.from(await file.arrayBuffer())
    const text = await ParserService.parseFile(buffer, file.type)
    return apiResponse({ text })
  } catch (error: any) {
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : (error.message || 'Failed to transcribe file'), error.message === 'Unauthorized' ? 401 : 500)
  }
}
