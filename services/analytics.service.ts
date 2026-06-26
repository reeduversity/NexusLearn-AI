import { createClient } from '@/lib/supabase/server'

export class AnalyticsService {
  /**
   * Analyzes quiz attempts to determine weak topics and updates the topic strength meter.
   */
  static async calculateWeaknesses(userId: string) {
    const supabase = await createClient()

    // Fetch all quiz attempts for the user
    const { data: attempts, error } = await supabase
      .from('quiz_attempts')
      .select('topic, score, max_score')
      .eq('user_id', userId)

    if (error || !attempts) throw new Error('Failed to fetch quiz attempts')

    // Calculate aggregated topic strength
    const topicStats: Record<string, { totalScore: number, totalMax: number, attempts: number }> = {}

    attempts.forEach(attempt => {
      if (!topicStats[attempt.topic]) {
        topicStats[attempt.topic] = { totalScore: 0, totalMax: 0, attempts: 0 }
      }
      topicStats[attempt.topic].totalScore += attempt.score
      topicStats[attempt.topic].totalMax += attempt.max_score
      topicStats[attempt.topic].attempts += 1
    })

    const weaknesses = []
    
    // Determine weakness (if average score is below 60%)
    for (const [topic, stats] of Object.entries(topicStats)) {
      const averagePercentage = (stats.totalScore / stats.totalMax) * 100
      if (averagePercentage < 60) {
        weaknesses.push({
          user_id: userId,
          topic: topic,
          current_strength: averagePercentage,
          status: 'active'
        })
      }
    }

    // Upsert into weaknesses table
    if (weaknesses.length > 0) {
      await supabase.from('weaknesses').upsert(weaknesses, { onConflict: 'user_id, topic' })
    }

    return weaknesses
  }

  /**
   * Fetches the activity heatmap data (study sessions per day).
   */
  static async getRevisionHeatmap(userId: string) {
    const supabase = await createClient()
    
    // Fetch last 30 days of study sessions
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data, error } = await supabase
      .from('study_sessions')
      .select('created_at, duration_minutes')
      .eq('user_id', userId)
      .gte('created_at', thirtyDaysAgo.toISOString())

    if (error) return []

    // Group by date
    const heatmap: Record<string, number> = {}
    data.forEach(session => {
      const date = new Date(session.created_at).toISOString().split('T')[0]
      heatmap[date] = (heatmap[date] || 0) + session.duration_minutes
    })

    return Object.entries(heatmap).map(([date, duration]) => ({ date, duration }))
  }
}
