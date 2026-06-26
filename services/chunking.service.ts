export class ChunkingService {
  /**
   * Splits raw text into semantically meaningful chunks for vectorization.
   * Target size: ~500-1000 tokens with slight overlap.
   */
  static chunkText(text: string, maxChunkSize: number = 1000, overlap: number = 200): string[] {
    // Basic implementation of token/word-based chunking
    const words = text.split(/\s+/)
    const chunks: string[] = []
    
    let currentChunk: string[] = []
    let currentLength = 0

    for (let i = 0; i < words.length; i++) {
      currentChunk.push(words[i])
      currentLength += words[i].length + 1 // +1 for space

      if (currentLength >= maxChunkSize) {
        chunks.push(currentChunk.join(' '))
        
        // Handle overlap
        const overlapWords = currentChunk.slice(-Math.floor(overlap / 5)) // approx 5 chars per word
        currentChunk = [...overlapWords]
        currentLength = currentChunk.join(' ').length
      }
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk.join(' '))
    }

    return chunks
  }
}
