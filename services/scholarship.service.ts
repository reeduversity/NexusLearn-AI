export class ScholarshipService {
  /**
   * Matches a user's profile to potential scholarships using AI.
   */
  static async findMatches(profile: string) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `You are an expert scholarship matcher. Given a student's profile, generate 3-5 highly relevant, realistic (but simulated) scholarships that match their background, major, and interests.
Return the results ONLY as a valid JSON object in the following format:
{
  "matches": [
    {
      "id": 1,
      "title": "Scholarship Name",
      "provider": "Provider Name",
      "amount": "$10,000",
      "deadline": "Month Day, Year",
      "match": 95, // Integer match percentage 0-100
      "tags": ["Tag 1", "Tag 2"],
      "description": "Short description of why it matches."
    }
  ]
}`
            },
            {
              role: 'user',
              content: `Student Profile: ${profile}`
            }
          ],
          response_format: { type: 'json_object' }
        }),
      })

      if (!response.ok) {
        throw new Error(`Groq API error: ${await response.text()}`)
      }

      const data = await response.json()
      return JSON.parse(data.choices[0].message.content).matches
    } catch (error) {
      console.error('Scholarship match failed:', error)
      throw new Error('Failed to find scholarships')
    }
  }
}
