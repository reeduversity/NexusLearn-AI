import { prisma } from '@/lib/prisma'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { CampusService } from '@/services/campus.service'
import { z } from 'zod'

const joinGroupSchema = z.object({ group_id: z.string().uuid() })

export async function GET(req: Request) {
  try {
    const user = await validateSession()
    const url = new URL(req.url)
    const interestsParam = url.searchParams.get('interests')
    const interests = interestsParam ? interestsParam.split(',') : []
    const groups = await CampusService.matchStudyGroups(user.id, interests)
    return apiResponse(groups)
  } catch (error: any) {
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to match study groups', error.message === 'Unauthorized' ? 401 : 500)
  }
}

export async function POST(req: Request) {
  try {
    const user = await validateSession()
    const body = await req.json()
    const parsed = joinGroupSchema.parse(body)
    const member = await prisma.studyGroupMember.create({ data: { groupId: parsed.group_id, userId: user.id } })
    return apiResponse(member, 201)
  } catch (error: any) {
    if (error instanceof z.ZodError) return apiError(error.errors[0].message, 400)
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to join study group', error.message === 'Unauthorized' ? 401 : 500)
  }
}
