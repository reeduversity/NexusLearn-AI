import { prisma } from '@/lib/prisma'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { z } from 'zod'

const noteSchema = z.object({ material_id: z.string().uuid().optional().nullable(), title: z.string().min(1), content: z.string().min(1) })

export async function GET() {
  try {
    const user = await validateSession()
    const data = await prisma.note.findMany({ where: { userId: user.id }, select: { id: true, materialId: true, title: true, content: true, createdAt: true }, orderBy: { createdAt: 'desc' } })
    return apiResponse(data)
  } catch (error: any) {
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : (error.message || 'Failed to fetch notes'), error.message === 'Unauthorized' ? 401 : 500)
  }
}

export async function POST(req: Request) {
  try {
    const user = await validateSession()
    const body = await req.json()
    const parsed = noteSchema.parse(body)
    const data = await prisma.note.create({ data: { userId: user.id, materialId: parsed.material_id || null, title: parsed.title, content: parsed.content } })
    return apiResponse(data, 201)
  } catch (error: any) {
    if (error instanceof z.ZodError) return apiError(error.errors[0].message, 400)
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : (error.message || 'Failed to save note'), error.message === 'Unauthorized' ? 401 : 500)
  }
}
