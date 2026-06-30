import { prisma } from '@/lib/prisma'

export class SummarizerService {
  /**
   * Generates a structured summary from raw text using Groq + Llama 4 Scout.
   */
  static async generateSummary(text: string, userId: string): Promise<any> {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            {
              role: 'system',
              content: `You are an expert AI academic summarizer. 
Return ONLY a valid JSON object with the following structure:
{
  "title": "A short, descriptive title",
  "summary": "A detailed 2-3 paragraph summary",
  "key_points": ["Point 1", "Point 2", "Point 3"],
  "flashcards": [{"front": "Concept", "back": "Definition/Explanation"}],
  "quiz": [{"q": "Question?", "options": ["A", "B", "C", "D"], "ans": "A"}]
}`
            },
            {
              role: 'user',
              content: text.slice(0, 8000)
            }
          ],
          temperature: 0.3,
          max_tokens: 1000,
          response_format: { type: 'json_object' }
        }),
      })

      if (!response.ok) {
        throw new Error(`Groq API error during summarization: ${await response.text()}`)
      }

      const data = await response.json()
      let content = data.choices[0].message.content
      content = content.replace(/```json/g, '').replace(/```/g, '').trim()
      const structuredData = JSON.parse(content)

      // Automatically save to DB
      await prisma.note.create({
        data: {
          userId,
          title: structuredData.title || 'AI Generated Summary',
          content: JSON.stringify(structuredData),
        },
      })

      return structuredData
    } catch (error) {
      console.error('Summarization failed:', error)
      throw new Error('Failed to summarize text')
    }
  }
}
