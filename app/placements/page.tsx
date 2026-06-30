import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-helpers'
import Link from 'next/link'
import {
  Code2,
  Brain,
  Users,
  TrendingUp,
  Target,
  CheckCircle2,
  BookOpen,
  Zap,
  ArrowRight,
  BarChart3,
} from 'lucide-react'

export const metadata = { title: 'Placement Mode | NexusLearn AI' }

const placementSections = [
  {
    title: 'DSA Practice',
    description: 'Master Data Structures & Algorithms with curated problem sets, pattern recognition, and step-by-step solutions.',
    icon: Code2,
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    border: 'border-blue-100 dark:border-blue-900/30',
    topics: ['Arrays & Strings', 'Trees & Graphs', 'Dynamic Programming', 'Sorting & Searching', 'Linked Lists', 'Stacks & Queues'],
    href: '/interviews',
  },
  {
    title: 'Aptitude Tests',
    description: 'Sharpen quantitative, logical, and verbal reasoning skills with timed practice tests and detailed explanations.',
    icon: Brain,
    color: 'text-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-950/20',
    border: 'border-purple-100 dark:border-purple-900/30',
    topics: ['Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability', 'Data Interpretation', 'Pattern Recognition', 'Puzzles'],
    href: '/interviews',
  },
  {
    title: 'HR Preparation',
    description: 'Practice common HR questions, learn the STAR method, and build confidence for behavioral rounds.',
    icon: Users,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
    border: 'border-emerald-100 dark:border-emerald-900/30',
    topics: ['Tell Me About Yourself', 'Strengths & Weaknesses', 'Conflict Resolution', 'Leadership Examples', 'Salary Negotiation', 'Company Research'],
    href: '/interviews',
  },
]

export default async function PlacementsPage() {
  const user = await getCurrentUser()

  let totalSessions = 0
  let completedSessions = 0
  let recentSessions: any[] = []

  if (user) {
    const [total, completed, recent] = await Promise.all([
      prisma.practiceSession.count({ where: { userId: user.id } }),
      prisma.practiceSession.count({ where: { userId: user.id, status: 'completed' } }),
      prisma.practiceSession.findMany({
        where: { userId: user.id },
        select: { id: true, topic: true, score: true, status: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ])
    totalSessions = total
    completedSessions = completed
    recentSessions = recent
  }

  const completionRate = totalSessions && totalSessions > 0
    ? Math.round((completedSessions / totalSessions) * 100)
    : 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Placement Mode</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Comprehensive placement preparation — DSA, Aptitude, and HR in one place.
        </p>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-indigo-100 p-2 dark:bg-indigo-900/30">
              <Zap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalSessions}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Sessions</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900/30">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{completedSessions}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-900/30">
              <BarChart3 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{completionRate}%</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Completion Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Placement Sections */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {placementSections.map((section) => {
          const Icon = section.icon
          return (
            <div key={section.title} className="rounded-xl border border-gray-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <div className={`inline-flex rounded-xl p-3 ${section.bg} border ${section.border} mb-4`}>
                <Icon className={`h-6 w-6 ${section.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{section.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{section.description}</p>

              {/* Topics */}
              <div className="space-y-2 mb-6">
                {section.topics.map((topic) => (
                  <div key={topic} className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                    <Target className="mr-2 h-3.5 w-3.5 text-gray-400" />
                    {topic}
                  </div>
                ))}
              </div>

              <Link
                href={section.href}
                className="w-full inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
              >
                Start Practice
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          )
        })}
      </div>

      {/* Recent Practice Sessions */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <TrendingUp className="mr-2 h-5 w-5 text-indigo-500" />
          Recent Practice Sessions
        </h2>
        {recentSessions && recentSessions.length > 0 ? (
          <div className="space-y-3">
            {recentSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100 dark:bg-zinc-800/50 dark:border-zinc-800">
                <div className="flex items-center space-x-3">
                  <div className={`rounded-full p-1.5 ${
                    session.topic === 'dsa' ? 'bg-blue-100 dark:bg-blue-900/30' :
                    session.topic === 'aptitude' ? 'bg-purple-100 dark:bg-purple-900/30' :
                    'bg-emerald-100 dark:bg-emerald-900/30'
                  }`}>
                    {session.topic === 'dsa' ? <Code2 className="h-3.5 w-3.5 text-blue-500" /> :
                     session.topic === 'aptitude' ? <Brain className="h-3.5 w-3.5 text-purple-500" /> :
                     <Users className="h-3.5 w-3.5 text-emerald-500" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{session.topic} Practice</p>
                    <p className="text-xs text-gray-500">{new Date(session.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {session.score !== null && (
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{session.score}%</span>
                  )}
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    session.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                  }`}>
                    {session.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border border-dashed border-gray-200 dark:border-zinc-700 rounded-lg">
            <BookOpen className="mx-auto h-8 w-8 text-gray-300 dark:text-zinc-600 mb-2" />
            <p className="text-sm text-gray-500">No practice sessions yet. Start practicing above!</p>
          </div>
        )}
      </div>
    </div>
  )
}
