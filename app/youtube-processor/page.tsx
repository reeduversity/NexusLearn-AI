'use client'

import React, { useState } from 'react'
import { Youtube, Sparkles, Loader2, PlayCircle, BookOpen, Clock, FileText } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import clsx from 'clsx'

export default function YouTubeProcessorPage() {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ summary?: string; transcript?: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleProcess = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
      setError('Please enter a valid YouTube URL')
      return
    }

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video_url: url }),
      })

      const json = await response.json()

      if (!response.ok) {
        throw new Error(json.error || 'Failed to process video')
      }

      setResult({
        summary: json.data?.summary || '',
        transcript: json.data?.transcript || '',
      })
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  // Extract video ID for thumbnail
  const getVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }
  const videoId = getVideoId(url)

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-8 animate-in fade-in zoom-in duration-500">
      
      {/* Header section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center justify-center p-3 bg-red-100 dark:bg-red-900/30 rounded-2xl mb-2 shadow-sm">
          <Youtube className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-rose-600">
          YouTube Lecture AI
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Turn long lectures into structured notes instantly. Just paste a YouTube link, and our AI will extract key concepts and generate a comprehensive study guide.
        </p>
      </div>

      {/* Input Section */}
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleProcess} className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-rose-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative flex items-center bg-white dark:bg-zinc-900 rounded-full border-2 border-gray-100 dark:border-zinc-800 p-2 shadow-lg">
            <div className="pl-4 text-gray-400">
              <PlayCircle className="w-6 h-6" />
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste YouTube URL here (e.g. https://youtube.com/watch?v=...)"
              className="flex-1 bg-transparent px-4 py-3 outline-none text-gray-800 dark:text-gray-200 placeholder-gray-400 w-full"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!url || isLoading}
              className="bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-full px-8 py-3 font-semibold flex items-center space-x-2 hover:from-red-700 hover:to-rose-700 disabled:opacity-50 transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generate Notes</span>
                </>
              )}
            </button>
          </div>
        </form>
        {error && (
          <p className="mt-4 text-red-500 text-sm text-center animate-pulse">{error}</p>
        )}
      </div>

      {/* Results Section */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12 animate-in slide-in-from-bottom-8 duration-700">
          
          {/* Summary / Notes View (Takes 2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-gray-100 dark:border-zinc-800 shadow-xl shadow-red-900/5">
              <div className="flex items-center space-x-3 border-b border-gray-100 dark:border-zinc-800 pb-4 mb-6">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                  <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">AI Structured Notes</h2>
              </div>
              
              <div className="prose prose-lg prose-red dark:prose-invert max-w-none">
                <ReactMarkdown>{result.summary || '*No summary generated*'}</ReactMarkdown>
              </div>
            </div>
          </div>

          {/* Sidebar Data (Takes 1 column) */}
          <div className="space-y-6">
            {videoId && (
              <div className="bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-zinc-800 shadow-lg">
                <div className="aspect-video relative bg-zinc-100 dark:bg-zinc-800">
                  <img 
                    src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`} 
                    alt="Video Thumbnail" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                    }}
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <a href={url} target="_blank" rel="noreferrer" className="p-3 bg-white/20 rounded-full backdrop-blur-md hover:bg-white/40 transition-colors">
                      <PlayCircle className="w-10 h-10 text-white" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-gray-100 dark:border-zinc-800 shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="font-bold text-gray-800 dark:text-gray-100">Raw Transcript</h3>
              </div>
              <div className="h-64 overflow-y-auto custom-scrollbar pr-2 text-sm text-gray-600 dark:text-gray-400">
                {result.transcript ? (
                  <p className="whitespace-pre-wrap">{result.transcript}</p>
                ) : (
                  <p className="italic text-gray-400">Transcript unavailable.</p>
                )}
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  )
}
