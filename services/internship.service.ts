export class InternshipService {
  /**
   * Matches a user's skills to potential internships using AI.
   */
  static async findMatches(skills: string) {
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
              content: `You are an expert tech recruiter and internship matchmaker. Given a student's technical skills and preferences, generate 3-5 highly relevant, realistic (but simulated) internship or mentorship roles that match their profile.
Return the results ONLY as a valid JSON object in the following format:
{
  "matches": [
    {
      "id": 1,
      "role": "Role Title",
      "company": "Company Name",
      "location": "Location (e.g. Remote, San Francisco)",
      "type": "Duration (e.g. Summer 2027)",
      "match": 95, // Integer match percentage 0-100
      "tags": ["Tag 1", "Tag 2", "Tag 3"],
      "description": "Short description of the responsibilities and why it matches."
    }
  ]
}`
            },
            {
              role: 'user',
              content: `Student Skills: ${skills}`
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
      console.error('Internship match failed:', error)
      throw new Error('Failed to find internships')
    }
  }
}
