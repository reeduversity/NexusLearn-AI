import { prisma } from '@/lib/prisma'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'

export async function GET() {
  try {
    const user = await validateSession()
    const plans = await prisma.studyPlan.findMany({ where: { userId: user.id }, include: { assignments: true }, orderBy: { createdAt: 'desc' } })
    return apiResponse(plans)
  } catch (error: any) {
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : (error.message || 'Failed to fetch plans'), error.message === 'Unauthorized' ? 401 : 500)
  }
}
