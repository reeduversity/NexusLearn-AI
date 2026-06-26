export class EventsService {
  /**
   * Filters events based on a natural language user query.
   */
  static async filterEvents(query: string, allEvents: any[]) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant', // Fast model for filtering
          messages: [
            {
              role: 'system',
              content: `You are an AI event curator. Given a user's natural language query and a JSON array of events, return an array of ONLY the event IDs that match their interests or query. 
Return your result ONLY as valid JSON in the format: { "matchedIds": [1, 2, 5] }`
            },
            {
              role: 'user',
              content: `Query: ${query}\nEvents: ${JSON.stringify(allEvents.map(e => ({id: e.id, title: e.title, tags: e.tags, description: e.description})))}`
            }
          ],
          response_format: { type: 'json_object' }
        }),
      })

      if (!response.ok) {
        throw new Error(`Groq API error: ${await response.text()}`)
      }

      const data = await response.json()
      const parsed = JSON.parse(data.choices[0].message.content)
      return parsed.matchedIds || []
    } catch (error) {
      console.error('Events filtering failed:', error)
      throw new Error('Failed to filter events')
    }
  }
}
