'use client'

import { useState } from 'react'
import { WifiOff, Download, Check, Loader2, FileText, Video, BookOpen } from 'lucide-react'

interface OfflineMaterial {
  id: string
  title: string
  type: 'note' | 'video' | 'document'
  size: string
  isDownloaded: boolean
}

export function OfflineManager({ materials }: { materials: OfflineMaterial[] }) {
  const [items, setItems] = useState(materials)
  const [autoDownload, setAutoDownload] = useState(false)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  function getTypeIcon(type: string) {
    switch (type) {
      case 'video': return Video
      case 'document': return BookOpen
      default: return FileText
    }
  }

  async function handleDownload(id: string) {
    setDownloadingId(id)
    // Simulate download delay
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isDownloaded: true } : item))
    )
    setDownloadingId(null)
  }

  return (
    <div className="space-y-6">
      {/* Auto-Download Toggle */}
      <div className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Auto-Download</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Automatically download new materials when on Wi-Fi
          </p>
        </div>
        <button
          onClick={() => setAutoDownload(!autoDownload)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            autoDownload ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-zinc-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
              autoDownload ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Download Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-zinc-800/50">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {items.filter((i) => i.isDownloaded).length}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Downloaded</p>
        </div>
        <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-zinc-800/50">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {items.filter((i) => !i.isDownloaded).length}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Pending</p>
        </div>
        <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-zinc-800/50">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{items.length}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total</p>
        </div>
      </div>

      {/* Materials List */}
      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-gray-200 dark:border-zinc-800 rounded-xl">
            <WifiOff className="mx-auto h-10 w-10 text-gray-300 dark:text-zinc-600 mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No materials available for offline access.</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Upload study materials to get started.</p>
          </div>
        ) : (
          items.map((item) => {
            const TypeIcon = getTypeIcon(item.type)
            const isDownloading = downloadingId === item.id
            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
                    <TypeIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.size}</p>
                  </div>
                </div>
                <div>
                  {item.isDownloaded ? (
                    <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                      <Check className="h-4 w-4" />
                      <span className="text-xs font-medium">Saved</span>
                    </div>
                  ) : isDownloading ? (
                    <Loader2 className="h-5 w-5 text-indigo-500 animate-spin" />
                  ) : (
                    <button
                      onClick={() => handleDownload(item.id)}
                      className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      <span className="text-xs font-medium">Download</span>
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
