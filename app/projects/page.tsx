import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-helpers'
import { FolderKanban, Plus, Users, CheckCircle2, Clock, BarChart3, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Group Project Hub | NexusLearn AI' }

export default async function ProjectsPage() {
  const user = await getCurrentUser()

  // Fetch projects the user created or is a member of
  const ownedProjects = user ? await prisma.project.findMany({
    where: { userId: user.id },
    include: {
      _count: { select: { members: true } },
      tasks: { select: { id: true, status: true } }
    },
    orderBy: { createdAt: 'desc' }
  }) : []

  const memberProjects = user ? await prisma.projectMember.findMany({
    where: { userId: user.id },
    include: {
      project: {
        include: {
          _count: { select: { members: true } },
          tasks: { select: { id: true, status: true } }
        }
      }
    }
  }) : []

  // Merge and deduplicate projects
  const memberProjectsFlat = memberProjects.map((m) => m.project).filter(Boolean)

  const allProjectIds = new Set<string>()
  const allProjects: any[] = []

  for (const p of [...ownedProjects, ...memberProjectsFlat]) {
    if (!allProjectIds.has(p.id)) {
      allProjectIds.add(p.id)
      allProjects.push(p)
    }
  }

  // Calculate progress for each project
  const projectsWithProgress = allProjects.map((project) => {
    const tasks = project.tasks || []
    const totalTasks = tasks.length
    const completedTasks = tasks.filter((t: any) => t.status === 'completed').length
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    const memberCount = project._count?.members || 0

    return {
      ...project,
      totalTasks,
      completedTasks,
      progress,
      memberCount,
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center space-x-3">
          <Link
            href="/campus"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-zinc-700 dark:text-gray-400 dark:hover:bg-zinc-800"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Group Project Hub</h1>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Manage collaborative projects, assign tasks, and track your team's progress.
            </p>
          </div>
        </div>
        <div className="mt-4 md:mt-0">
          <button className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
            <Plus className="mr-2 h-4 w-4" />
            Create New Project
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <FolderKanban className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Projects</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {projectsWithProgress.length}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/20">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {projectsWithProgress.filter((p) => p.progress === 100).length}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 dark:bg-orange-900/20">
              <Clock className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {projectsWithProgress.filter((p) => p.progress > 0 && p.progress < 100).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {projectsWithProgress.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projectsWithProgress.map((project) => (
            <div
              key={project.id}
              className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-indigo-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-700"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
                  <FolderKanban className="h-5 w-5 text-indigo-500" />
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    project.progress === 100
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : project.progress > 0
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-gray-400'
                  }`}
                >
                  {project.progress === 100 ? 'Completed' : project.progress > 0 ? 'In Progress' : 'Not Started'}
                </span>
              </div>

              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white truncate">
                {project.title}
              </h3>
              {project.description && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                  {project.description}
                </p>
              )}

              <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <Users className="mr-1 h-4 w-4" />
                  <span>{project.memberCount} members</span>
                </div>
                <div className="flex items-center">
                  <BarChart3 className="mr-1 h-4 w-4" />
                  <span>{project.completedTasks}/{project.totalTasks} tasks</span>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      project.progress === 100 ? 'bg-green-500' : project.progress > 50 ? 'bg-indigo-500' : 'bg-orange-400'
                    }`}
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              {project.dueDate && (
                <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
                  Due: {new Date(project.dueDate).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <FolderKanban className="mx-auto h-12 w-12 text-gray-300 dark:text-zinc-600" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
            No projects yet
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Create your first group project to start collaborating with teammates.
          </p>
          <button className="mt-6 inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
            <Plus className="mr-2 h-4 w-4" />
            Create New Project
          </button>
        </div>
      )}
    </div>
  )
}
