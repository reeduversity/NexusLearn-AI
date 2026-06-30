import { prisma } from '@/lib/prisma'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { ResearchService } from '@/services/research.service'
import { z } from 'zod'

const citationSchema = z.object({ title: z.string().min(1), author: z.string().min(1), year: z.string().min(1), url: z.string().optional(), format: z.enum(['APA', 'MLA', 'IEEE']) })

export async function GET() {
  try {
    const user = await validateSession()
    const citations = await prisma.citation.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } })
    return apiResponse(citations)
  } catch (error: any) {
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to fetch citations', error.message === 'Unauthorized' ? 401 : 500)
  }
}

export async function POST(req: Request) {
  try {
    const user = await validateSession()
    const body = await req.json()
    const parsed = citationSchema.parse(body)

    const citationOutput = await ResearchService.generateCitation({ title: parsed.title, author: parsed.author, year: parsed.year, url: parsed.url }, parsed.format)
    const citation = await prisma.citation.create({
      data: { userId: user.id, title: parsed.title, author: parsed.author, year: parsed.year, url: parsed.url, format: parsed.format, citationOutput },
    })
    return apiResponse(citation, 201)
  } catch (error: any) {
    if (error instanceof z.ZodError) return apiError(error.errors[0].message, 400)
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to generate citation', error.message === 'Unauthorized' ? 401 : 500)
  }
}
