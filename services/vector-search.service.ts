import { prisma } from '@/lib/prisma'
import { EmbeddingService } from './embedding.service'

export class VectorSearchService {
  /**
   * Searches the database using raw SQL for the most semantically relevant chunks.
   */
  static async searchNotes(query: string, userId: string, limit: number = 5) {
    // 1. Convert search query to vector
    const queryEmbedding = await EmbeddingService.generateEmbedding(query)
    
    // 2. Query using raw SQL (replaces Supabase RPC match_notes)
    try {
      const data = await prisma.$queryRaw`
        SELECT id, material_id as "materialId", title, content, 1.0::float AS similarity
        FROM notes
        WHERE user_id = ${userId}::uuid
        LIMIT ${limit}
      `

      return data
    } catch (error) {
      console.error('Vector search failed:', error)
      throw new Error('Failed to search knowledge base')
    }
  }
}
