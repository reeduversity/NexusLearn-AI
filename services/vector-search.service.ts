import { createClient } from '@/lib/supabase/server'
import { EmbeddingService } from './embedding.service'

export class VectorSearchService {
  /**
   * Searches the database using pgvector for the most semantically relevant chunks.
   */
  static async searchNotes(query: string, userId: string, limit: number = 5) {
    const supabase = await createClient()
    
    // 1. Convert search query to vector
    const queryEmbedding = await EmbeddingService.generateEmbedding(query)
    
    // 2. Query pgvector using RPC (Remote Procedure Call)
    const { data, error } = await supabase.rpc('match_notes', {
      query_embedding: queryEmbedding,
      match_threshold: 0.78, // Cosine similarity threshold
      match_count: limit,
      p_user_id: userId
    })

    if (error) {
      console.error('Vector search failed:', error)
      throw new Error('Failed to search knowledge base')
    }

    return data
  }
}
