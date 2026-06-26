'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  BookOpen,
  Copy,
  Check,
  Loader2,
  Plus,
  Trash2,
  AlertTriangle,
  Library,
} from 'lucide-react'

interface Citation {
  id: string
  title: string
  author: string
  year: string
  url: string
  format: 'APA' | 'MLA' | 'IEEE'
  citation_text: string
  created_at: string
}

const FORMAT_OPTIONS: { value: 'APA' | 'MLA' | 'IEEE'; label: string; description: string }[] = [
  { value: 'APA', label: 'APA 7th', description: 'American Psychological Association' },
  { value: 'MLA', label: 'MLA 9th', description: 'Modern Language Association' },
  { value: 'IEEE', label: 'IEEE', description: 'Institute of Electrical & Electronics Engineers' },
]

export default function CitationsPage() {
  const [citations, setCitations] = useState<Citation[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const [form, setForm] = useState({
    title: '',
    author: '',
    year: '',
    url: '',
    format: 'APA' as 'APA' | 'MLA' | 'IEEE',
  })

  const fetchCitations = useCallback(async () => {
    try {
      const response = await fetch('/api/citations')
      if (response.ok) {
        const data = await response.json()
        setCitations(data.citations || [])
      }
    } catch {
      // Silent fail on fetch
    } finally {
      setFetchLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCitations()
  }, [fetchCitations])

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()

    if (!form.title.trim() || !form.author.trim() || !form.year.trim()) {
      setError('Please fill in Title, Author, and Year fields.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/citations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!response.ok) {
        throw new Error('Failed to generate citation. Please try again.')
      }

      const data = await response.json()
      setCitations((prev) => [data.citation, ...prev])

      // Reset form
      setForm({ title: '', author: '', year: '', url: '', format: 'APA' })
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy(citation: Citation) {
    try {
      await navigator.clipboard.writeText(citation.citation_text)
      setCopiedId(citation.id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = citation.citation_text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopiedId(citation.id)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  async function handleDelete(citationId: string) {
    try {
      const response = await fetch(`/api/citations?id=${citationId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        setCitations((prev) => prev.filter((c) => c.id !== citationId))
      }
    } catch {
      // Silent fail on delete
    }
  }

  function getFormatBadgeColor(format: string) {
    switch (format) {
      case 'APA':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'MLA':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      case 'IEEE':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-400'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-pink-500" />
          Citation Builder
        </h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Generate perfectly formatted citations in APA, MLA, or IEEE style using AI.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Citation Form */}
        <div className="lg:col-span-2">
          <form
            onSubmit={handleGenerate}
            className="rounded-xl border border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-6 space-y-5 sticky top-6"
          >
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Plus className="h-4 w-4 text-pink-500" />
              New Citation
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. The Impact of AI on Education"
                  className="w-full rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500/40 focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Author(s) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                  placeholder="e.g. Smith, J. & Doe, A."
                  className="w-full rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500/40 focus:border-pink-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Year <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                    placeholder="e.g. 2024"
                    className="w-full rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500/40 focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Format
                  </label>
                  <select
                    value={form.format}
                    onChange={(e) => setForm({ ...form, format: e.target.value as 'APA' | 'MLA' | 'IEEE' })}
                    className="w-full rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500/40 focus:border-pink-500"
                  >
                    {FORMAT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  URL <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="url"
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder="https://example.com/article"
                  className="w-full rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500/40 focus:border-pink-500"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 px-3 py-2.5">
                <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-pink-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <BookOpen className="h-4 w-4" />
                  Generate Citation
                </>
              )}
            </button>

            {/* Format Legend */}
            <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 space-y-2">
              {FORMAT_OPTIONS.map((opt) => (
                <div key={opt.value} className="flex items-center gap-2">
                  <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold ${getFormatBadgeColor(opt.value)}`}>
                    {opt.label}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{opt.description}</span>
                </div>
              ))}
            </div>
          </form>
        </div>

        {/* Generated Citations List */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <div className="border-b border-gray-200 dark:border-zinc-800 px-6 py-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Library className="h-4 w-4 text-pink-500" />
                Your Citations
              </h2>
              <span className="text-xs text-gray-400">{citations.length} citation{citations.length !== 1 ? 's' : ''}</span>
            </div>

            {fetchLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : citations.length > 0 ? (
              <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                {citations.map((citation) => (
                  <div
                    key={citation.id}
                    className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold ${getFormatBadgeColor(citation.format)}`}>
                          {citation.format}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(citation.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleCopy(citation)}
                          className="inline-flex items-center gap-1 rounded-md border border-gray-200 dark:border-zinc-700 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
                        >
                          {copiedId === citation.id ? (
                            <>
                              <Check className="h-3 w-3 text-green-500" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              Copy
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(citation.id)}
                          className="inline-flex items-center justify-center rounded-md border border-gray-200 dark:border-zinc-700 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-mono">
                      {citation.citation_text}
                    </p>
                    <p className="text-xs text-gray-400 mt-1.5 truncate">
                      {citation.title} — {citation.author} ({citation.year})
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-pink-50 dark:bg-pink-900/20 mb-4">
                  <Library className="h-7 w-7 text-pink-400" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                  No citations yet
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm">
                  Fill in the source details and click &ldquo;Generate Citation&rdquo; to create your first AI-formatted citation.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
