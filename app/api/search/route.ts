import { createClient } from '@/lib/supabase/server'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { VectorSearchService } from '@/services/vector-search.service'

export async function GET(req: Request) {
  try {
    const supabase = await createClient()
    const user = await validateSession(supabase)

    const url = new URL(req.url)
    const query = url.searchParams.get('q')

    if (!query) {
      return apiError('Search query is required', 400)
    }

    // Attempt vector search. Fall back to standard search on failure or if empty
    let results = []
    try {
      results = await VectorSearchService.searchNotes(query, user.id, 10)
    } catch {
      const { data } = await supabase
        .from('notes')
        .select('id, title, content, created_at')
        .eq('user_id', user.id)
        .ilike('content', `%${query}%`)
      results = data || []
    }

    // Save search log
    try {
      await supabase.from('search_logs').insert({
        user_id: user.id,
        query: query,
        results_count: results.length
      })
    } catch (err) {
      console.error('Failed to log search:', err)
    }

    return apiResponse(results)
  } catch (error: any) {
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to perform search', error.message === 'Unauthorized' ? 401 : 500)
  }
}
