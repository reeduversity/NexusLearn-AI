export class InterviewService {
  /**
   * Generates feedback for a mock interview response using Groq.
   */
  static async analyzeResponse(question: string, transcript: string) {
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
              content: `You are an expert technical recruiter and behavioral interviewer.
You are evaluating a candidate's response to an interview question.
Analyze their response for clarity, use of the STAR method (if applicable), technical accuracy, and tone.
Return your feedback ONLY as a valid JSON object in the following format:
{
  "score": 85, // Integer from 0 to 100
  "strengths": ["Strength 1", "Strength 2"],
  "improvements": ["Improvement 1", "Improvement 2"]
}`
            },
            {
              role: 'user',
              content: `Question: ${question}\n\nCandidate's Answer Transcript: ${transcript}`
            }
          ],
          response_format: { type: 'json_object' }
        }),
      })

      if (!response.ok) {
        throw new Error(`Groq API error: ${await response.text()}`)
      }

      const data = await response.json()
      return JSON.parse(data.choices[0].message.content)
    } catch (error) {
      console.error('Interview analysis failed:', error)
      throw new Error('Failed to analyze interview response')
    }
  }
}
