'use client'

import React, { useState, useRef } from 'react'
import { FileSearch, Upload, Loader2, BarChart2, CheckCircle2, AlertTriangle, Lightbulb, TrendingUp } from 'lucide-react'
import clsx from 'clsx'

export default function PyqAnalyzerPage() {
  const [files, setFiles] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || [])
    if (selected.length > 0) {
      setFiles(prev => [...prev, ...selected].slice(0, 5)) // Max 5 files
      setError(null)
      setAnalysis(null)
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault()
    if (files.length === 0) return

    setIsLoading(true)
    setError(null)

    const formData = new FormData()
    files.forEach(file => {
      formData.append('files', file)
    })

    try {
      const response = await fetch('/api/pyq/analyze', {
        method: 'POST',
        body: formData
      })

      const json = await response.json()

      if (!response.ok) {
        throw new Error(json.error || 'Failed to analyze PYQs')
      }

      setAnalysis(json.data)
    } catch (err: any) {
      setError(err.message || 'An error occurred during analysis.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 space-y-8 animate-in fade-in zoom-in duration-500">
      
      {/* Header section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center justify-center p-3 bg-rose-100 dark:bg-rose-900/30 rounded-2xl mb-2 shadow-sm">
          <FileSearch className="w-8 h-8 text-rose-600 dark:text-rose-400" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-pink-600">
          PYQ Analyzer
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Upload Previous Year Question (PYQ) papers. AI will analyze patterns, extract repeated topics, and predict what's most likely to appear on your next exam.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Generator Form Section */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-gray-100 dark:border-zinc-800 shadow-xl">
            <h2 className="text-xl font-bold flex items-center space-x-2 mb-6 text-gray-800 dark:text-gray-100">
              <Upload className="w-5 h-5 text-rose-500" />
              <span>Upload Past Papers</span>
            </h2>

            <form onSubmit={handleAnalyze} className="space-y-6">
              
              <div 
                className={clsx(
                  "relative group border-2 border-dashed rounded-2xl p-6 transition-all duration-300 text-center cursor-pointer overflow-hidden",
                  files.length > 0 
                    ? "border-rose-500 bg-rose-50/50 dark:bg-rose-900/10" 
                    : "border-gray-300 dark:border-gray-700 hover:border-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                )}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  multiple
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                <div className="flex flex-col items-center justify-center py-4 space-y-3">
                  <div className="p-3 bg-rose-100 dark:bg-rose-900/30 rounded-full group-hover:scale-110 transition-transform">
                    <FileSearch className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Click to upload multiple PDFs/Docs (Max 5)</p>
                </div>
              </div>

              {files.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Selected Files ({files.length}/5)</h3>
                  <ul className="space-y-2">
                    {files.map((file, idx) => (
                      <li key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 text-sm">
                        <span className="truncate max-w-[200px] font-medium text-gray-700 dark:text-gray-300">{file.name}</span>
                        <button 
                          type="button" 
                          onClick={() => removeFile(idx)}
                          className="text-red-500 hover:text-red-700 font-bold px-2"
                        >&times;</button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                type="submit"
                disabled={files.length === 0 || isLoading}
                className="w-full flex items-center justify-center py-4 px-6 rounded-2xl text-white font-semibold text-lg bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 shadow-lg shadow-rose-500/30 hover:-translate-y-1 disabled:opacity-50 transition-all duration-300"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                    Analyzing Patterns...
                  </>
                ) : (
                  <>
                    <BarChart2 className="w-6 h-6 mr-3" />
                    Find Probable Topics
                  </>
                )}
              </button>
            </form>

            {error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm border border-red-200 dark:border-red-900/50 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 shrink-0" />
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-8">
          <div className={clsx(
            "bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-xl overflow-hidden transition-all duration-700 h-full min-h-[600px]",
            analysis ? "opacity-100 translate-y-0" : "opacity-50 translate-y-4"
          )}>
            
            <div className="p-6 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/50 flex items-center">
              <TrendingUp className="w-6 h-6 text-rose-500 mr-3" />
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                Predictive Analysis
              </h2>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[800px] custom-scrollbar">
              {!analysis && !isLoading && (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 space-y-4 min-h-[400px]">
                  <BarChart2 className="w-16 h-16 opacity-30" />
                  <p className="text-lg">Upload past exam papers to reveal the hidden patterns.</p>
                </div>
              )}

              {isLoading && (
                <div className="h-full flex flex-col items-center justify-center text-rose-500 space-y-4 min-h-[400px]">
                  <Loader2 className="w-12 h-12 animate-spin" />
                  <p className="animate-pulse font-medium text-lg">Cross-referencing papers & calculating probabilities...</p>
                </div>
              )}

              {analysis && analysis.topics && (
                <div className="space-y-8">
                  <div className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 p-5 rounded-2xl border border-rose-100 dark:border-rose-900/30 flex items-start">
                    <Lightbulb className="w-6 h-6 text-rose-500 mt-0.5 mr-3 shrink-0" />
                    <div>
                      <h4 className="font-bold text-rose-800 dark:text-rose-300 mb-1">Overall Trend</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{analysis.insights}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Sort topics by probability descending */}
                    {analysis.topics.sort((a: any, b: any) => b.probability - a.probability).map((topic: any, i: number) => (
                      <div key={i} className="p-5 bg-white dark:bg-zinc-800 rounded-2xl border border-gray-100 dark:border-zinc-700 shadow-sm relative overflow-hidden group">
                        
                        {/* Probability Badge */}
                        <div className="absolute top-5 right-5 flex items-center justify-center">
                          <div className={clsx(
                            "w-16 h-16 rounded-full flex items-center justify-center font-black text-xl border-4",
                            topic.probability >= 80 ? "border-green-500 text-green-600 dark:text-green-400" :
                            topic.probability >= 50 ? "border-amber-500 text-amber-600 dark:text-amber-400" :
                            "border-red-500 text-red-600 dark:text-red-400"
                          )}>
                            {topic.probability}%
                          </div>
                        </div>

                        <div className="pr-20">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-rose-500 transition-colors">
                            {topic.topic}
                          </h3>
                          
                          <div className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-1.5" />
                            {topic.frequency}
                          </div>

                          <div className="bg-gray-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-gray-100 dark:border-zinc-700/50">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Example Question</span>
                            <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{topic.example_question}"</p>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
