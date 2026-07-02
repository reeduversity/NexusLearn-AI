import { prisma } from '@/lib/prisma'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { z } from 'zod'

const vivaSchema = z.object({ topic: z.string().min(1) })

export async function GET() {
  try {
    const user = await validateSession()
    const sessions = await prisma.vivaSession.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } })
    return apiResponse(sessions)
  } catch (error: any) {
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : (error.message || 'Failed to fetch viva sessions'), error.message === 'Unauthorized' ? 401 : 500)
  }
}

export async function POST(req: Request) {
  try {
    const user = await validateSession()
    const body = await req.json()
    const parsed = vivaSchema.parse(body)
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST', headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'llama-3.1-8b-instant', messages: [{ role: 'system', content: 'You are an expert university professor conducting a viva voce. Generate 5 challenging questions on the given topic. Return valid JSON: { "questions": [{"q": "Question?", "hint": "Expected area of answer"}] }' }, { role: 'user', content: parsed.topic }], response_format: { type: 'json_object' } }),
    })
    const data = await response.json()
    const questions = JSON.parse(data.choices[0].message.content)
    const session = await prisma.vivaSession.create({ data: { userId: user.id, topic: parsed.topic, questions: questions.questions || questions, status: 'in_progress' } })
    return apiResponse(session, 201)
  } catch (error: any) {
    if (error instanceof z.ZodError) return apiError(error.errors[0].message, 400)
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : (error.message || 'Failed to start viva session'), error.message === 'Unauthorized' ? 401 : 500)
  }
}
