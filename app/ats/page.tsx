'use client'

import { useState, useEffect } from 'react'
import {
  ScanSearch,
  Upload,
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Tag,
  Lightbulb,
  Loader2,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

interface ATSReport {
  id: string
  score: number
  summary: string
  strengths: string[]
  suggestions: string[]
  missing_keywords: string[]
  formatting_issues: string[]
  section_scores: Record<string, number>
  createdAt: string
}

export default function ATSAnalyzerPage() {
  const [resumeText, setResumeText] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [currentReport, setCurrentReport] = useState<ATSReport | null>(null)
  const [pastReports, setPastReports] = useState<ATSReport[]>([])
  const [showPast, setShowPast] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPastReports()
  }, [])

  const fetchPastReports = async () => {
    try {
      const res = await fetch('/api/ats')
      if (res.ok) {
        const { data } = await res.json()
        if (data) setPastReports(data)
      }
    } catch (err) {
      console.error('Failed to fetch past reports', err)
    }
  }

  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      setError('Please paste your resume text before analyzing.')
      return
    }

    setError(null)
    setAnalyzing(true)
    setCurrentReport(null)

    try {
      const response = await fetch('/api/ats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'analyze', resume_text: resumeText }),
      })

      if (!response.ok) throw new Error('Analysis failed')

      const { data: report } = await response.json()
      setCurrentReport(report)
      fetchPastReports()
    } catch (err) {
      setError('Failed to analyze resume. Please try again.')
      console.error(err)
    } finally {
      setAnalyzing(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500'
    if (score >= 60) return 'text-amber-500'
    return 'text-red-500'
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/30'
    if (score >= 60) return 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/30'
    return 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900/30'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Needs Work'
    return 'Poor'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">ATS Resume Analyzer</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Paste your resume to get an ATS compatibility score, keyword gaps, and actionable improvements.
        </p>
      </div>

      {/* Input Section */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Upload className="mr-2 h-5 w-5 text-indigo-500" />
          Paste Your Resume
        </h2>
        <textarea
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          rows={10}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white font-mono"
          placeholder="Paste your entire resume text here..."
        />
        {error && (
          <p className="mt-2 text-sm text-red-500 flex items-center">
            <AlertTriangle className="mr-1 h-4 w-4" /> {error}
          </p>
        )}
        <button
          onClick={handleAnalyze}
          disabled={analyzing}
          className="mt-4 w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {analyzing ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
          ) : (
            <><ScanSearch className="mr-2 h-4 w-4" /> Analyze Resume</>
          )}
        </button>
      </div>

      {/* Analysis Results */}
      {currentReport && (
        <div className="space-y-6">
          {/* Score Card */}
          <div className={`rounded-xl border p-8 text-center ${getScoreBg(currentReport.score)}`}>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">ATS Compatibility Score</p>
            <p className={`text-7xl font-black ${getScoreColor(currentReport.score)}`}>
              {currentReport.score}
            </p>
            <p className={`text-lg font-semibold mt-2 ${getScoreColor(currentReport.score)}`}>
              {getScoreLabel(currentReport.score)}
            </p>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              {currentReport.summary}
            </p>
          </div>

          {/* Section Scores */}
          {currentReport.section_scores && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-blue-500" />
                Section Breakdown
              </h3>
              <div className="space-y-3">
                {Object.entries(currentReport.section_scores).map(([section, score]) => (
                  <div key={section} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">{section.replace(/_/g, ' ')}</span>
                      <span className={getScoreColor(score as number)}>{score as number}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-zinc-800 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${(score as number) >= 80 ? 'bg-emerald-500' : (score as number) >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strengths */}
            {currentReport.strengths && currentReport.strengths.length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <CheckCircle2 className="mr-2 h-5 w-5 text-emerald-500" />
                  Strengths
                </h3>
                <ul className="space-y-2">
                  {currentReport.strengths.map((s, i) => (
                    <li key={i} className="flex items-start text-sm text-gray-700 dark:text-gray-300">
                      <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggestions */}
            {currentReport.suggestions && currentReport.suggestions.length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Lightbulb className="mr-2 h-5 w-5 text-amber-500" />
                  Improvement Suggestions
                </h3>
                <ul className="space-y-2">
                  {currentReport.suggestions.map((s, i) => (
                    <li key={i} className="flex items-start text-sm text-gray-700 dark:text-gray-300">
                      <Lightbulb className="mr-2 h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Missing Keywords */}
          {currentReport.missing_keywords && currentReport.missing_keywords.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Tag className="mr-2 h-5 w-5 text-red-500" />
                Missing Keywords
              </h3>
              <div className="flex flex-wrap gap-2">
                {currentReport.missing_keywords.map((keyword, i) => (
                  <span key={i} className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Formatting Issues */}
          {currentReport.formatting_issues && currentReport.formatting_issues.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5 text-orange-500" />
                Formatting Issues
              </h3>
              <ul className="space-y-2">
                {currentReport.formatting_issues.map((issue, i) => (
                  <li key={i} className="flex items-start text-sm text-gray-700 dark:text-gray-300">
                    <AlertTriangle className="mr-2 h-4 w-4 text-orange-400 mt-0.5 shrink-0" />
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Past Reports */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <button
          onClick={() => setShowPast(!showPast)}
          className="w-full flex items-center justify-between text-lg font-semibold text-gray-900 dark:text-white"
        >
          <span className="flex items-center">
            <Clock className="mr-2 h-5 w-5 text-gray-500" />
            Past ATS Reports ({pastReports.length})
          </span>
          {showPast ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
        {showPast && (
          <div className="mt-4 space-y-3">
            {pastReports.length > 0 ? (
              pastReports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => setCurrentReport(report)}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-100 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors dark:border-zinc-800 dark:bg-zinc-800/50 dark:hover:bg-zinc-800"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`text-2xl font-bold ${getScoreColor(report.score)}`}>
                      {report.score}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {getScoreLabel(report.score)} Score
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(report.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
              ))
            ) : (
              <div className="text-center py-8 border border-dashed border-gray-200 dark:border-zinc-700 rounded-lg">
                <ScanSearch className="mx-auto h-8 w-8 text-gray-300 dark:text-zinc-600 mb-2" />
                <p className="text-sm text-gray-500">No past ATS reports. Analyze your first resume above!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
