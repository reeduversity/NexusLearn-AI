export class PyqService {
  /**
   * Analyzes multiple Previous Year Question (PYQ) papers to find repeated topics and probabilities.
   */
  static async analyzePyqs(texts: string[]) {
    const combinedText = texts.map((t, i) => `--- PAPER ${i + 1} ---\n${t}`).join('\n\n')

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
              content: `You are an expert academic examiner and data analyst. 
You will be provided with text from multiple past exam papers.
Analyze the papers to identify the most repeated topics/concepts.
Calculate a probability percentage (0-100) of each topic appearing in the next exam based on frequency and weight.
Return ONLY valid JSON in this format:
{
  "insights": "A 2-sentence overall trend summary.",
  "topics": [
    {
      "topic": "Topic Name",
      "probability": 85,
      "frequency": "Appeared in 3 out of 4 papers",
      "example_question": "Briefly describe the example question asked."
    }
  ]
}`
            },
            {
              role: 'user',
              content: combinedText.slice(0, 20000) // Keep within context limits
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
      console.error('PYQ Analysis failed:', error)
      throw new Error('Failed to analyze PYQs')
    }
  }
}
