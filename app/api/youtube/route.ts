import { prisma } from '@/lib/prisma'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { YouTubeService } from '@/services/youtube.service'
import { z } from 'zod'

const youtubeSchema = z.object({ video_url: z.string().min(1) })

export async function GET() {
  try {
    const user = await validateSession()
    const sessions = await prisma.youtubeSession.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } })
    return apiResponse(sessions)
  } catch (error: any) {
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to fetch sessions', error.message === 'Unauthorized' ? 401 : 500)
  }
}

export async function POST(req: Request) {
  try {
    const user = await validateSession()
    const body = await req.json()
    const parsed = youtubeSchema.parse(body)
    const result = await YouTubeService.processVideo(parsed.video_url, user.id)
    return apiResponse(result, 201)
  } catch (error: any) {
    if (error instanceof z.ZodError) return apiError(error.errors[0].message, 400)
    if (error.message === 'Unauthorized') return apiError('Unauthorized', 401)
    // Pass the real error message through so users/devs can see what actually failed
    return apiError(error.message || 'Failed to process video', 500)
  }
}
