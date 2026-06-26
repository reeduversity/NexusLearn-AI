'use client'

import React, { useState, useRef } from 'react'
import { FileAudio, UploadCloud, Loader2, BookOpen, Layers, CheckCircle2, List, Mic, LayoutDashboard } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import clsx from 'clsx'

export default function NoteSummarizerPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      if (selected.size > 25 * 1024 * 1024) { // Groq Whisper limit is 25MB
        setError('File size must be under 25MB.')
        return
      }
      setFile(selected)
      setError(null)
      setResult(null)
    }
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setIsLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/study/summarize', {
        method: 'POST',
        body: formData
      })

      const json = await response.json()

      if (!response.ok) {
        throw new Error(json.error || 'Failed to generate summary')
      }

      setResult(json.data)
    } catch (err: any) {
      setError(err.message || 'An error occurred during generation.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 space-y-8 animate-in fade-in zoom-in duration-500">
      
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center justify-center p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl mb-2 shadow-sm">
          <FileAudio className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600">
          AI Note & Lecture Summarizer
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Upload any lecture audio, video, or PDF document. Our AI will automatically transcribe and synthesize it into structured notes, flashcards, and practice quizzes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Upload Section */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-gray-100 dark:border-zinc-800 shadow-xl">
            <h2 className="text-xl font-bold flex items-center space-x-2 mb-6">
              <UploadCloud className="w-5 h-5 text-blue-500" />
              <span>Upload Source</span>
            </h2>

            <form onSubmit={handleGenerate} className="space-y-6">
              <div 
                className={clsx(
                  "relative group border-2 border-dashed rounded-2xl p-6 transition-all duration-300 text-center cursor-pointer overflow-hidden",
                  file 
                    ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10" 
                    : "border-gray-300 dark:border-gray-700 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                )}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,audio/*,video/*,image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                {file ? (
                  <div className="flex flex-col items-center justify-center space-y-3 text-blue-700 dark:text-blue-400 font-medium">
                    {file.type.startsWith('audio') || file.type.startsWith('video') ? <Mic className="w-8 h-8" /> : <BookOpen className="w-8 h-8" />}
                    <span className="truncate max-w-[200px] block">{file.name}</span>
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-2" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 space-y-3">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Click to upload Audio, Video, or PDF</p>
                    <p className="text-xs text-gray-500">Max size: 25MB (Whisper limitation)</p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={!file || isLoading}
                className="w-full flex items-center justify-center py-4 px-6 rounded-2xl text-white font-semibold text-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/30 hover:-translate-y-1 disabled:opacity-50 transition-all duration-300"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Layers className="w-6 h-6 mr-3" />
                    Generate Notes
                  </>
                )}
              </button>
            </form>

            {error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm border border-red-200 dark:border-red-900/50">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-8">
          <div className={clsx(
            "bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-xl overflow-hidden transition-all duration-700 h-full min-h-[600px]",
            result ? "opacity-100 translate-y-0" : "opacity-50 translate-y-4"
          )}>
            
            <div className="p-6 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/50 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {result?.title || 'Structured Notes Preview'}
              </h2>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[800px] custom-scrollbar">
              {!result && !isLoading && (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 space-y-4 min-h-[400px]">
                  <LayoutDashboard className="w-16 h-16 opacity-30" />
                  <p className="text-lg">Your structured notes, flashcards, and quizzes will appear here.</p>
                </div>
              )}

              {isLoading && (
                <div className="h-full flex flex-col items-center justify-center text-blue-500 space-y-4 min-h-[400px]">
                  <Loader2 className="w-12 h-12 animate-spin" />
                  <p className="animate-pulse font-medium text-lg">Synthesizing comprehensive notes...</p>
                </div>
              )}

              {result && (
                <div className="space-y-12 animate-in fade-in duration-500">
                  
                  {/* Summary */}
                  {result.summary && (
                    <section className="space-y-4">
                      <h3 className="text-xl font-bold flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 border-b pb-2">
                        <BookOpen className="w-5 h-5" /> <span>Summary</span>
                      </h3>
                      <div className="prose prose-blue dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                        <ReactMarkdown>{result.summary}</ReactMarkdown>
                      </div>
                    </section>
                  )}

                  {/* Key Points */}
                  {result.key_points && (
                    <section className="space-y-4">
                      <h3 className="text-xl font-bold flex items-center space-x-2 text-blue-600 dark:text-blue-400 border-b pb-2">
                        <List className="w-5 h-5" /> <span>Key Points</span>
                      </h3>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {result.key_points.map((point: string, i: number) => (
                          <li key={i} className="flex items-start space-x-3 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                            <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700 dark:text-gray-300">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {/* Flashcards */}
                  {result.flashcards && result.flashcards.length > 0 && (
                    <section className="space-y-4">
                      <h3 className="text-xl font-bold flex items-center space-x-2 text-amber-600 dark:text-amber-400 border-b pb-2">
                        <Layers className="w-5 h-5" /> <span>Auto-Generated Flashcards</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {result.flashcards.map((card: any, i: number) => (
                          <div key={i} className="group perspective-1000">
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-100 dark:border-amber-900/30 hover:shadow-md transition-shadow relative">
                              <span className="absolute top-2 right-3 text-xs font-bold text-amber-500 uppercase tracking-widest">Card {i+1}</span>
                              <p className="font-bold text-lg mb-2 text-gray-800 dark:text-gray-100">{card.front}</p>
                              <p className="text-gray-600 dark:text-gray-400 text-sm mt-4 pt-4 border-t border-amber-200/50 dark:border-amber-800/50">{card.back}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Quiz */}
                  {result.quiz && result.quiz.length > 0 && (
                    <section className="space-y-4">
                      <h3 className="text-xl font-bold flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 border-b pb-2">
                        <CheckCircle2 className="w-5 h-5" /> <span>Quick Knowledge Check</span>
                      </h3>
                      <div className="space-y-6">
                        {result.quiz.map((q: any, i: number) => (
                          <div key={i} className="p-5 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700">
                            <p className="font-bold text-gray-800 dark:text-gray-200 mb-4">{i + 1}. {q.q}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {q.options.map((opt: string, j: number) => (
                                <div key={j} className={clsx(
                                  "p-3 rounded-xl border text-sm transition-colors",
                                  opt === q.ans 
                                    ? "bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-900/30 dark:border-emerald-700/50 dark:text-emerald-300 font-semibold"
                                    : "bg-white border-gray-200 text-gray-700 dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-300"
                                )}>
                                  {opt}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                  
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
