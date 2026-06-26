import { createClient } from '@/lib/supabase/server'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { z } from 'zod'

const revisionSchema = z.object({
  deck_id: z.string().uuid(),
  score: z.number().int().nonnegative()
})

export async function GET() {
  try {
    const supabase = await createClient()
    const user = await validateSession(supabase)

    // Retrieve decks due for revision
    const { data: notes, error } = await supabase
      .from('notes')
      .select('id, title, content, created_at')
      .eq('user_id', user.id)
      .like('title', '[Flashcard]%')
      .limit(5)

    if (error) throw error

    // Simple scheduling rule: mock that some cards are due
    const revisionList = (notes || []).map(note => {
      try {
        const cards = JSON.parse(note.content)
        return {
          id: note.id,
          deck_name: note.title.replace('[Flashcard] ', ''),
          total_cards: cards.length,
          due_count: Math.min(cards.length, 12),
          due_cards: cards.slice(0, 12)
        }
      } catch {
        return null
      }
    }).filter(Boolean)

    return apiResponse(revisionList)
  } catch (error: any) {
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to fetch revision tasks', error.message === 'Unauthorized' ? 401 : 500)
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const user = await validateSession(supabase)

    const body = await req.json()
    const parsed = revisionSchema.parse(body)

    // Save a log in audit_logs representing revision session completion
    const { data, error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: 'complete_revision',
        module: 'spaced_repetition',
        metadata: { deck_id: parsed.deck_id, score: parsed.score }
      })
      .select()
      .single()

    if (error) throw error
    return apiResponse({ success: true, log_id: data.id })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiError(error.errors[0].message, 400)
    }
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to complete revision', error.message === 'Unauthorized' ? 401 : 500)
  }
}
