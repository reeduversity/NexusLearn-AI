import { prisma } from '@/lib/prisma'

export class CampusService {
  /**
   * Matches study groups based on shared interests/courses.
   * Queries the study_groups table and filters by overlapping interests.
   */
  static async matchStudyGroups(userId: string, interests: string[]) {
    try {
      // Fetch groups the user already belongs to
      const userGroups = await prisma.studyGroupMember.findMany({
        where: { userId },
        select: { groupId: true },
      })

      const joinedGroupIds = userGroups.map((g) => g.groupId)

      // Fetch all groups not already joined, ordered by recent
      const allGroups = await prisma.studyGroup.findMany({
        where: joinedGroupIds.length > 0
          ? { id: { notIn: joinedGroupIds } }
          : undefined,
        include: {
          _count: { select: { members: true } },
        },
        orderBy: { createdAt: 'desc' },
      })

      // Filter by tag overlap if interests provided
      if (interests.length > 0) {
        return allGroups.filter((group) => {
          const tags = (group.tags as string[]) || []
          return tags.some((tag) => interests.includes(tag))
        })
      }

      return allGroups
    } catch (error) {
      console.error('Study group matching failed:', error)
      throw new Error('Failed to match study groups')
    }
  }

  /**
   * Fetches the presence status for a given user from the presence table.
   */
  static async getPresenceStatus(userId: string) {
    try {
      const presence = await prisma.presence.findUnique({
        where: { userId },
      })

      return presence || { status: 'offline', lastSeen: null }
    } catch (error) {
      console.error('Presence fetch failed:', error)
      throw new Error('Failed to fetch presence status')
    }
  }

  /**
   * Posts a new entry to the digital noticeboard.
   */
  static async postNoticeboard(
    userId: string,
    title: string,
    message: string,
    type: 'notice' | 'lost_found'
  ) {
    try {
      const data = await prisma.digitalNoticeboard.create({
        data: {
          userId,
          title,
          message,
          type,
        },
      })

      return data
    } catch (error) {
      console.error('Noticeboard post failed:', error)
      throw new Error('Failed to post to noticeboard')
    }
  }

  /**
   * Fetches all noticeboard entries, optionally filtered by type.
   */
  static async getNoticeboardEntries(type?: 'notice' | 'lost_found') {
    try {
      const data = await prisma.digitalNoticeboard.findMany({
        where: type ? { type } : undefined,
        include: {
          user: {
            include: {
              profile: {
                select: { fullName: true, avatarUrl: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      })

      return data || []
    } catch (error) {
      console.error('Noticeboard fetch failed:', error)
      throw new Error('Failed to fetch noticeboard entries')
    }
  }

  /**
   * Fetches all safety alerts, ordered by most recent.
   */
  static async getSafetyAlerts() {
    try {
      const data = await prisma.safetyAlert.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
      })

      return data || []
    } catch (error) {
      console.error('Safety alerts fetch failed:', error)
      throw new Error('Failed to fetch safety alerts')
    }
  }
}
