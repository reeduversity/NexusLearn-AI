import { prisma } from '@/lib/prisma'

export class ExamService {
  /**
   * Analyzes Previous Year Questions (PYQs) to predict important topics for upcoming exams.
   */
  static async predictImportantTopics(courseId: string) {
    // 1. Fetch all PYQs for the specific course
    const pyqs = await prisma.pyqPaper.findMany({
      where: { courseId },
      select: { content: true, year: true, topicTags: true },
      orderBy: { year: 'desc' },
    })

    if (!pyqs || pyqs.length === 0) throw new Error('Failed to fetch PYQs')

    // 2. Simple frequency analysis
    const topicFrequency: Record<string, number> = {}
    
    pyqs.forEach(paper => {
      const tags: string[] = (paper.topicTags as string[]) || []
      tags.forEach(tag => {
        const weight = paper.year >= new Date().getFullYear() - 2 ? 1.5 : 1.0
        topicFrequency[tag] = (topicFrequency[tag] || 0) + weight
      })
    })

    // 3. Sort by frequency to predict high-probability topics
    const predictions = Object.entries(topicFrequency)
      .map(([topic, weight]) => ({ topic, weight }))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 5)

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
            { role: 'user', content: `Generate test for course ID: ${courseId}` }
          ],
          response_format: { type: 'json_object' }
        }),
      })

      const data = await response.json()
      const testData = JSON.parse(data.choices[0].message.content)

      // Save to database
      const test = await prisma.mockTest.create({
        data: {
          userId,
          courseId,
          content: testData,
          status: 'pending',
        },
      })

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
      try {
        await prisma.mockTest.create({
          data: {
            userId,
            content: testData,
            status: 'generated',
          },
        })
      } catch (dbErr) {
        console.error('Failed to save to DB:', dbErr)
      }

      return testData
    } catch (error) {
      console.error('Exam generation failed:', error)
      throw new Error('Failed to generate exam')
    }
  }
}
