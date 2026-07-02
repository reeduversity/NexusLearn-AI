import { prisma } from '@/lib/prisma'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { VectorSearchService } from '@/services/vector-search.service'

export async function GET(req: Request) {
  try {
    const user = await validateSession()
    const url = new URL(req.url)
    const query = url.searchParams.get('q')
    if (!query) return apiError('Search query is required', 400)

    let results: any[] = []
    try {
      results = await VectorSearchService.searchNotes(query, user.id, 10) as any[]
    } catch {
      results = await prisma.note.findMany({ where: { userId: user.id, content: { contains: query, mode: 'insensitive' } }, select: { id: true, title: true, content: true, createdAt: true } })
    }

    try { await prisma.searchLog.create({ data: { userId: user.id, query, resultsCount: results.length } }) } catch {}
    return apiResponse(results)
  } catch (error: any) {
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : (error.message || 'Failed to perform search'), error.message === 'Unauthorized' ? 401 : 500)
  }
}
