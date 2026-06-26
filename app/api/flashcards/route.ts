import { createClient } from '@/lib/supabase/server'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { z } from 'zod'

const flashcardSchema = z.object({
  topic: z.string().min(1),
  cards: z.array(z.object({
    front: z.string().min(1),
    back: z.string().min(1)
  })).min(1)
})

export async function GET() {
  try {
    const supabase = await createClient()
    const user = await validateSession(supabase)

    // Retrieve decks stored as notes with title prefixed with [Flashcard]
    const { data: notes, error } = await supabase
      .from('notes')
      .select('id, title, content, created_at')
      .eq('user_id', user.id)
      .like('title', '[Flashcard]%')
      .order('created_at', { ascending: false })

    if (error) throw error

    const decks = (notes || []).map(note => {
      try {
        const cards = JSON.parse(note.content)
        return {
          id: note.id,
          topic: note.title.replace('[Flashcard] ', ''),
          cards,
          created_at: note.created_at
        }
      } catch {
        return null
      }
    }).filter(Boolean)

    return apiResponse(decks)
  } catch (error: any) {
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to fetch flashcards', error.message === 'Unauthorized' ? 401 : 500)
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const user = await validateSession(supabase)

    const body = await req.json()
    const parsed = flashcardSchema.parse(body)

    const { data, error } = await supabase
      .from('notes')
      .insert({
        user_id: user.id,
        title: `[Flashcard] ${parsed.topic}`,
        content: JSON.stringify(parsed.cards)
      })
      .select()
      .single()

    if (error) throw error
    return apiResponse({
      id: data.id,
      topic: parsed.topic,
      cards: parsed.cards,
      created_at: data.created_at
    }, 201)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiError(error.errors[0].message, 400)
    }
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to save flashcard deck', error.message === 'Unauthorized' ? 401 : 500)
  }
}
