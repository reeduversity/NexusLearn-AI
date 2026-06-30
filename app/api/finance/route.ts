import { prisma } from '@/lib/prisma'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { WellbeingService } from '@/services/wellbeing.service'

export async function GET() {
  try {
    const user = await validateSession()
    const [entries, summary, savingsGoals] = await Promise.all([
      prisma.budgetEntry.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } }),
      WellbeingService.getFinanceSummary(user.id),
      prisma.savingsGoal.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } }),
    ])
    return apiResponse({ entries, summary, savingsGoals })
  } catch (error: any) {
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to fetch finance data', error.message === 'Unauthorized' ? 401 : 500)
  }
}
