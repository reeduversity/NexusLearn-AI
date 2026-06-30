import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-helpers'
import {
  BookOpen,
  Upload,
  Download,
  FileText,
  File,
  Video,
  Image as ImageIcon,
  ArrowLeft,
  Search,
  Filter,
  Eye,
  User,
} from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Resource Sharing | NexusLearn AI' }

const typeIcons: Record<string, typeof FileText> = {
  pdf: FileText,
  document: FileText,
  doc: FileText,
  docx: FileText,
  video: Video,
  image: ImageIcon,
  default: File,
}

const typeColors: Record<string, { color: string; bg: string }> = {
  pdf: { color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
  document: { color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  doc: { color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  docx: { color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  video: { color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  image: { color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
  default: { color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-zinc-800' },
}

function getTypeConfig(type: string) {
  const key = type?.toLowerCase() || 'default'
  return {
    icon: typeIcons[key] || typeIcons.default,
    ...(typeColors[key] || typeColors.default),
  }
}

export default async function ResourcesPage() {
  const user = await getCurrentUser()

  // Fetch all shared resources
  const resources = await prisma.resource.findMany({
    include: { user: { include: { profile: { select: { fullName: true } } } } },
    orderBy: { createdAt: 'desc' }
  })

  // Fetch user's own resources count
  const myResourceCount = user ? await prisma.resource.count({
    where: { userId: user.id }
  }) : 0

  const totalDownloads = 0

  return (
    <div className="space-y-6">
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Resource Sharing
            </h1>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Share and discover study materials, notes, and past papers from peers.
            </p>
          </div>
        </div>
        <div className="mt-4 flex space-x-3 md:mt-0">
          <button className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-300 dark:hover:bg-zinc-700">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </button>
          <button className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
            <Upload className="mr-2 h-4 w-4" />
            Upload Resource
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
              <BookOpen className="h-5 w-5 text-indigo-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Resources</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {resources.length}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/20">
              <Upload className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">My Uploads</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {myResourceCount || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 dark:bg-orange-900/20">
              <Download className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Downloads</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{totalDownloads}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search resources by title, subject, or uploader..."
          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder-gray-500"
        />
      </div>

      {/* Resource Cards */}
      {resources && resources.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource: any) => {
            const typeConfig = getTypeConfig(resource.type)
            const IconComponent = typeConfig.icon

            return (
              <div
                key={resource.id}
                className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-indigo-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-700"
              >
                {/* Resource Type Icon */}
                <div className="flex items-start justify-between">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${typeConfig.bg}`}
                  >
                    <IconComponent className={`h-5 w-5 ${typeConfig.color}`} />
                  </div>
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 uppercase dark:bg-zinc-800 dark:text-gray-400">
                    {resource.type || 'File'}
                  </span>
                </div>

                {/* Resource Info */}
                <h3 className="mt-3 text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {resource.title}
                </h3>
                {resource.description && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                    {resource.description}
                  </p>
                )}

                {/* Uploader Info */}
                <div className="mt-3 flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <User className="mr-1.5 h-3.5 w-3.5" />
                  <span className="truncate">
                    {resource.user?.profile?.fullName || 'Anonymous'}
                  </span>
                </div>

                {/* Stats */}
                <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-zinc-800">
                  <div className="flex items-center space-x-4 text-xs text-gray-400 dark:text-gray-500">
                    <div className="flex items-center">
                      <Download className="mr-1 h-3.5 w-3.5" />
                      <span>0</span>
                    </div>
                    <div className="flex items-center">
                      <Eye className="mr-1 h-3.5 w-3.5" />
                      <span>0</span>
                    </div>
                  </div>
                  <button className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 transition-colors">
                    <Download className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <BookOpen className="mx-auto h-12 w-12 text-gray-300 dark:text-zinc-600" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
            No resources shared yet
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Be the first to share study materials with your peers.
          </p>
          <button className="mt-6 inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
            <Upload className="mr-2 h-4 w-4" />
            Upload Resource
          </button>
        </div>
      )}
    </div>
  )
}
