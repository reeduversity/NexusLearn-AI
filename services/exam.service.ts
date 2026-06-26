import { createClient } from '@/lib/supabase/server'

export class ExamService {
  /**
   * Analyzes Previous Year Questions (PYQs) to predict important topics for upcoming exams.
   */
  static async predictImportantTopics(courseId: string) {
    const supabase = await createClient()

    // 1. Fetch all PYQs for the specific course
    const { data: pyqs, error } = await supabase
      .from('pyq_papers')
      .select('content, year, topic_tags')
      .eq('course_id', courseId)
      .order('year', { ascending: false })

    if (error || !pyqs) throw new Error('Failed to fetch PYQs')

    // 2. Simple frequency analysis (in production, this can use an LLM for semantic pattern recognition)
    const topicFrequency: Record<string, number> = {}
    
    pyqs.forEach(paper => {
      // Assuming topic_tags is a JSONB array of strings
      const tags: string[] = paper.topic_tags || []
      tags.forEach(tag => {
        // Weight recent years more heavily (naive implementation)
        const weight = paper.year >= new Date().getFullYear() - 2 ? 1.5 : 1.0
        topicFrequency[tag] = (topicFrequency[tag] || 0) + weight
      })
    })

    // 3. Sort by frequency to predict high-probability topics
    const predictions = Object.entries(topicFrequency)
      .map(([topic, weight]) => ({ topic, weight }))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 5) // Top 5 predicted topics

    return predictions
  }

  /**
   * Generates a dynamic mock test based on user weaknesses and predicted topics.
   */
  static async generateMockTest(userId: string, courseId: string) {
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
              content: 'You are an AI Exam Generator. Generate a 10-question multiple-choice mock test focusing on high-probability academic topics. Return JSON array format: [{"q": "Question?", "options": ["A", "B", "C", "D"], "ans": "A"}].'
            },
            { role: 'user', content: `Generate test for course ID: ${courseId}` } // In reality, inject context text here
          ],
          response_format: { type: 'json_object' }
        }),
      })

      const data = await response.json()
      const testData = JSON.parse(data.choices[0].message.content)

      // Save to database
      const supabase = await createClient()
      const { data: test, error } = await supabase
        .from('mock_tests')
        .insert({
          user_id: userId,
          course_id: courseId,
          content: testData,
          status: 'pending'
        })
        .select()
        .single()

      if (error) throw error
      return test
    } catch (error) {
      console.error('Mock test generation failed:', error)
      throw new Error('Failed to generate mock test')
    }
  }

  /**
   * Generates an exam from extracted text with specific configuration (difficulty, language, etc).
   */
  static async generateExamFromDocument(text: string, config: { difficulty: string, language: string }, userId: string) {
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
              content: `You are an AI Exam Generator. Generate a structured exam based on the provided text.
Difficulty: ${config.difficulty}
Language: ${config.language}
Include: Multiple Choice Questions (MCQ), True/False, and Short Answer questions.
Output valid JSON ONLY with this structure:
{
  "title": "Generated Exam",
  "mcqs": [{ "q": "Question", "options": ["A", "B", "C", "D"], "ans": "A" }],
  "tf": [{ "q": "Question", "ans": "True" }],
  "short_answers": [{ "q": "Question", "ans": "Expected Answer" }]
}`
            },
            { role: 'user', content: `Text to analyze:\n\n${text.slice(0, 15000)}` }
          ],
          response_format: { type: 'json_object' }
        }),
      })

      if (!response.ok) {
        throw new Error(`Groq API error: ${await response.text()}`)
      }

      const data = await response.json()
      const testData = JSON.parse(data.choices[0].message.content)

      // Save to database
      const supabase = await createClient()
      const { data: test, error } = await supabase
        .from('mock_tests')
        .insert({
          user_id: userId,
          content: testData,
          status: 'generated'
        })
        .select()
        .single()

      if (error) {
        console.error('Failed to save to DB:', error)
      }

      return testData
    } catch (error) {
      console.error('Exam generation failed:', error)
      throw new Error('Failed to generate exam')
    }
  }
}
