'use client'

import React, { useState, useRef } from 'react'
import { FilePlus, Settings, Loader2, BookOpen, AlertCircle, Sparkles, Image as ImageIcon, ChevronRight, CheckCircle2 } from 'lucide-react'
import clsx from 'clsx'

export default function ExamGeneratorPage() {
  const [file, setFile] = useState<File | null>(null)
  const [difficulty, setDifficulty] = useState('Adaptive')
  const [language, setLanguage] = useState('English')
  const [isLoading, setIsLoading] = useState(false)
  const [exam, setExam] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      if (selected.size > 10 * 1024 * 1024) {
        setError('File size must be under 10MB.')
        return
      }
      setFile(selected)
      setError(null)
      setExam(null)
    }
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setIsLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('difficulty', difficulty)
    formData.append('language', language)

    try {
      const response = await fetch('/api/exams/generate', {
        method: 'POST',
        body: formData
      })

      const json = await response.json()

      if (!response.ok) {
        throw new Error(json.error || 'Failed to generate exam')
      }

      setExam(json.data)
    } catch (err: any) {
      setError(err.message || 'An error occurred during generation.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 space-y-8 animate-in fade-in zoom-in duration-500">
      
      {/* Header section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center justify-center p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl mb-2 shadow-sm">
          <BookOpen className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-600">
          AI Exam Generator
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Upload any PDF, Document, or Image. Our AI will automatically generate a highly customized exam featuring MCQs, True/False, and Short Answer questions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Generator Form Section */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-gray-100 dark:border-zinc-800 shadow-xl">
            <h2 className="text-xl font-bold flex items-center space-x-2 mb-6">
              <Settings className="w-5 h-5 text-emerald-500" />
              <span>Exam Configuration</span>
            </h2>

            <form onSubmit={handleGenerate} className="space-y-6">
              
              {/* File Upload Area */}
              <div 
                className={clsx(
                  "relative group border-2 border-dashed rounded-2xl p-6 transition-all duration-300 text-center cursor-pointer overflow-hidden",
                  file 
                    ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10" 
                    : "border-gray-300 dark:border-gray-700 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                )}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,image/png,image/jpeg"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                {file ? (
                  <div className="flex items-center justify-center space-x-3 text-emerald-700 dark:text-emerald-400 font-medium">
                    {file.type.startsWith('image/') ? <ImageIcon className="w-6 h-6" /> : <FilePlus className="w-6 h-6" />}
                    <span className="truncate max-w-[200px]">{file.name}</span>
                    <CheckCircle2 className="w-5 h-5 text-green-500 ml-2" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-4 space-y-3">
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full group-hover:scale-110 transition-transform">
                      <FilePlus className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Click to upload PDF, Word, or Image</p>
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Difficulty Level</label>
                  <select 
                    value={difficulty} 
                    onChange={e => setDifficulty(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  >
                    <option value="Adaptive">Adaptive (AI Analyzes level)</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Language</label>
                  <select 
                    value={language} 
                    onChange={e => setLanguage(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={!file || isLoading}
                className="w-full flex items-center justify-center py-4 px-6 rounded-2xl text-white font-semibold text-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/30 hover:-translate-y-1 disabled:opacity-50 transition-all duration-300"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                    Generating Magic...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6 mr-3" />
                    Generate Exam
                  </>
                )}
              </button>
            </form>

            {error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm border border-red-200 dark:border-red-900/50 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Results Preview Section */}
        <div className="lg:col-span-7">
          <div className={clsx(
            "bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-xl overflow-hidden transition-all duration-700 h-full min-h-[600px]",
            exam ? "opacity-100 translate-y-0" : "opacity-50 translate-y-4"
          )}>
            
            <div className="p-6 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/50">
              <h2 className="text-2xl font-bold flex items-center space-x-3 text-gray-800 dark:text-gray-100">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                <span>{exam?.title || 'Exam Preview'}</span>
              </h2>
            </div>
            
            <div className="p-6 space-y-8 overflow-y-auto max-h-[800px] custom-scrollbar">
              {!exam && !isLoading && (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 space-y-4 min-h-[400px]">
                  <FilePlus className="w-16 h-16 opacity-30" />
                  <p className="text-lg">Upload a document to generate an exam.</p>
                </div>
              )}

              {isLoading && (
                <div className="h-full flex flex-col items-center justify-center text-emerald-500 space-y-4 min-h-[400px]">
                  <Loader2 className="w-12 h-12 animate-spin" />
                  <p className="animate-pulse font-medium text-lg">AI is reading your document...</p>
                </div>
              )}

              {exam && (
                <div className="space-y-10 animate-in fade-in duration-500">
                  
                  {/* MCQs */}
                  {exam.mcqs && exam.mcqs.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 border-b pb-2">Multiple Choice Questions</h3>
                      <div className="space-y-6">
                        {exam.mcqs.map((q: any, i: number) => (
                          <div key={i} className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-700/50">
                            <p className="font-semibold text-gray-800 dark:text-gray-200 mb-3">{i + 1}. {q.q}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {q.options.map((opt: string, j: number) => (
                                <div key={j} className={clsx(
                                  "p-3 rounded-xl border text-sm font-medium transition-colors",
                                  opt === q.ans 
                                    ? "bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-900/30 dark:border-emerald-700/50 dark:text-emerald-300"
                                    : "bg-white border-gray-200 text-gray-700 dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-300"
                                )}>
                                  {opt}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* True / False */}
                  {exam.tf && exam.tf.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 border-b pb-2">True or False</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {exam.tf.map((q: any, i: number) => (
                          <div key={i} className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-700/50">
                            <p className="font-semibold text-gray-800 dark:text-gray-200 mb-3 text-sm">{q.q}</p>
                            <div className="inline-block px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 text-sm font-bold">
                              Answer: {q.ans}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Short Answers */}
                  {exam.short_answers && exam.short_answers.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 border-b pb-2">Short Answer Questions</h3>
                      <div className="space-y-4">
                        {exam.short_answers.map((q: any, i: number) => (
                          <div key={i} className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-700/50">
                            <p className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{q.q}</p>
                            <p className="text-gray-600 dark:text-gray-400 text-sm italic border-l-2 border-emerald-400 pl-3 py-1">
                              {q.ans}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
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
