export class VoiceService {
  /**
   * Generates a conversational response for the AI Voice Partner.
   */
  static async generateConversationalResponse(text: string, context: string[]) {
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
              content: `You are an AI Study Partner. You engage in verbal conversation to help the user prepare for exams or interviews. 
Keep your answers brief, conversational, and encouraging, as they will be spoken aloud by a Text-to-Speech engine. Do not use complex formatting.`
            },
            ...context.map(c => ({ role: 'assistant', content: c })),
            { role: 'user', content: text }
          ],
        }),
      })

      if (!response.ok) {
        throw new Error(`Groq API error: ${await response.text()}`)
      }

      const data = await response.json()
      return data.choices[0].message.content
    } catch (error) {
      console.error('Voice response generation failed:', error)
      throw new Error('Failed to generate conversational response')
    }
  }
}
