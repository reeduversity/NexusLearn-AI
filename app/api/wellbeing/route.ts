import { prisma } from '@/lib/prisma'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { z } from 'zod'

const wellbeingSchema = z.object({ mood: z.number().int().min(1).max(5), energy: z.number().int().min(1).max(5), notes: z.string().optional() })

export async function GET() {
  try {
    const user = await validateSession()
    const logs = await prisma.wellbeingLog.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } })
    return apiResponse(logs)
  } catch (error: any) {
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to fetch wellbeing logs', error.message === 'Unauthorized' ? 401 : 500)
  }
}

export async function POST(req: Request) {
  try {
    const user = await validateSession()
    const body = await req.json()
    const parsed = wellbeingSchema.parse(body)
    const log = await prisma.wellbeingLog.create({ data: { userId: user.id, mood: parsed.mood, energy: parsed.energy, notes: parsed.notes } })
    return apiResponse(log, 201)
  } catch (error: any) {
    if (error instanceof z.ZodError) return apiError(error.errors[0].message, 400)
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to save wellbeing log', error.message === 'Unauthorized' ? 401 : 500)
  }
}
