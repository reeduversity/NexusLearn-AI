import { prisma } from '@/lib/prisma'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { z } from 'zod'

const projectSchema = z.object({ title: z.string().min(1), description: z.string().optional() })

export async function GET() {
  try {
    const user = await validateSession()
    const memberProjects = await prisma.projectMember.findMany({ where: { userId: user.id }, select: { projectId: true } })
    const projectIds = memberProjects.map(p => p.projectId)
    const projects = await prisma.project.findMany({
      where: { OR: [{ userId: user.id }, ...(projectIds.length > 0 ? [{ id: { in: projectIds } }] : [])] },
      include: { tasks: true, messages: true },
      orderBy: { createdAt: 'desc' },
    })
    return apiResponse(projects)
  } catch (error: any) {
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : (error.message || 'Failed to fetch projects'), error.message === 'Unauthorized' ? 401 : 500)
  }
}

export async function POST(req: Request) {
  try {
    const user = await validateSession()
    const body = await req.json()
    const parsed = projectSchema.parse(body)
    const project = await prisma.project.create({ data: { userId: user.id, title: parsed.title, description: parsed.description, status: 'in_progress' } })
    await prisma.projectMember.create({ data: { projectId: project.id, userId: user.id, role: 'owner' } })
    return apiResponse(project, 201)
  } catch (error: any) {
    if (error instanceof z.ZodError) return apiError(error.errors[0].message, 400)
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : (error.message || 'Failed to create project'), error.message === 'Unauthorized' ? 401 : 500)
  }
}
