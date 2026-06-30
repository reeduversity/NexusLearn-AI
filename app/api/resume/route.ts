import { prisma } from '@/lib/prisma'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { z } from 'zod'

const resumeSchema = z.object({ title: z.string().min(1), resume_text: z.string().min(1) })

export async function GET() {
  try {
    const user = await validateSession()
    const resumes = await prisma.resume.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } })
    return apiResponse(resumes)
  } catch (error: any) {
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to fetch resumes', error.message === 'Unauthorized' ? 401 : 500)
  }
}

export async function POST(req: Request) {
  try {
    const user = await validateSession()
    const body = await req.json()
    const parsed = resumeSchema.parse(body)
    const resume = await prisma.resume.create({ data: { userId: user.id, title: parsed.title, resumeText: parsed.resume_text } })
    return apiResponse(resume, 201)
  } catch (error: any) {
    if (error instanceof z.ZodError) return apiError(error.errors[0].message, 400)
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to save resume', error.message === 'Unauthorized' ? 401 : 500)
  }
}
