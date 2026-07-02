import { prisma } from '@/lib/prisma'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { z } from 'zod'

const flashcardSchema = z.object({ topic: z.string().min(1), cards: z.array(z.object({ front: z.string().min(1), back: z.string().min(1) })).min(1) })

export async function GET() {
  try {
    const user = await validateSession()
    const notes = await prisma.note.findMany({
      where: { userId: user.id, title: { startsWith: '[Flashcard]' } },
      select: { id: true, title: true, content: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })
    const decks = notes.map(note => {
      try { return { id: note.id, topic: note.title.replace('[Flashcard] ', ''), cards: JSON.parse(note.content), created_at: note.createdAt } }
      catch { return null }
    }).filter(Boolean)
    return apiResponse(decks)
  } catch (error: any) {
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : (error.message || 'Failed to fetch flashcards'), error.message === 'Unauthorized' ? 401 : 500)
  }
}

export async function POST(req: Request) {
  try {
    const user = await validateSession()
    const body = await req.json()
    const parsed = flashcardSchema.parse(body)
    const data = await prisma.note.create({ data: { userId: user.id, title: `[Flashcard] ${parsed.topic}`, content: JSON.stringify(parsed.cards) } })
    return apiResponse({ id: data.id, topic: parsed.topic, cards: parsed.cards, created_at: data.createdAt }, 201)
  } catch (error: any) {
    if (error instanceof z.ZodError) return apiError(error.errors[0].message, 400)
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : (error.message || 'Failed to save flashcard deck'), error.message === 'Unauthorized' ? 401 : 500)
  }
}
