'use client'

import { useState } from 'react'
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  Trophy,
  BarChart3,
  Calendar,
  Target,
  Sparkles,
  FileText,
  TrendingUp,
  Plus,
  Loader2,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'

interface Question {
  q: string
  options: string[]
  ans: string
}

interface MockTest {
  id: string
  courseId: string | null
  content: any
  score: number | null
  status: string
  createdAt: string | Date
}

export function MockTestsClient({ initialTests, userId }: { initialTests: MockTest[], userId: string }) {
  const [tests, setTests] = useState<MockTest[]>(initialTests)
  const [activeTest, setActiveTest] = useState<MockTest | null>(null)
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([])
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [courseInput, setCourseInput] = useState('')
  const [showGenerateModal, setShowGenerateModal] = useState(false)

  // Calculate stats
  const totalTests = tests.length
  const completedTests = tests.filter((t) => t.status === 'completed')
  const pendingTests = tests.filter((t) => t.status === 'pending')

  const completedWithScores = completedTests.filter(
    (t) => t.score !== null && t.score !== undefined
  )
  const avgScore =
    completedWithScores.length > 0
      ? Math.round(
          completedWithScores.reduce((acc, t) => acc + (t.score as number), 0) /
            completedWithScores.length
        )
      : 0
  const highestScore =
    completedWithScores.length > 0
      ? Math.max(...completedWithScores.map((t) => t.score as number))
      : 0

  async function handleGenerateTest() {
    if (!courseInput.trim()) return

    setIsGenerating(true)
    try {
      const res = await fetch('/api/mock-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course_id: courseInput.trim() })
      })
      const data = await res.json()
      if (data.success && data.data) {
        setTests((prev) => [data.data, ...prev])
        setShowGenerateModal(false)
        setCourseInput('')
      } else {
        alert(data.error || 'Failed to generate mock test')
      }
    } catch (err) {
      console.error(err)
      alert('Error generating mock test')
    } finally {
      setIsGenerating(false)
    }
  }

  function startTest(test: MockTest) {
    setActiveTest(test)
    const questions = getQuestions(test)
    setSelectedAnswers(new Array(questions.length).fill(''))
    setCurrentQuestionIdx(0)
  }

  function getQuestions(test: MockTest): Question[] {
    if (!test || !test.content) return []
    if (Array.isArray(test.content)) return test.content
    if (typeof test.content === 'object' && 'questions' in test.content) {
      return (test.content as any).questions || []
    }
    return []
  }

  async function submitTest() {
    if (!activeTest) return
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/mock-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          test_id: activeTest.id,
          answers: selectedAnswers
        })
      })
      const data = await res.json()
      if (data.success && data.data) {
        setTests((prev) => prev.map((t) => (t.id === activeTest.id ? data.data : t)))
        setActiveTest(null)
      } else {
        alert(data.error || 'Failed to submit test')
      }
    } catch (err) {
      console.error(err)
      alert('Error submitting test')
    } finally {
      setIsSubmitting(false)
    }
  }

  const questions = activeTest ? getQuestions(activeTest) : []

  if (activeTest) {
    const currentQuestion = questions[currentQuestionIdx]
    return (
      <div className="max-w-3xl mx-auto rounded-xl border border-gray-200 bg-white p-6 shadow-md dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-zinc-800 pb-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Mock Test: {activeTest.courseId}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Question {currentQuestionIdx + 1} of {questions.length}
            </p>
          </div>
          <button
            onClick={() => setActiveTest(null)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Quit Test
          </button>
        </div>

        {currentQuestion && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              {currentQuestion.q}
            </h3>

            <div className="grid grid-cols-1 gap-3">
              {currentQuestion.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    const nextAnswers = [...selectedAnswers]
                    nextAnswers[currentQuestionIdx] = opt
                    setSelectedAnswers(nextAnswers)
                  }}
                  className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all ${
                    selectedAnswers[currentQuestionIdx] === opt
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400'
                      : 'border-gray-200 bg-gray-50/50 hover:bg-gray-50 dark:border-zinc-800 dark:bg-zinc-800/50'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-zinc-800">
              <button
                disabled={currentQuestionIdx === 0}
                onClick={() => setCurrentQuestionIdx((i) => i - 1)}
                className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>

              {currentQuestionIdx < questions.length - 1 ? (
                <button
                  disabled={!selectedAnswers[currentQuestionIdx]}
                  onClick={() => setCurrentQuestionIdx((i) => i + 1)}
                  className="px-6 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  Next Question
                </button>
              ) : (
                <button
                  disabled={selectedAnswers.some((a) => !a) || isSubmitting}
                  onClick={submitTest}
                  className="px-6 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Submit Exam
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
      {/* Stats Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-gray-500">Total Tests</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalTests}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-2xl font-bold text-emerald-600">{completedTests.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-gray-500">Avg. Score</p>
          <p className="text-2xl font-bold text-indigo-600">{avgScore}%</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-gray-500">Highest Score</p>
          <p className="text-2xl font-bold text-amber-500">{highestScore}%</p>
        </div>
      </div>

      {/* Pending Tests Alert */}
      {pendingTests.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-800/30 dark:bg-amber-900/10 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-amber-600" />
            <div className="ml-3">
              <p className="text-sm font-semibold text-amber-800">
                You have {pendingTests.length} pending mock exam{pendingTests.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={() => startTest(pendingTests[0])}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
          >
            Resume Test
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
          <ClipboardList className="mr-2 h-5 w-5 text-indigo-500" />
          Generated Exams
        </h2>
        <button
          onClick={() => setShowGenerateModal(true)}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" />
          Generate New Test
        </button>
      </div>

      {/* Tests Grid */}
      {tests.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tests.map((test) => {
            const isCompleted = test.status === 'completed'
            const isPending = test.status === 'pending'
            const qList = getQuestions(test)

            return (
              <div
                key={test.id}
                className={`rounded-xl border bg-white p-5 hover:shadow-md transition-all dark:bg-zinc-900 ${
                  isCompleted ? 'border-emerald-200' : 'border-gray-200 dark:border-zinc-800'
                }`}
              >
                <div className="flex justify-between items-center mb-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    isCompleted ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {isCompleted ? 'Completed' : 'Pending'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(test.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Mock Test - {test.courseId}
                </h3>
                <p className="text-xs text-gray-500 mt-1">{qList.length} Questions</p>

                {isCompleted && test.score !== null ? (
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span>Score</span>
                      <span className="font-bold">{test.score}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-zinc-800">
                      <div
                        className="h-2 rounded-full bg-emerald-500"
                        style={{ width: `${test.score}%` }}
                      />
                    </div>
                  </div>
                ) : isPending ? (
                  <button
                    onClick={() => startTest(test)}
                    className="mt-4 w-full py-2 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-lg hover:bg-indigo-100"
                  >
                    Start Exam
                  </button>
                ) : null}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-xl">
          <ClipboardList className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <p className="text-sm text-gray-500">No mock tests generated yet. Click above to create one.</p>
        </div>
      )}

      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Generate Mock Test</h3>
            <p className="text-sm text-gray-500">Enter a course ID or topic to build a custom test.</p>
            <input
              type="text"
              placeholder="e.g. CS-101 or Data Structures"
              value={courseInput}
              onChange={(e) => setCourseInput(e.target.value)}
              className="w-full rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowGenerateModal(false)}
                className="px-4 py-2 border rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateTest}
                disabled={isGenerating || !courseInput.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 flex items-center gap-1.5"
              >
                {isGenerating && <Loader2 className="h-4 w-4 animate-spin" />}
                Generate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
