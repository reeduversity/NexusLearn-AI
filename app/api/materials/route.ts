import { prisma } from '@/lib/prisma'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { z } from 'zod'

const materialSchema = z.object({ title: z.string().min(1), type: z.string().min(1), url: z.string().min(1), course_id: z.string().uuid().optional().nullable() })

export async function GET() {
  try {
    const user = await validateSession()
    const materials = await prisma.material.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } })
    return apiResponse(materials)
  } catch (error: any) {
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : (error.message || 'Failed to fetch materials'), error.message === 'Unauthorized' ? 401 : 500)
  }
}

export async function POST(req: Request) {
  try {
    const user = await validateSession()
    const body = await req.json()
    const parsed = materialSchema.parse(body)
    const material = await prisma.material.create({ data: { userId: user.id, title: parsed.title, type: parsed.type, url: parsed.url, courseId: parsed.course_id || null } })
    return apiResponse(material, 201)
  } catch (error: any) {
    if (error instanceof z.ZodError) return apiError(error.errors[0].message, 400)
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : (error.message || 'Failed to save material'), error.message === 'Unauthorized' ? 401 : 500)
  }
}
