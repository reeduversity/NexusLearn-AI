import { prisma } from '@/lib/prisma'

export class SummarizerService {
  /**
   * Generates a structured summary from raw text using Groq + Llama 4 Scout.
   */
  static async generateSummary(text: string, userId: string): Promise<any> {
    const models = [
      'llama-3.3-70b-versatile',
      'llama-3.1-8b-instant',
      'llama3-8b-8192',
      'gemma2-9b-it'
    ]

    let lastError: any = null

    for (const model of models) {
      try {
        console.log(`Attempting summarization with model: ${model}`)
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: 'system',
                content: `You are an expert AI academic summarizer. 
All generated content (titles, summaries, key points, flashcards, quizzes, etc.) MUST be written strictly in proper English, even if the input text is in Hindi, Hinglish, or any other language.
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
                content: text.slice(0, 6000) // Lowered from 8000 to save prompt tokens
              }
            ],
            temperature: 0.3,
            max_tokens: 800, // Lowered from 1000 to save TPM quota
            response_format: { type: 'json_object' }
          }),
        })

        if (!response.ok) {
          const errText = await response.text()
          throw new Error(`Groq API error for ${model}: ${errText}`)
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
      } catch (error: any) {
        console.warn(`Summarization with ${model} failed:`, error.message || error)
        lastError = error
        // Fall back to next model
      }
    }

    console.error('All Groq models failed to summarize:', lastError)
    throw new Error('Failed to summarize text: ' + (lastError?.message || lastError))
  }
}
