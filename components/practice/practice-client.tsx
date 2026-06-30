'use client'

import { useState } from 'react'
import {
  Dumbbell,
  Play,
  CheckCircle2,
  Clock,
  Target,
  BarChart3,
  Zap,
  TrendingUp,
  Award,
  Plus,
  Loader2
} from 'lucide-react'

interface PracticeSession {
  id: string
  topic: string
  totalQuestions: number
  score: number | null
  status: string
  createdAt: string | Date
}

export function PracticeClient({ initialSessions, userId }: { initialSessions: PracticeSession[], userId: string }) {
  const [sessions, setSessions] = useState<PracticeSession[]>(initialSessions)
  const [activeQuiz, setActiveQuiz] = useState<{ topic: string, questions: any[] } | null>(null)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [isStarting, setIsStarting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [topicInput, setTopicInput] = useState('')

  // calculations
  const totalSessions = sessions.length
  const completedSessions = sessions.filter((s) => s.status === 'completed').length
  const inProgressSessions = sessions.filter((s) => s.status === 'in_progress').length

  const completedWithScores = sessions.filter(
    (s) => s.status === 'completed' && s.score !== null && s.score !== undefined
  )
  const avgScore =
    completedWithScores.length > 0
      ? Math.round(
          completedWithScores.reduce((acc, s) => acc + (s.score as number), 0) / completedWithScores.length
        )
      : 0

  const sessionsByTopic: Record<string, { totalQuestions: number; avgScore: number; bestScore: number; completedCount: number }> = {}
  sessions.forEach((s) => {
    const t = s.topic || 'General'
    if (!sessionsByTopic[t]) {
      sessionsByTopic[t] = { totalQuestions: 0, avgScore: 0, bestScore: 0, completedCount: 0 }
    }
    sessionsByTopic[t].totalQuestions += s.totalQuestions || 0
    if (s.status === 'completed' && s.score !== null) {
      sessionsByTopic[t].completedCount += 1
      sessionsByTopic[t].avgScore += s.score
      if (s.score > sessionsByTopic[t].bestScore) {
        sessionsByTopic[t].bestScore = s.score
      }
    }
  })

  Object.values(sessionsByTopic).forEach(d => {
    if (d.completedCount > 0) {
      d.avgScore = Math.round(d.avgScore / d.completedCount)
    }
  })

  const topicColors = [
    { border: 'border-blue-200', bg: 'bg-blue-50', accent: 'text-blue-500', progressBg: 'bg-blue-500' },
    { border: 'border-emerald-200', bg: 'bg-emerald-50', accent: 'text-emerald-500', progressBg: 'bg-emerald-500' },
    { border: 'border-purple-200', bg: 'bg-purple-50', accent: 'text-purple-500', progressBg: 'bg-purple-500' }
  ]

  async function handleStartPractice(topic: string) {
    if (!topic.trim()) return
    setIsStarting(true)

    // Generate mock questions based on the topic
    const generatedQuestions = [
      { q: `What is the primary characteristic of ${topic}?`, options: ['Option A', 'Option B', 'Option C', 'Option D'], ans: 0 },
      { q: `Which of the following is commonly associated with ${topic}?`, options: ['Association X', 'Association Y', 'Association Z', 'Association W'], ans: 1 },
      { q: `How is the complexity of ${topic} measured in standard systems?`, options: ['O(1)', 'O(log N)', 'O(N)', 'O(N^2)'], ans: 2 }
    ]

    setActiveQuiz({ topic, questions: generatedQuestions })
    setAnswers(new Array(generatedQuestions.length).fill(-1))
    setCurrentIdx(0)
    setIsStarting(false)
    setShowCreateModal(false)
  }

  async function handleSubmitQuiz() {
    if (!activeQuiz) return
    setIsSubmitting(true)

    let correct = 0
    activeQuiz.questions.forEach((q, idx) => {
      if (answers[idx] === q.ans) correct++
    })

    const finalScore = Math.round((correct / activeQuiz.questions.length) * 100)

    try {
      const res = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: activeQuiz.topic,
          score: finalScore,
          max_score: 100
        })
      })
      const data = await res.json()
      if (data.success && data.data) {
        // Map quiz_attempts to practice_sessions presentation for listing
        const newSession: PracticeSession = {
          id: data.data.id,
          topic: data.data.topic,
          totalQuestions: activeQuiz.questions.length,
          score: data.data.score,
          status: 'completed',
          createdAt: data.data.createdAt || new Date().toISOString()
        }
        setSessions((prev) => [newSession, ...prev])
        setActiveQuiz(null)
      } else {
        alert(data.error || 'Failed to submit quiz attempt')
      }
    } catch (err) {
      console.error(err)
      alert('Error submitting quiz')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (activeQuiz) {
    const q = activeQuiz.questions[currentIdx]
    return (
      <div className="max-w-xl mx-auto rounded-xl border border-gray-200 bg-white p-6 shadow-md dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">Practice: {activeQuiz.topic}</h3>
          <span className="text-xs text-gray-500">Question {currentIdx + 1} of {activeQuiz.questions.length}</span>
        </div>

        {q && (
          <div className="space-y-6">
            <p className="font-medium text-gray-800 dark:text-gray-200">{q.q}</p>
            <div className="grid grid-cols-1 gap-2">
              {q.options.map((opt: string, oIdx: number) => (
                <button
                  key={oIdx}
                  onClick={() => {
                    const nextAnswers = [...answers]
                    nextAnswers[currentIdx] = oIdx
                    setAnswers(nextAnswers)
                  }}
                  className={`w-full text-left p-3 rounded-lg border text-sm font-medium ${
                    answers[currentIdx] === oIdx
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                      : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <button
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx((i) => i - 1)}
                className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50"
              >
                Back
              </button>

              {currentIdx < activeQuiz.questions.length - 1 ? (
                <button
                  disabled={answers[currentIdx] === -1}
                  onClick={() => setCurrentIdx((i) => i + 1)}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm"
                >
                  Next
                </button>
              ) : (
                <button
                  disabled={answers.some((a) => a === -1) || isSubmitting}
                  onClick={handleSubmitQuiz}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-lg text-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Submit Quiz
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-gray-500">Total Sessions</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalSessions}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{completedSessions}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-gray-500">In Progress</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{inProgressSessions}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-gray-500">Avg. Score</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{avgScore}%</p>
        </div>
      </div>

      {/* Action Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
          <Target className="mr-2 h-5 w-5 text-emerald-500" />
          Adaptive Practice Topics
        </h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          New Practice Session
        </button>
      </div>

      {/* Topic cards */}
      {Object.entries(sessionsByTopic).length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(sessionsByTopic).map(([topic, data], idx) => {
            const colors = topicColors[idx % topicColors.length]
            return (
              <div key={topic} className={`rounded-xl border ${colors.border} bg-white p-5 dark:bg-zinc-900`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{topic}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{data.completedCount} completed sessions</p>
                  </div>
                  <button
                    onClick={() => handleStartPractice(topic)}
                    className={`p-2 rounded-lg ${colors.bg} hover:opacity-90`}
                  >
                    <Play className={`h-4 w-4 ${colors.accent}`} />
                  </button>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="text-gray-500">Mastery</span>
                    <span className={`font-semibold ${colors.accent}`}>{data.avgScore}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-zinc-800">
                    <div className={`h-2 rounded-full ${colors.progressBg}`} style={{ width: `${data.avgScore}%` }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed rounded-xl">
          <Dumbbell className="mx-auto h-12 w-12 text-gray-300 mb-2" />
          <p className="text-sm text-gray-500">No practice sessions started yet. Click above to begin.</p>
        </div>
      )}

      {/* Sessions History List */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        <div className="border-b border-gray-200 dark:border-zinc-800 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">All Practice Sessions</h2>
        </div>
        <div className="p-6">
          {sessions.length > 0 ? (
            <div className="space-y-3">
              {sessions.map((s) => (
                <div key={s.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50/50">
                  <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{s.topic}</p>
                    <p className="text-xs text-gray-400">{s.totalQuestions} questions • {new Date(s.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    {s.score !== null && (
                      <span className="font-bold text-sm text-emerald-600">{s.score}%</span>
                    )}
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                      {s.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic text-center">No history logs.</p>
          )}
        </div>
      </div>

      {/* Create Session Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">New Practice Session</h3>
            <p className="text-sm text-gray-500">Select a study topic to test your knowledge.</p>
            <input
              type="text"
              placeholder="e.g. Physics, Chemistry, Data Structures"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              className="w-full rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStartPractice(topicInput)}
                disabled={isStarting || !topicInput.trim()}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 flex items-center gap-1.5"
              >
                {isStarting && <Loader2 className="h-4 w-4 animate-spin" />}
                Launch Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
