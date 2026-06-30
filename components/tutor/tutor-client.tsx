'use client'

import { useState } from 'react'
import {
  Camera,
  Code,
  MessageSquare,
  Play,
  Mic,
  ArrowLeft,
  Loader2,
  Send,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

export function TutorClient({ userId }: { userId: string }) {
  const [activeTab, setActiveTab] = useState<'hub' | 'concept' | 'camera' | 'code' | 'youtube' | 'voice'>('hub')
  const [input, setInput] = useState('')
  const [code, setCode] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [responseOutput, setResponseOutput] = useState<string | null>(null)
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant'; text: string }[]>([])

  async function handleConceptSubmit() {
    if (!input.trim() || loading) return
    setLoading(true)
    setChatHistory(prev => [...prev, { role: 'user', text: input.trim() }])
    const currentInput = input
    setInput('')

    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'concept', question: currentInput })
      })
      const data = await res.json()
      if (data.success && data.data) {
        setChatHistory(prev => [...prev, { role: 'assistant', text: data.data.response }])
      } else {
        setChatHistory(prev => [...prev, { role: 'assistant', text: data.error || 'Failed to fetch tutor response.' }])
      }
    } catch {
      setChatHistory(prev => [...prev, { role: 'assistant', text: 'Error connecting to concept tutor.' }])
    } finally {
      setLoading(false)
    }
  }

  async function handleCodeSubmit() {
    if (!code.trim() || loading) return
    setLoading(true)
    setResponseOutput(null)

    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'code',
          code,
          errorMsg,
          language
        })
      })
      const data = await res.json()
      if (data.success && data.data) {
        setResponseOutput(data.data.response)
      } else {
        setResponseOutput(data.error || 'Failed to debug code.')
      }
    } catch {
      setResponseOutput('Error connecting to debugger service.')
    } finally {
      setLoading(false)
    }
  }

  async function handleYoutubeSubmit() {
    if (!youtubeUrl.trim() || loading) return
    setLoading(true)
    setResponseOutput(null)

    try {
      const res = await fetch('/api/youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video_url: youtubeUrl.trim() })
      })
      const data = await res.json()
      if (data.success && data.data) {
        setResponseOutput(data.data.summary)
      } else {
        setResponseOutput(data.error || 'Failed to process YouTube lecture.')
      }
    } catch {
      setResponseOutput('Error connecting to YouTube processing service.')
    } finally {
      setLoading(false)
    }
  }

  async function handleCameraSubmit() {
    if (!imageUrl.trim() || loading) return
    setLoading(true)
    setResponseOutput(null)

    try {
      const res = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: imageUrl.trim() })
      })
      const data = await res.json()
      if (data.success && data.data) {
        setResponseOutput(data.data.solution)
      } else {
        setResponseOutput(data.error || 'Failed to solve doubt from image.')
      }
    } catch {
      setResponseOutput('Error connecting to OCR doubt solver.')
    } finally {
      setLoading(false)
    }
  }

  if (activeTab === 'concept') {
    return (
      <div className="max-w-3xl mx-auto rounded-xl border bg-white p-6 shadow-sm dark:bg-zinc-900">
        <button onClick={() => { setActiveTab('hub'); setChatHistory([]); }} className="flex items-center gap-1 text-sm text-gray-500 mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Tutor Hub
        </button>

        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-indigo-500" /> AI Concept Tutor
        </h2>

        <div className="h-96 border rounded-lg p-4 overflow-y-auto space-y-4 mb-4 bg-gray-50/50">
          {chatHistory.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-20">Ask questions based on your course documents...</p>
          )}
          {chatHistory.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-xl px-4 py-2 text-sm ${
                msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-zinc-800 text-gray-900 dark:text-white'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ask a question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleConceptSubmit()}
            className="flex-1 rounded-lg border px-3 py-2 text-sm bg-white dark:bg-zinc-800"
          />
          <button onClick={handleConceptSubmit} className="bg-indigo-600 text-white px-4 py-2 rounded-lg">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  if (activeTab === 'code') {
    return (
      <div className="max-w-3xl mx-auto rounded-xl border bg-white p-6 shadow-sm dark:bg-zinc-900">
        <button onClick={() => { setActiveTab('hub'); setResponseOutput(null); }} className="flex items-center gap-1 text-sm text-gray-500 mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Tutor Hub
        </button>

        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Code className="h-5 w-5 text-emerald-500" /> AI Code Debugger
        </h2>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-zinc-800"
              >
                <option value="javascript">JavaScript / TypeScript</option>
                <option value="python">Python</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
                <option value="c">C</option>
                <option value="csharp">C#</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
                <option value="ruby">Ruby</option>
                <option value="php">PHP</option>
                <option value="swift">Swift</option>
                <option value="kotlin">Kotlin</option>
                <option value="dart">Dart</option>
                <option value="sql">SQL</option>
                <option value="r">R</option>
                <option value="bash">Bash / Shell</option>
                <option value="html">HTML / CSS</option>
                <option value="scala">Scala</option>
                <option value="perl">Perl</option>
                <option value="haskell">Haskell</option>
                <option value="lua">Lua</option>
                <option value="matlab">MATLAB</option>
                <option value="assembly">Assembly</option>
                <option value="powershell">PowerShell</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Optional Error Log</label>
              <input
                type="text"
                placeholder="e.g. ReferenceError: x is not defined"
                value={errorMsg}
                onChange={(e) => setErrorMsg(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-zinc-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Source Code</label>
            <textarea
              rows={8}
              placeholder="Paste your code here..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full rounded-lg border p-3 text-sm font-mono bg-zinc-950 text-emerald-400"
            />
          </div>

          <button
            onClick={handleCodeSubmit}
            disabled={loading || !code.trim()}
            className="w-full py-2.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Compile & Debug Code
          </button>

          {responseOutput && (
            <div className="p-4 bg-zinc-950 text-zinc-100 rounded-lg font-mono text-xs overflow-x-auto whitespace-pre-wrap">
              {responseOutput}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (activeTab === 'youtube') {
    return (
      <div className="max-w-3xl mx-auto rounded-xl border bg-white p-6 shadow-sm dark:bg-zinc-900">
        <button onClick={() => { setActiveTab('hub'); setResponseOutput(null); }} className="flex items-center gap-1 text-sm text-gray-500 mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Tutor Hub
        </button>

        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Play className="h-5 w-5 text-red-500" /> YouTube Lecture Analyzer
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">YouTube URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="flex-1 rounded-lg border px-3 py-2 text-sm bg-white dark:bg-zinc-800"
              />
              <button
                onClick={handleYoutubeSubmit}
                disabled={loading || !youtubeUrl.trim()}
                className="bg-red-600 text-white px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 disabled:opacity-50"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Analyze
              </button>
            </div>
          </div>

          {responseOutput && (
            <div className="p-4 border rounded-lg bg-gray-50/50 space-y-2">
              <h4 className="font-bold text-sm text-gray-900 dark:text-white">AI Summary Notes</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{responseOutput}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (activeTab === 'camera') {
    return (
      <div className="max-w-3xl mx-auto rounded-xl border bg-white p-6 shadow-sm dark:bg-zinc-900">
        <button onClick={() => { setActiveTab('hub'); setResponseOutput(null); }} className="flex items-center gap-1 text-sm text-gray-500 mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Tutor Hub
        </button>

        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Camera className="h-5 w-5 text-pink-500" /> Camera Doubt Solver
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Image URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Paste doubt image URL..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex-1 rounded-lg border px-3 py-2 text-sm bg-white dark:bg-zinc-800"
              />
              <button
                onClick={handleCameraSubmit}
                disabled={loading || !imageUrl.trim()}
                className="bg-pink-600 text-white px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 disabled:opacity-50"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Solve
              </button>
            </div>
          </div>

          {responseOutput && (
            <div className="p-4 border rounded-lg bg-gray-50/50 space-y-2">
              <h4 className="font-bold text-sm text-gray-900 dark:text-white">AI Visual Explanation</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{responseOutput}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Hub View
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Concept Tutor */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between">
        <div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/20 mb-4">
            <MessageSquare className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">AI Concept Tutor</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Ask questions based directly on your uploaded materials using RAG.</p>
        </div>
        <button
          onClick={() => setActiveTab('concept')}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          Ask a Question
        </button>
      </div>

      {/* Camera Doubt Solver */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between">
        <div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-pink-50 dark:bg-pink-900/20 mb-4">
            <Camera className="h-6 w-6 text-pink-600 dark:text-pink-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Camera Doubt Solver</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Snap a picture of a complex math or physics problem for instant step-by-step solutions.</p>
        </div>
        <button
          onClick={() => setActiveTab('camera')}
          className="w-full rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium text-white hover:bg-pink-700 transition-colors"
        >
          Upload Image
        </button>
      </div>

      {/* AI Code Tutor */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between">
        <div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/20 mb-4">
            <Code className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">AI Code Debugger</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Paste your broken code and error messages. Get instant fixes and explanations.</p>
        </div>
        <button
          onClick={() => setActiveTab('code')}
          className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
        >
          Debug Code
        </button>
      </div>

      {/* YouTube Lecture AI */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between">
        <div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/20 mb-4">
            <Play className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">YouTube Lecture AI</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Paste a YouTube link to instantly generate notes, flashcards, and quizzes from the transcript.</p>
        </div>
        <button
          onClick={() => setActiveTab('youtube')}
          className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
        >
          Process Video
        </button>
      </div>
    </div>
  )
}
