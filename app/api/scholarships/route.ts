import { prisma } from '@/lib/prisma'
import { validateSession, apiResponse, apiError } from '@/lib/api-helper'
import { ScholarshipService } from '@/services/scholarship.service'

export async function GET() {
  try {
    await validateSession()
    const scholarships = await prisma.scholarship.findMany({ orderBy: { createdAt: 'desc' } })
    return apiResponse(scholarships)
  } catch (error: any) {
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : (error.message || 'Failed to fetch scholarships'), error.message === 'Unauthorized' ? 401 : 500)
  }
}

export async function POST(req: Request) {
  try {
    const user = await validateSession()
    const body = await req.json()
    const matches = await ScholarshipService.findMatches(body.profile || '')
    await prisma.searchLog.create({ data: { userId: user.id, query: 'scholarship_search', resultsCount: matches?.length || 0 } }).catch(() => {})
    return apiResponse(matches)
  } catch (error: any) {
    return apiError(error.message === 'Unauthorized' ? 'Unauthorized' : (error.message || 'Failed to find scholarship matches'), error.message === 'Unauthorized' ? 401 : 500)
  }
}
