import { prisma } from '@/lib/prisma'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { AnalyticsService } from '@/services/analytics.service'

export async function GET() {
  try {
    const user = await validateSession()

    const [weaknesses, heatmap] = await Promise.all([
      AnalyticsService.calculateWeaknesses(user.id),
      AnalyticsService.getRevisionHeatmap(user.id)
    ])

    const activeWeaknesses = await prisma.weakness.findMany({
      where: { userId: user.id, status: 'active' },
    })

    return apiResponse({
      weaknesses: activeWeaknesses.length > 0 ? activeWeaknesses : weaknesses,
      heatmap
    })
  } catch (error: any) {
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to fetch analytics', error.message === 'Unauthorized' ? 401 : 500)
  }
}
