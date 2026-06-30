import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-helpers'
import Link from 'next/link'
import {
  GraduationCap,
  FileQuestion,
  Mic,
  Dumbbell,
  ClipboardList,
  ArrowRight,
  Trophy,
  Clock,
  TrendingUp,
  BookOpen,
} from 'lucide-react'

export const metadata = { title: 'Exams Hub | NexusLearn AI' }

export default async function ExamsHubPage() {
  const user = await getCurrentUser()

  let recentMockTests: any[] = []
  let recentPyqPapers: any[] = []
  let totalMockTests = 0
  let totalPyqPapers = 0
  let completedTests = 0

  if (user) {
    // Fetch recent mock tests and PYQ papers in parallel
    const [
      tests,
      pyqs,
      testsCount,
      pyqsCount,
      completedTestsCount,
    ] = await Promise.all([
      prisma.mockTest.findMany({
        where: { userId: user.id },
        select: { id: true, courseId: true, status: true, createdAt: true, content: true },
        orderBy: { createdAt: 'desc' },
        take: 3
      }),
      prisma.pyqPaper.findMany({
        where: { userId: user.id },
        select: { id: true, courseId: true, year: true, topicTags: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 3
      }),
      prisma.mockTest.count({ where: { userId: user.id } }),
      prisma.pyqPaper.count({ where: { userId: user.id } }),
      prisma.mockTest.count({ where: { userId: user.id, status: 'completed' } }),
    ])
    
    recentMockTests = tests
    recentPyqPapers = pyqs
    totalMockTests = testsCount
    totalPyqPapers = pyqsCount
    completedTests = completedTestsCount
  }

  const examModules = [
    {
      name: 'PYQ Analyzer',
      description: 'Upload previous year papers, analyze patterns, and get AI-powered topic predictions.',
      icon: FileQuestion,
      href: '/pyq',
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      borderHover: 'hover:border-blue-500',
      stat: `${totalPyqPapers} papers`,
    },
    {
      name: 'Viva Mode',
      description: 'AI-powered viva practice with real-time question-answer sessions on any topic.',
      icon: Mic,
      href: '/viva',
      color: 'text-rose-500',
      bg: 'bg-rose-50 dark:bg-rose-900/20',
      borderHover: 'hover:border-rose-500',
      stat: 'AI Powered',
    },
    {
      name: 'Practice Engine',
      description: 'Topic-wise practice sessions with progress tracking and adaptive difficulty.',
      icon: Dumbbell,
      href: '/practice',
      color: 'text-emerald-500',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      borderHover: 'hover:border-emerald-500',
      stat: 'Adaptive',
    },
    {
      name: 'Mock Tests',
      description: 'Generate AI-powered mock exams based on predicted topics and your weak areas.',
      icon: ClipboardList,
      href: '/mock-tests',
      color: 'text-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      borderHover: 'hover:border-purple-500',
      stat: `${totalMockTests} tests`,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <GraduationCap className="mr-3 h-8 w-8 text-indigo-500" />
            Exams Hub
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Prepare smarter with AI-powered exam tools, PYQ analysis, and mock tests.
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-900/20">
              <ClipboardList className="h-5 w-5 text-purple-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Mock Tests</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalMockTests}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
              <Trophy className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">Completed Tests</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{completedTests}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <FileQuestion className="h-5 w-5 text-blue-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">PYQ Papers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalPyqPapers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Module Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {examModules.map((mod) => (
          <Link key={mod.name} href={mod.href}>
            <div className={`group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all ${mod.borderHover} hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 cursor-pointer`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${mod.bg}`}>
                    <mod.icon className={`h-6 w-6 ${mod.color}`} />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{mod.name}</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{mod.description}</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <div className="mt-4 flex items-center">
                <span className={`text-xs font-medium ${mod.color} px-2 py-1 rounded-full ${mod.bg}`}>
                  {mod.stat}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Mock Tests */}
        <div className="rounded-xl border border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
          <div className="border-b border-gray-200 dark:border-zinc-800 px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
              <Clock className="mr-2 h-5 w-5 text-purple-500" />
              Recent Mock Tests
            </h2>
            <Link href="/mock-tests" className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
              View All
            </Link>
          </div>
          <div className="p-6">
            {recentMockTests && recentMockTests.length > 0 ? (
              <div className="space-y-3">
                {recentMockTests.map((test) => (
                  <div
                    key={test.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 p-4 transition-colors hover:bg-gray-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                  >
                    <div className="flex items-center">
                      <div className={`h-2.5 w-2.5 rounded-full ${test.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Mock Test — {test.courseId}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(test.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        test.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                      }`}
                    >
                      {test.status === 'completed' ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <ClipboardList className="mx-auto h-12 w-12 text-gray-300 dark:text-zinc-600" />
                <h3 className="mt-3 text-sm font-medium text-gray-900 dark:text-white">No mock tests yet</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Generate your first AI-powered mock test to get started.
                </p>
                <Link
                  href="/mock-tests"
                  className="mt-4 inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
                >
                  Create Mock Test
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent PYQ Papers */}
        <div className="rounded-xl border border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
          <div className="border-b border-gray-200 dark:border-zinc-800 px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-blue-500" />
              Recent PYQ Papers
            </h2>
            <Link href="/pyq" className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
              View All
            </Link>
          </div>
          <div className="p-6">
            {recentPyqPapers && recentPyqPapers.length > 0 ? (
              <div className="space-y-3">
                {recentPyqPapers.map((paper) => (
                  <div
                    key={paper.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 p-4 transition-colors hover:bg-gray-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                  >
                    <div className="flex items-center">
                      <FileQuestion className="h-5 w-5 text-blue-500" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {paper.courseId} — {paper.year}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {(paper.topicTags as string[])?.length || 0} topics tagged
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(paper.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <FileQuestion className="mx-auto h-12 w-12 text-gray-300 dark:text-zinc-600" />
                <h3 className="mt-3 text-sm font-medium text-gray-900 dark:text-white">No PYQ papers yet</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Upload previous year question papers to get AI-powered predictions.
                </p>
                <Link
                  href="/pyq"
                  className="mt-4 inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
                >
                  Upload PYQ Paper
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CTA Banner */}
      <div className="rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <GraduationCap className="h-32 w-32" />
        </div>
        <div className="relative">
          <h2 className="text-xl font-bold">Ready for your next exam?</h2>
          <p className="mt-2 text-sm text-indigo-100 max-w-lg">
            Let AI analyze your study patterns, predict important topics, and generate personalized mock tests tailored to your learning gaps.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/mock-tests"
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              Generate Mock Test
            </Link>
            <Link
              href="/viva"
              className="rounded-lg border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
            >
              Start Viva Practice
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
