import { createClient } from '@/lib/supabase/server'

export class PlannerService {
  /**
   * Parses a syllabus document (text) and automatically generates a study plan via AI.
   */
  static async autoPlanSyllabus(syllabusText: string, userId: string, targetDate: string) {
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
              content: `You are an expert AI Study Planner. Extract main topics from the syllabus and create a realistic study plan.
Output ONLY valid JSON in this format:
{
  "plan_title": "Course Name Plan",
  "topics": [
    {
      "topic": "Topic Name",
      "estimated_hours": 4,
      "difficulty": "hard",
      "week": 1,
      "sub_tasks": ["Read Chapter 1", "Solve Practice Problems"]
    }
  ]
}`
            },
            { role: 'user', content: syllabusText.slice(0, 15000) }
          ],
          response_format: { type: 'json_object' }
        }),
      })

      if (!response.ok) throw new Error('Failed to parse syllabus')
      
      const data = await response.json()
      const parsedTopics = JSON.parse(data.choices[0].message.content)

      const supabase = await createClient()
      
      // Save the overall study plan
      const { data: plan, error: planError } = await supabase
        .from('study_plans')
        .insert({
          user_id: userId,
          title: parsedTopics.plan_title || 'Auto-generated Plan',
          target_date: targetDate,
          content: JSON.stringify(parsedTopics)
        })
        .select()
        .single()

      if (planError) {
        console.error('Failed to save to DB (study_plans table may not exist or schema mismatch). Returning JSON anyway:', planError)
        return parsedTopics
      }

      return parsedTopics
    } catch (error) {
      console.error('Planner generation failed:', error)
      throw new Error('Failed to auto-plan syllabus')
    }
  }
}
