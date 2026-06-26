'use client'

import React, { useState, useRef } from 'react'
import { Calendar, FileText, Loader2, Target, CheckCircle2, ListTodo, Clock, ChevronRight, LayoutList } from 'lucide-react'
import clsx from 'clsx'

export default function SyllabusPlannerPage() {
  const [file, setFile] = useState<File | null>(null)
  const [targetDate, setTargetDate] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [plan, setPlan] = useState<any>(null)
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
      setPlan(null)
    }
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setIsLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)
    if (targetDate) formData.append('targetDate', new Date(targetDate).toISOString())

    try {
      const response = await fetch('/api/planner/generate', {
        method: 'POST',
        body: formData
      })

      const json = await response.json()

      if (!response.ok) {
        throw new Error(json.error || 'Failed to generate study plan')
      }

      setPlan(json.data)
    } catch (err: any) {
      setError(err.message || 'An error occurred during generation.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 space-y-8 animate-in fade-in zoom-in duration-500">
      
      {/* Header section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center justify-center p-3 bg-fuchsia-100 dark:bg-fuchsia-900/30 rounded-2xl mb-2 shadow-sm">
          <Calendar className="w-8 h-8 text-fuchsia-600 dark:text-fuchsia-400" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-500 to-purple-600">
          Syllabus Study Planner
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Upload your course syllabus and set your exam date. Our AI will instantly break it down into a week-by-week timeline with smart deadlines.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Generator Form Section */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-gray-100 dark:border-zinc-800 shadow-xl">
            <h2 className="text-xl font-bold flex items-center space-x-2 mb-6 text-gray-800 dark:text-gray-100">
              <Target className="w-5 h-5 text-fuchsia-500" />
              <span>Configure Plan</span>
            </h2>

            <form onSubmit={handleGenerate} className="space-y-6">
              
              <div 
                className={clsx(
                  "relative group border-2 border-dashed rounded-2xl p-6 transition-all duration-300 text-center cursor-pointer overflow-hidden",
                  file 
                    ? "border-fuchsia-500 bg-fuchsia-50/50 dark:bg-fuchsia-900/10" 
                    : "border-gray-300 dark:border-gray-700 hover:border-fuchsia-400 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-900/20"
                )}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                {file ? (
                  <div className="flex flex-col items-center justify-center space-y-3 text-fuchsia-700 dark:text-fuchsia-400 font-medium">
                    <FileText className="w-8 h-8" />
                    <span className="truncate max-w-[200px] block">{file.name}</span>
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-2" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-4 space-y-3">
                    <div className="p-3 bg-fuchsia-100 dark:bg-fuchsia-900/30 rounded-full group-hover:scale-110 transition-transform">
                      <FileText className="w-6 h-6 text-fuchsia-600 dark:text-fuchsia-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Click to upload Syllabus PDF</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Target Exam Date (Optional)</label>
                <input 
                  type="date" 
                  value={targetDate} 
                  onChange={e => setTargetDate(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-fuchsia-500 transition-all text-gray-800 dark:text-gray-200"
                />
              </div>

              <button
                type="submit"
                disabled={!file || isLoading}
                className="w-full flex items-center justify-center py-4 px-6 rounded-2xl text-white font-semibold text-lg bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700 shadow-lg shadow-fuchsia-500/30 hover:-translate-y-1 disabled:opacity-50 transition-all duration-300"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                    Planning...
                  </>
                ) : (
                  <>
                    <LayoutList className="w-6 h-6 mr-3" />
                    Auto-Generate Plan
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

        {/* Results Timeline Section */}
        <div className="lg:col-span-8">
          <div className={clsx(
            "bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-xl overflow-hidden transition-all duration-700 h-full min-h-[600px]",
            plan ? "opacity-100 translate-y-0" : "opacity-50 translate-y-4"
          )}>
            
            <div className="p-6 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/50">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {plan?.plan_title || 'Your Smart Timeline'}
              </h2>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[800px] custom-scrollbar">
              {!plan && !isLoading && (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 space-y-4 min-h-[400px]">
                  <LayoutList className="w-16 h-16 opacity-30" />
                  <p className="text-lg">Upload your syllabus to generate a week-by-week timeline.</p>
                </div>
              )}

              {isLoading && (
                <div className="h-full flex flex-col items-center justify-center text-fuchsia-500 space-y-4 min-h-[400px]">
                  <Loader2 className="w-12 h-12 animate-spin" />
                  <p className="animate-pulse font-medium text-lg">AI is mapping out your curriculum...</p>
                </div>
              )}

              {plan && plan.topics && (
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 dark:before:via-zinc-800 before:to-transparent">
                  {plan.topics.map((item: any, i: number) => (
                    <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      
                      {/* Timeline Dot */}
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-zinc-900 bg-fuchsia-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                        <span className="text-sm font-bold">{item.week || i+1}</span>
                      </div>
                      
                      {/* Card */}
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-700/50 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg">{item.topic}</h3>
                          <span className={clsx(
                            "text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider",
                            item.difficulty === 'hard' ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                            item.difficulty === 'medium' ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                            "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          )}>
                            {item.difficulty || 'medium'}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4 font-medium">
                          <Clock className="w-4 h-4 mr-1.5" />
                          <span>Estimated: {item.estimated_hours} hours</span>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sub-tasks</h4>
                          <ul className="space-y-2">
                            {item.sub_tasks?.map((task: string, j: number) => (
                              <li key={j} className="flex items-start text-sm text-gray-600 dark:text-gray-300">
                                <ListTodo className="w-4 h-4 text-fuchsia-400 mr-2 mt-0.5 shrink-0" />
                                <span>{task}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
