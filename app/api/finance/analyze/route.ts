import { createClient } from '@/lib/supabase/server'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { FinanceService } from '@/services/finance.service'
import { z } from 'zod'

const schema = z.object({
  income: z.number().positive(),
  expenses: z.array(z.object({
    category: z.string(),
    amount: z.number().positive()
  })).min(1)
})

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const user = await validateSession(supabase)

    const body = await req.json()
    const parsed = schema.parse(body)

    const analysis = await FinanceService.analyzeBudget(parsed.income, parsed.expenses)

    // Optional: Log to database if needed

    return apiResponse(analysis)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiError(error.errors[0].message, 400)
    }
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to analyze budget', error.message === 'Unauthorized' ? 401 : 500)
  }
}
