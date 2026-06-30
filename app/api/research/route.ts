import { prisma } from '@/lib/prisma'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { ResearchService } from '@/services/research.service'
import { z } from 'zod'

const synthesizeSchema = z.object({ action: z.literal('synthesize'), topic: z.string().min(1), sources: z.array(z.string()).min(1) })
const integritySchema = z.object({ action: z.literal('integrity'), text: z.string().min(1) })
const searchSchema = z.object({ action: z.literal('search'), query: z.string().min(1), limit: z.number().optional() })
const researchSchema = z.union([synthesizeSchema, integritySchema, searchSchema])

export async function GET() {
  try {
    const user = await validateSession()
    const projects = await prisma.researchProject.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } })
    return apiResponse(projects)
  } catch (error: any) {
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to fetch research projects', error.message === 'Unauthorized' ? 401 : 500)
  }
}

export async function POST(req: Request) {
  try {
    const user = await validateSession()
    const body = await req.json()
    const parsed = researchSchema.parse(body)
    if (parsed.action === 'synthesize') {
      const result = await ResearchService.synthesizeResearch(parsed.topic, parsed.sources, user.id)
      return apiResponse(result)
    } else if (parsed.action === 'integrity') {
      const result = await ResearchService.checkAcademicIntegrity(parsed.text)
      return apiResponse(result)
    } else {
      const papers = await ResearchService.searchLiterature(parsed.query, parsed.limit)
      return apiResponse(papers)
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) return apiError(error.errors[0].message, 400)
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to process research request', error.message === 'Unauthorized' ? 401 : 500)
  }
}
