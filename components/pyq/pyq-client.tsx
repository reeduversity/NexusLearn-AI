'use client'

import { useState } from 'react'
import {
  FileQuestion,
  Upload,
  TrendingUp,
  Tag,
  Calendar,
  BarChart3,
  Sparkles,
  BookOpen,
  Loader2
} from 'lucide-react'

interface Paper {
  id: string
  course_id: string
  year: number
  topic_tags: string[]
  created_at: string
}

export function PyqClient({ initialPapers, userId }: { initialPapers: Paper[], userId: string }) {
  const [papers, setPapers] = useState<Paper[]>(initialPapers)
  const [isUploading, setIsUploading] = useState(false)
  const [courseInput, setCourseInput] = useState('')
  const [yearInput, setYearInput] = useState(new Date().getFullYear())
  const [contentInput, setContentInput] = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)

  // Build topic predictions from existing papers using frequency analysis
  const topicFrequency: Record<string, { count: number; recentYear: number }> = {}
  const currentYear = new Date().getFullYear()

  papers.forEach((paper) => {
    const tags: string[] = paper.topic_tags || []
    tags.forEach((tag) => {
      const weight = paper.year >= currentYear - 2 ? 1.5 : 1.0
      if (!topicFrequency[tag]) {
        topicFrequency[tag] = { count: 0, recentYear: paper.year }
      }
      topicFrequency[tag].count += weight
      if (paper.year > topicFrequency[tag].recentYear) {
        topicFrequency[tag].recentYear = paper.year
      }
    })
  })

  const predictions = Object.entries(topicFrequency)
    .map(([topic, data]) => ({ topic, weight: data.count, recentYear: data.recentYear }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 10)

  const maxWeight = predictions.length > 0 ? predictions[0].weight : 1

  // Group papers by course
  const papersByCourse: Record<string, Paper[]> = {}
  papers.forEach((paper) => {
    const courseId = paper.course_id || 'Uncategorized'
    if (!papersByCourse[courseId]) {
      papersByCourse[courseId] = []
    }
    papersByCourse[courseId].push(paper)
  })

  const uniqueYears = [...new Set(papers.map((p) => p.year))].sort((a, b) => b - a)

  async function handleUpload() {
    if (!courseInput.trim() || !contentInput.trim()) return
    setIsUploading(true)

    try {
      const res = await fetch('/api/pyq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_id: courseInput.trim(),
          year: yearInput,
          content: contentInput.trim()
        })
      })
      const data = await res.json()
      if (data.success && data.data) {
        setPapers((prev) => [data.data.paper, ...prev])
        setShowUploadModal(false)
        setCourseInput('')
        setContentInput('')
      } else {
        alert(data.error || 'Failed to upload paper')
      }
    } catch (err) {
      console.error(err)
      alert('Error uploading paper')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload trigger */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
          <BookOpen className="mr-2 h-6 w-6 text-indigo-500" />
          PYQ Registry
        </h2>
        <button
          onClick={() => setShowUploadModal(true)}
          className="cursor-pointer rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 flex items-center shadow-sm"
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload PYQ Paper
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <FileQuestion className="h-5 w-5 text-blue-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-500">Total Papers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{papers.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
              <Tag className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-500">Topics Identified</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{Object.keys(topicFrequency).length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-900/20">
              <Calendar className="h-5 w-5 text-purple-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-500">Years Covered</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{uniqueYears.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Predictions Column */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-6 space-y-4">
            <div className="border-b border-gray-200 dark:border-zinc-800 pb-3">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-orange-500" />
                Predicted Exam Topics
              </h2>
            </div>

            {predictions.length > 0 ? (
              <div className="space-y-4">
                {predictions.map((prediction, index) => {
                  const percentage = Math.round((prediction.weight / maxWeight) * 100)
                  return (
                    <div key={prediction.topic}>
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="font-medium text-gray-800 dark:text-white">
                          {index + 1}. {prediction.topic}
                        </span>
                        <span className="text-gray-400">{percentage}% weight</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-zinc-800">
                        <div
                          className={`h-2 rounded-full ${index === 0 ? 'bg-red-500' : index < 3 ? 'bg-orange-500' : 'bg-indigo-500'}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-xs text-gray-400 text-center py-6">Upload papers to generate trend predictions.</p>
            )}
          </div>
        </div>

        {/* Papers List */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
              <BookOpen className="mr-2 h-5 w-5 text-indigo-500" />
              Uploaded Question Papers
            </h2>

            {papers.length > 0 ? (
              <div className="space-y-6">
                {Object.entries(papersByCourse).map(([courseId, papers]) => (
                  <div key={courseId} className="space-y-2">
                    <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{courseId}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {papers.map((paper) => (
                        <div key={paper.id} className="p-4 border rounded-xl hover:bg-gray-50/50 transition-colors">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-sm text-gray-900 dark:text-white">
                                Year {paper.year} Exam
                              </p>
                              <p className="text-xs text-gray-400">Uploaded {new Date(paper.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          {paper.topic_tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {paper.topic_tags.map(t => (
                                <span key={t} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileQuestion className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">No question papers uploaded yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Upload Question Paper</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Course Code / ID</label>
                <input
                  type="text"
                  placeholder="e.g. CS-102"
                  value={courseInput}
                  onChange={(e) => setCourseInput(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Year</label>
                <input
                  type="number"
                  value={yearInput}
                  onChange={(e) => setYearInput(Number(e.target.value))}
                  className="w-full rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Paper Text Content</label>
                <textarea
                  rows={4}
                  placeholder="Paste the question paper content..."
                  value={contentInput}
                  onChange={(e) => setContentInput(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 border rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={isUploading || !courseInput.trim() || !contentInput.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 flex items-center gap-1.5"
              >
                {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
                Upload & Process
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
