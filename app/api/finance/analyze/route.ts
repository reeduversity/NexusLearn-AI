import { prisma } from '@/lib/prisma'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { FinanceService } from '@/services/finance.service'

export async function POST(req: Request) {
  try {
    const user = await validateSession()
    const entries = await prisma.budgetEntry.findMany({ where: { userId: user.id } })
    const income = entries.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0)
    const expenses = entries.filter(e => e.type === 'expense').map(e => ({ category: e.category, amount: e.amount }))
    const result = await FinanceService.analyzeBudget(income, expenses)
    return apiResponse(result)
  } catch (error: any) {
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : (error.message || 'Failed to analyze budget'), error.message === 'Unauthorized' ? 401 : 500)
  }
}
