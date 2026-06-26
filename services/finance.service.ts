export class FinanceService {
  /**
   * Generates AI financial advice and budgeting strategy based on a student's expenses and income.
   */
  static async analyzeBudget(income: number, expenses: { category: string, amount: number }[]) {
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
              content: `You are an expert financial advisor for college students.
Given the student's monthly income/allowance and their list of expenses, generate a financial health report.
Provide specific, actionable advice to save money and optimize their budget.
Return ONLY valid JSON in the following format:
{
  "health_score": 85, // Integer 0-100
  "summary": "A 2-sentence summary of their financial health.",
  "advice": ["Actionable tip 1", "Actionable tip 2", "Actionable tip 3"],
  "savings_potential": 150 // Estimated amount they could save by cutting unnecessary costs
}`
            },
            {
              role: 'user',
              content: `Income: $${income}\nExpenses: ${JSON.stringify(expenses)}`
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
      console.error('Finance analysis failed:', error)
      throw new Error('Failed to analyze budget')
    }
  }
}
