import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-helpers'
import { redirect } from 'next/navigation'
import {
  FlaskConical,
  ShieldCheck,
  FileEdit,
  BookOpen,
  Upload,
  Clock,
  CheckCircle2,
  Loader2,
  FolderSearch,
  ArrowRight,
} from 'lucide-react'

export const metadata = { title: 'Research Hub | NexusLearn AI' }

export default async function ResearchPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const projects = await prisma.researchProject.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  })

  const tools = [
    {
      title: 'Research Synthesizer',
      description: 'Combine multiple sources into a coherent, well-structured research summary powered by AI.',
      icon: FlaskConical,
      color: 'indigo',
      href: '/research',
      bgLight: 'bg-indigo-50',
      bgDark: 'dark:bg-indigo-900/20',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      btnBg: 'bg-indigo-600 hover:bg-indigo-700',
    },
    {
      title: 'Academic Integrity Coach',
      description: 'Scan your writing for potential integrity issues, missing citations, and unattributed claims.',
      icon: ShieldCheck,
      color: 'emerald',
      href: '/writing',
      bgLight: 'bg-emerald-50',
      bgDark: 'dark:bg-emerald-900/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      btnBg: 'bg-emerald-600 hover:bg-emerald-700',
    },
    {
      title: 'Writing Shield',
      description: 'Real-time writing assistant that monitors your academic content for integrity and quality.',
      icon: FileEdit,
      color: 'amber',
      href: '/writing',
      bgLight: 'bg-amber-50',
      bgDark: 'dark:bg-amber-900/20',
      iconColor: 'text-amber-600 dark:text-amber-400',
      btnBg: 'bg-amber-600 hover:bg-amber-700',
    },
    {
      title: 'Citation Builder',
      description: 'Generate perfectly formatted citations in APA, MLA, or IEEE style with one click.',
      icon: BookOpen,
      color: 'pink',
      href: '/citations',
      bgLight: 'bg-pink-50',
      bgDark: 'dark:bg-pink-900/20',
      iconColor: 'text-pink-600 dark:text-pink-400',
      btnBg: 'bg-pink-600 hover:bg-pink-700',
    },
  ]

  function getStatusBadge(status: string) {
    switch (status) {
      case 'completed':
        return { icon: CheckCircle2, text: 'Completed', classes: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' }
      case 'in_progress':
        return { icon: Loader2, text: 'In Progress', classes: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' }
      default:
        return { icon: Clock, text: 'Draft', classes: 'bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-400' }
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Research Hub</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            AI-powered tools to supercharge your academic research and writing.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors self-start">
          <Upload className="h-4 w-4" />
          Upload Sources
        </button>
      </div>

      {/* Tool Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {tools.map((tool) => {
          const Icon = tool.icon
          return (
            <a
              key={tool.title}
              href={tool.href}
              className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 hover:shadow-md transition-all hover:border-gray-300 dark:hover:border-zinc-700 flex flex-col justify-between"
            >
              <div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${tool.bgLight} ${tool.bgDark} mb-3`}>
                  <Icon className={`h-5 w-5 ${tool.iconColor}`} />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1.5">
                  {tool.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                  {tool.description}
                </p>
              </div>
              <div className={`inline-flex items-center gap-1.5 text-sm font-medium ${tool.iconColor} group-hover:gap-2.5 transition-all`}>
                Open Tool
                <ArrowRight className="h-4 w-4" />
              </div>
            </a>
          )
        })}
      </div>

      {/* Research Projects List */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-gray-200 dark:border-zinc-800 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FolderSearch className="h-5 w-5 text-indigo-500" />
            Your Research Projects
          </h2>
        </div>

        {projects && projects.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-zinc-800">
            {projects.map((project: any) => {
              const badge = getStatusBadge(project.status)
              const BadgeIcon = badge.icon
              return (
                <div
                  key={project.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {project.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {new Date(project.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                      {project.sourcesCount && (
                        <span className="ml-2">· {project.sourcesCount} source{project.sourcesCount !== 1 ? 's' : ''}</span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.classes}`}>
                      <BadgeIcon className={`h-3 w-3 ${project.status === 'in_progress' ? 'animate-spin' : ''}`} />
                      {badge.text}
                    </span>
                    <button className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium transition-colors">
                      View
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-900/20 mb-4">
              <FolderSearch className="h-7 w-7 text-indigo-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
              No research projects yet
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm">
              Upload your source materials and use the Research Synthesizer to create your first AI-powered research project.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
