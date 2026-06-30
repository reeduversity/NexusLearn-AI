import { prisma } from '@/lib/prisma'

export class AnalyticsService {
  /**
   * Analyzes quiz attempts to determine weak topics and updates the topic strength meter.
   */
  static async calculateWeaknesses(userId: string) {
    // Fetch all quiz attempts for the user
    const attempts = await prisma.quizAttempt.findMany({
      where: { userId },
      select: { topic: true, score: true, maxScore: true },
    })

    if (!attempts || attempts.length === 0) throw new Error('Failed to fetch quiz attempts')

    // Calculate aggregated topic strength
    const topicStats: Record<string, { totalScore: number, totalMax: number, attempts: number }> = {}

    attempts.forEach(attempt => {
      if (!topicStats[attempt.topic]) {
        topicStats[attempt.topic] = { totalScore: 0, totalMax: 0, attempts: 0 }
      }
      topicStats[attempt.topic].totalScore += attempt.score
      topicStats[attempt.topic].totalMax += attempt.maxScore
      topicStats[attempt.topic].attempts += 1
    })

    const weaknesses = []
    
    // Determine weakness (if average score is below 60%)
    for (const [topic, stats] of Object.entries(topicStats)) {
      const averagePercentage = (stats.totalScore / stats.totalMax) * 100
      if (averagePercentage < 60) {
        weaknesses.push({
          userId,
          topic,
          currentStrength: averagePercentage,
          status: 'active' as const,
        })
      }
    }

    // Upsert into weaknesses table
    if (weaknesses.length > 0) {
      for (const w of weaknesses) {
        await prisma.weakness.upsert({
          where: { userId_topic: { userId: w.userId, topic: w.topic } },
          update: { currentStrength: w.currentStrength, status: w.status },
          create: w,
        })
      }
    }

    return weaknesses
  }

  /**
   * Fetches the activity heatmap data (study sessions per day).
   */
  static async getRevisionHeatmap(userId: string) {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const data = await prisma.studySession.findMany({
      where: {
        userId,
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { createdAt: true, durationMinutes: true },
    })

    // Group by date
    const heatmap: Record<string, number> = {}
    data.forEach(session => {
      const date = new Date(session.createdAt).toISOString().split('T')[0]
      heatmap[date] = (heatmap[date] || 0) + session.durationMinutes
    })

    return Object.entries(heatmap).map(([date, duration]) => ({ date, duration }))
  }
}
