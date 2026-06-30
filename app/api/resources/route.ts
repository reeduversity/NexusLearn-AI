import { prisma } from '@/lib/prisma'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { z } from 'zod'

const resourceSchema = z.object({ title: z.string().min(1), url: z.string().min(1), type: z.string().optional() })

export async function GET() {
  try {
    const user = await validateSession()
    const resources = await prisma.resource.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } })
    return apiResponse(resources)
  } catch (error: any) {
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to fetch resources', error.message === 'Unauthorized' ? 401 : 500)
  }
}

export async function POST(req: Request) {
  try {
    const user = await validateSession()
    const body = await req.json()
    const parsed = resourceSchema.parse(body)
    const resource = await prisma.resource.create({ data: { userId: user.id, title: parsed.title, url: parsed.url, type: parsed.type } })
    return apiResponse(resource, 201)
  } catch (error: any) {
    if (error instanceof z.ZodError) return apiError(error.errors[0].message, 400)
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to save resource', error.message === 'Unauthorized' ? 401 : 500)
  }
}
