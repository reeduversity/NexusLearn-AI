import { prisma } from '@/lib/prisma'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { InternshipService } from '@/services/internship.service'

export async function GET() {
  try {
    await validateSession()
    const internships = await prisma.internship.findMany({ orderBy: { createdAt: 'desc' } })
    return apiResponse(internships)
  } catch (error: any) {
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to fetch internships', error.message === 'Unauthorized' ? 401 : 500)
  }
}

export async function POST(req: Request) {
  try {
    await validateSession()
    const body = await req.json()
    const matches = await InternshipService.findMatches(body.skills || '')
    return apiResponse(matches)
  } catch (error: any) {
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : 'Failed to find internship matches', error.message === 'Unauthorized' ? 401 : 500)
  }
}
