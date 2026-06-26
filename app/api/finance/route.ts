import { createClient } from '@/lib/supabase/server'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { z } from 'zod'

const budgetSchema = z.object({
  action: z.literal('add_entry').default('add_entry'),
  amount: z.number().positive(),
  category: z.string().min(1),
  type: z.enum(['income', 'expense']),
  description: z.string().optional()
})

const savingsGoalSchema = z.object({
  action: z.literal('create_goal'),
  name: z.string().min(1),
  target: z.number().positive(),
  deadline: z.string().optional()
})

const financeSchema = z.union([budgetSchema, savingsGoalSchema])

export async function GET() {
  try {
    const supabase = await createClient()
    const user = await validateSession(supabase)

    const [entriesResponse, goalsResponse] = await Promise.all([
      supabase
        .from('budget_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
    ])

    if (entriesResponse.error) throw entriesResponse.error
    if (goalsResponse.error) throw goalsResponse.error

    return apiResponse({
      entries: entriesResponse.data,
      goals: goalsResponse.data
    })
  } catch (error: any) {
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to fetch finance records', error.message === 'Unauthorized' ? 401 : 500)
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const user = await validateSession(supabase)

    const body = await req.json()
    const parsed = financeSchema.parse(body)

    if (parsed.action === 'create_goal') {
      const { data: goal, error } = await supabase
        .from('savings_goals')
        .insert({
          user_id: user.id,
          name: parsed.name,
          target: parsed.target,
          deadline: parsed.deadline || null
        })
        .select()
        .single()

      if (error) throw error
      return apiResponse(goal, 201)
    } else {
      const { data: entry, error } = await supabase
        .from('budget_entries')
        .insert({
          user_id: user.id,
          amount: parsed.amount,
          category: parsed.category,
          type: parsed.type,
          description: parsed.description
        })
        .select()
        .single()

      if (error) throw error
      return apiResponse(entry, 201)
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiError(error.errors[0].message, 400)
    }
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to process finance request', error.message === 'Unauthorized' ? 401 : 500)
  }
}
