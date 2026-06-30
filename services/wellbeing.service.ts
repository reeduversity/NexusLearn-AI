import { prisma } from '@/lib/prisma'

export class WellbeingService {
  /**
   * Checks for burnout by analyzing study_sessions and focus_sessions over the last 7 days.
   * Returns a burnout level with a message and actionable suggestion.
   */
  static async checkBurnout(userId: string): Promise<{
    level: 'low' | 'medium' | 'high'
    message: string
    suggestion: string
    avgDailyHours: number
  }> {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const cutoff = sevenDaysAgo

    // Fetch study sessions and focus sessions in parallel
    const [studySessions, focusSessions] = await Promise.all([
      prisma.studySession.findMany({
        where: { userId, createdAt: { gte: cutoff } },
        select: { durationMinutes: true },
      }),
      prisma.focusSession.findMany({
        where: { userId, createdAt: { gte: cutoff } },
        select: { durationMinutes: true },
      }),
    ])

    const totalStudyMinutes = (studySessions || []).reduce(
      (sum, s) => sum + (s.durationMinutes || 0),
      0
    )
    const totalFocusMinutes = (focusSessions || []).reduce(
      (sum, s) => sum + (s.durationMinutes || 0),
      0
    )

    const totalMinutes = totalStudyMinutes + totalFocusMinutes
    const totalHours = totalMinutes / 60
    const avgDailyHours = Math.round((totalHours / 7) * 10) / 10

    if (avgDailyHours > 8) {
      return {
        level: 'high',
        message: `You've averaged ${avgDailyHours} hours/day over the last 7 days. This is significantly above a healthy threshold.`,
        suggestion:
          'Take a proper break today. Go for a walk, meditate, or spend time with friends. Your brain needs recovery to consolidate learning effectively.',
        avgDailyHours,
      }
    }

    if (avgDailyHours > 5) {
      return {
        level: 'medium',
        message: `You've averaged ${avgDailyHours} hours/day. You're working hard — make sure you're balancing rest too.`,
        suggestion:
          'Schedule regular 15-minute breaks between sessions. Try the Pomodoro technique to maintain focus without exhaustion.',
        avgDailyHours,
      }
    }

    return {
      level: 'low',
      message: `You've averaged ${avgDailyHours} hours/day. Your workload looks healthy and sustainable.`,
      suggestion:
        'Great balance! Keep maintaining consistent study habits. Consider slightly increasing intensity if you have upcoming exams.',
      avgDailyHours,
    }
  }

  /**
   * Aggregates budget_entries for the current month to produce a financial summary.
   */
  static async getFinanceSummary(userId: string): Promise<{
    totalIncome: number
    totalExpenses: number
    balance: number
    topCategory: string
  }> {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    const entries = await prisma.budgetEntry.findMany({
      where: {
        userId,
        createdAt: { gte: startOfMonth, lte: endOfMonth },
      },
      select: { amount: true, type: true, category: true },
    })

    if (!entries || entries.length === 0) {
      return { totalIncome: 0, totalExpenses: 0, balance: 0, topCategory: 'N/A' }
    }

    let totalIncome = 0
    let totalExpenses = 0
    const categoryTotals: Record<string, number> = {}

    entries.forEach((entry) => {
      if (entry.type === 'income') {
        totalIncome += entry.amount
      } else {
        totalExpenses += entry.amount
        categoryTotals[entry.category] = (categoryTotals[entry.category] || 0) + entry.amount
      }
    })

    // Determine the top spending category
    let topCategory = 'N/A'
    let maxSpend = 0
    for (const [category, total] of Object.entries(categoryTotals)) {
      if (total > maxSpend) {
        maxSpend = total
        topCategory = category
      }
    }

    return {
      totalIncome: Math.round(totalIncome * 100) / 100,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      balance: Math.round((totalIncome - totalExpenses) * 100) / 100,
      topCategory,
    }
  }

  /**
   * Logs a wellbeing entry (mood, energy, optional notes) for the authenticated user.
   */
  static async logWellbeing(
    userId: string,
    mood: number,
    energy: number,
    notes: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await prisma.wellbeingLog.create({
        data: {
          userId,
          mood,
          energy,
          notes,
        },
      })
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Fetches recent wellbeing logs for the user.
   */
  static async getRecentLogs(userId: string, limit = 10) {
    const data = await prisma.wellbeingLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return data || []
  }

  /**
   * AI Wellbeing Companion — generates a supportive response based on the user's recent mood and context.
   */
  static async getWellbeingAdvice(userId: string, userMessage: string): Promise<string> {
    const recentLogs = await this.getRecentLogs(userId, 5)

    const moodContext = recentLogs.length > 0
      ? `Recent mood logs: ${recentLogs.map(l => `Mood: ${l.mood}/5, Energy: ${l.energy}/5, Notes: "${l.notes || 'none'}"`).join('; ')}`
      : 'No recent mood logs available.'

    const burnout = await this.checkBurnout(userId)

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
            content: `You are a compassionate AI Wellbeing Companion for a university student. Be warm, empathetic, and supportive. Provide practical advice on mental health, stress management, and study-life balance. Never diagnose conditions — instead encourage seeking professional help when appropriate.

Context about this student:
- Burnout level: ${burnout.level} (avg ${burnout.avgDailyHours} hours/day of study)
- ${moodContext}

Keep responses concise (2-3 paragraphs max).`,
          },
          { role: 'user', content: userMessage },
        ],
      }),
    })

    const data = await response.json()
    return data.choices?.[0]?.message?.content || 'I\'m here for you. Could you tell me more about how you\'re feeling?'
  }
}
