import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-helpers'
import {
  Users,
  Search,
  MessageCircle,
  BookOpen,
  Wifi,
  ArrowLeft,
  UserPlus,
  Sparkles,
} from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Study Groups | NexusLearn AI' }

export default async function GroupsPage() {
  const user = await getCurrentUser()

  // Fetch groups the user belongs to
  const memberships = user ? await prisma.studyGroupMember.findMany({
    where: { userId: user.id },
    include: { group: true },
    orderBy: { createdAt: 'desc' }
  }) : []

  // Get member counts and online status for each group
  const groups = await Promise.all(
    memberships.map(async (membership) => {
      const group = membership.group
      if (!group) return null

      // Get total members count
      const memberCount = await prisma.studyGroupMember.count({
        where: { groupId: group.id }
      })

      // Get online members (presence within last 5 minutes)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      const groupMembers = await prisma.studyGroupMember.findMany({
        where: { groupId: group.id },
        select: { userId: true }
      })
      const memberIds = groupMembers.map(m => m.userId)
      
      const onlineCount = await prisma.presence.count({
        where: {
          userId: { in: memberIds },
          lastSeen: { gte: fiveMinutesAgo }
        }
      })

      return {
        ...group,
        memberCount,
        onlineCount,
        joinedAt: membership.createdAt,
      }
    })
  )

  const validGroups = groups.filter(Boolean)

  // Fetch suggested groups (groups user is NOT in)
  const joinedGroupIds = validGroups.map(g => g?.id).filter(Boolean)

  const suggestedGroups = await prisma.studyGroup.findMany({
    where: joinedGroupIds.length > 0 ? { id: { notIn: joinedGroupIds as string[] } } : {},
    include: {
      _count: { select: { members: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 4
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center space-x-3">
          <Link
            href="/campus"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-zinc-700 dark:text-gray-400 dark:hover:bg-zinc-800"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Study Groups</h1>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Find study partners, join groups, and learn together.
            </p>
          </div>
        </div>
        <div className="mt-4 flex space-x-3 md:mt-0">
          <button className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-300 dark:hover:bg-zinc-700">
            <Search className="mr-2 h-4 w-4" />
            Find Groups
          </button>
          <button className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
            <UserPlus className="mr-2 h-4 w-4" />
            Create Group
          </button>
        </div>
      </div>

      {/* My Groups */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <Users className="mr-2 h-5 w-5 text-indigo-500" />
          My Groups
        </h2>

        {validGroups.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {validGroups.map((group: any) => (
              <div
                key={group.id}
                className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-indigo-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-700"
              >
                {/* Group Header */}
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/20">
                    <Users className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="relative flex h-2.5 w-2.5">
                      {group.onlineCount > 0 && (
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                      )}
                      <span
                        className={`relative inline-flex h-2.5 w-2.5 rounded-full ${group.onlineCount > 0 ? 'bg-green-500' : 'bg-gray-300 dark:bg-zinc-600'}`}
                      />
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {group.onlineCount} online
                    </span>
                  </div>
                </div>

                {/* Group Info */}
                <h3 className="mt-3 text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {group.name}
                </h3>
                {group.description && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                    {group.description}
                  </p>
                )}

                {/* Subject & Members */}
                <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <BookOpen className="mr-1 h-3.5 w-3.5" />
                    <span className="truncate">{group.subject || 'General'}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="mr-1 h-3.5 w-3.5" />
                    <span>
                      {group.memberCount}
                      {group.maxMembers ? `/${group.maxMembers}` : ''} members
                    </span>
                  </div>
                </div>

                {/* Tags */}
                {group.tags && group.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {group.tags.slice(0, 3).map((tag: string) => (
                      <span
                        key={tag}
                        className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
                      >
                        {tag}
                      </span>
                    ))}
                    {group.tags.length > 3 && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-zinc-800 dark:text-gray-400">
                        +{group.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 flex space-x-2">
                  <button className="flex-1 inline-flex items-center justify-center rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
                    <MessageCircle className="mr-1.5 h-4 w-4" />
                    Chat
                  </button>
                  <button className="flex items-center justify-center rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 dark:border-zinc-700 dark:text-gray-400 dark:hover:bg-zinc-800">
                    <Wifi className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center dark:border-zinc-700 dark:bg-zinc-900">
            <Users className="mx-auto h-12 w-12 text-gray-300 dark:text-zinc-600" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
              No study groups yet
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Join a study group or create your own to start collaborating with fellow students.
            </p>
            <div className="mt-6 flex justify-center space-x-3">
              <button className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
                <Search className="mr-2 h-4 w-4" />
                Find Groups
              </button>
              <button className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-300">
                <UserPlus className="mr-2 h-4 w-4" />
                Create Group
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Groups */}
      {suggestedGroups && suggestedGroups.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <Sparkles className="mr-2 h-5 w-5 text-yellow-500" />
            Suggested Groups
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {suggestedGroups.map((group: any) => {
              const memberCount = group._count?.members || 0

              return (
                <div
                  key={group.id}
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-900/20">
                    <Users className="h-5 w-5 text-purple-500" />
                  </div>
                  <h3 className="mt-3 font-semibold text-gray-900 dark:text-white truncate">
                    {group.name}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {group.subject || 'General'} · {memberCount} members
                  </p>
                  <button className="mt-3 w-full rounded-lg border border-indigo-200 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-900/20">
                    Join Group
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
