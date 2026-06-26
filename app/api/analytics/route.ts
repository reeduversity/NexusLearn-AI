import { createClient } from '@/lib/supabase/server'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { AnalyticsService } from '@/services/analytics.service'

export async function GET() {
  try {
    const supabase = await createClient()
    const user = await validateSession(supabase)

    // Calculate weaknesses & get heatmap
    const [weaknesses, heatmap] = await Promise.all([
      AnalyticsService.calculateWeaknesses(user.id),
      AnalyticsService.getRevisionHeatmap(user.id)
    ])

    // Query active weaknesses list from db
    const { data: activeWeaknesses, error } = await supabase
      .from('weaknesses')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')

    if (error) throw error

    return apiResponse({
      weaknesses: activeWeaknesses || weaknesses,
      heatmap
    })
  } catch (error: any) {
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to fetch analytics', error.message === 'Unauthorized' ? 401 : 500)
  }
}
