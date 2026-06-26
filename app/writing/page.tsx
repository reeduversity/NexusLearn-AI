'use client'

import { useState } from 'react'
import {
  FileEdit,
  ShieldCheck,
  BookOpen,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Info,
  Sparkles,
} from 'lucide-react'

export default function WritingShieldPage() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    integrity_score: number
    overall_assessment: string
    issues: Array<{
      type: string
      text_excerpt: string
      explanation: string
      suggestion: string
    }>
    strengths: string[]
    recommendations: string[]
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleCheckIntegrity() {
    if (!text.trim() || text.trim().length < 50) {
      setError('Please write at least 50 characters before checking integrity.')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/research/check-integrity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        throw new Error('Failed to check integrity. Please try again.')
      }

      const data = await response.json()
      setResult(data)
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  function getScoreColor(score: number) {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-amber-600 dark:text-amber-400'
    return 'text-red-600 dark:text-red-400'
  }

  function getScoreRingColor(score: number) {
    if (score >= 80) return 'stroke-green-500'
    if (score >= 60) return 'stroke-amber-500'
    return 'stroke-red-500'
  }

  function getIssueTypeLabel(type: string) {
    const labels: Record<string, { label: string; color: string }> = {
      unattributed_claim: { label: 'Unattributed Claim', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
      missing_citation: { label: 'Missing Citation', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
      potential_paraphrase: { label: 'Potential Paraphrase', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
      writing_inconsistency: { label: 'Inconsistency', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
      factual_claim_without_source: { label: 'Unsourced Fact', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    }
    return labels[type] || { label: type, color: 'bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-400' }
  }

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0
  const charCount = text.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <FileEdit className="h-8 w-8 text-amber-500" />
            Writing Shield
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Write your academic content and get real-time AI integrity analysis.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start">
          <a
            href="/citations"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-zinc-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            Citation Builder
          </a>
          <button
            onClick={handleCheckIntegrity}
            disabled={loading || !text.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                Check Integrity
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Writing Area */}
        <div className="lg:col-span-3 space-y-3">
          <div className="rounded-xl border border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
            <div className="border-b border-gray-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileEdit className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Editor</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span>{wordCount} words</span>
                <span>·</span>
                <span>{charCount} characters</span>
              </div>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Start writing your academic content here. The AI will analyze your text for academic integrity, proper attribution, and writing quality when you click 'Check Integrity'..."
              className="w-full min-h-[500px] p-5 text-sm text-gray-900 dark:text-white bg-transparent placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none resize-y leading-relaxed"
            />
          </div>

          {error && (
            <div className="flex items-start gap-3 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 px-4 py-3">
              <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Suggestions Panel */}
        <div className="lg:col-span-2 space-y-4">
          {result ? (
            <>
              {/* Integrity Score Card */}
              <div className="rounded-xl border border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-5">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  Integrity Score
                </h3>
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50" cy="50" r="42"
                        className="stroke-gray-200 dark:stroke-zinc-700"
                        strokeWidth="8" fill="none"
                      />
                      <circle
                        cx="50" cy="50" r="42"
                        className={getScoreRingColor(result.integrity_score)}
                        strokeWidth="8" fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${(result.integrity_score / 100) * 264} 264`}
                      />
                    </svg>
                    <span className={`absolute inset-0 flex items-center justify-center text-xl font-bold ${getScoreColor(result.integrity_score)}`}>
                      {result.integrity_score}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {result.overall_assessment}
                    </p>
                  </div>
                </div>
              </div>

              {/* Issues */}
              {result.issues && result.issues.length > 0 && (
                <div className="rounded-xl border border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-5">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    Issues Found ({result.issues.length})
                  </h3>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {result.issues.map((issue, idx) => {
                      const typeInfo = getIssueTypeLabel(issue.type)
                      return (
                        <div key={idx} className="rounded-lg border border-gray-100 dark:border-zinc-800 p-3 space-y-2">
                          <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${typeInfo.color}`}>
                            {typeInfo.label}
                          </span>
                          {issue.text_excerpt && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 italic border-l-2 border-gray-200 dark:border-zinc-700 pl-2">
                              &ldquo;{issue.text_excerpt}&rdquo;
                            </p>
                          )}
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {issue.explanation}
                          </p>
                          <div className="flex items-start gap-1.5 bg-blue-50 dark:bg-blue-900/10 rounded-md p-2">
                            <Sparkles className="h-3 w-3 text-blue-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-700 dark:text-blue-400">
                              {issue.suggestion}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Strengths */}
              {result.strengths && result.strengths.length > 0 && (
                <div className="rounded-xl border border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-5">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Strengths
                  </h3>
                  <ul className="space-y-2">
                    {result.strengths.map((strength, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {result.recommendations && result.recommendations.length > 0 && (
                <div className="rounded-xl border border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-5">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Info className="h-4 w-4 text-indigo-500" />
                    Recommendations
                  </h3>
                  <ul className="space-y-2">
                    {result.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <span className="shrink-0 mt-0.5 h-3.5 w-3.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-[8px] font-bold text-indigo-600 dark:text-indigo-400">
                          {idx + 1}
                        </span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            /* Empty state */
            <div className="rounded-xl border border-dashed border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-8 flex flex-col items-center justify-center text-center min-h-[400px]">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/20 mb-4">
                <ShieldCheck className="h-7 w-7 text-emerald-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                AI Integrity Analysis
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
                Write your academic content in the editor, then click <strong>&ldquo;Check Integrity&rdquo;</strong> to receive an AI-powered analysis of your writing.
              </p>
              <div className="mt-6 space-y-2 text-left w-full max-w-xs">
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  Integrity score (0-100)
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                  Issue detection & suggestions
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <BookOpen className="h-3.5 w-3.5 text-indigo-500" />
                  Citation & attribution guidance
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
