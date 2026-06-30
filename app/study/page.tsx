import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-helpers'
import { StudyCanvasClient } from '@/components/study/study-canvas-client'
import { UploadCloud, FileText, LayoutGrid, Network } from 'lucide-react'

export const metadata = { title: 'Study Hub | NexusLearn AI' }

export default async function StudyHubPage() {
  const user = await getCurrentUser()

  // Fetch materials for the user
  const materials = user ? await prisma.material.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  }) : []

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Study Hub</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Manage your materials, generate AI notes, and visualise knowledge graphs.
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <label className="cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors flex items-center">
            <UploadCloud className="mr-2 h-4 w-4" />
            Upload Material (PDF/DOCX/Audio)
            <input type="file" className="hidden" accept=".pdf,.docx,.txt,audio/*,video/*" />
          </label>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { name: 'AI Summarizer', icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { name: 'Flashcard Generator', icon: LayoutGrid, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
          { name: 'Quiz Generator', icon: FileText, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
          { name: 'Knowledge Graph', icon: Network, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
        ].map((tool) => (
          <div key={tool.name} className="flex cursor-pointer items-center rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-indigo-500 hover:shadow-md transition-all dark:border-zinc-800 dark:bg-zinc-900">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${tool.bg}`}>
              <tool.icon className={`h-5 w-5 ${tool.color}`} />
            </div>
            <span className="ml-3 font-medium text-gray-900 dark:text-white">{tool.name}</span>
          </div>
        ))}
      </div>

      {/* Visual Knowledge Canvas */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        <div className="border-b border-gray-200 dark:border-zinc-800 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Network className="h-5 w-5 text-indigo-500" />
              Visual Study Canvas
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Drag, connect, and organise your knowledge visually. Use AI to auto-suggest subtopics.
            </p>
          </div>
        </div>
        <div className="p-4">
          <StudyCanvasClient />
        </div>
      </div>

      {/* Materials List */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        <div className="border-b border-gray-200 dark:border-zinc-800 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Your Materials</h2>
        </div>
        <div className="p-6">
          {materials && materials.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {materials.map(material => (
                <div key={material.id} className="p-4 border border-gray-100 dark:border-zinc-800 rounded-lg">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">{material.title}</p>
                  <p className="text-xs text-gray-500 mt-1 uppercase">{material.type}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No materials</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by uploading a PDF, DOCX, or audio file.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
