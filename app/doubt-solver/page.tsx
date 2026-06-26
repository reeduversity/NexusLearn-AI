'use client'

import React, { useState, useRef } from 'react'
import { Upload, Camera, Sparkles, Loader2, Image as ImageIcon, X, CheckCircle2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import clsx from 'clsx'

export default function DoubtSolverPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ extractedText?: string; solution?: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB')
        return
      }
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImage(reader.result as string)
        setResult(null)
        setError(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSolve = async () => {
    if (!selectedImage) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ocr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image_url: selectedImage }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to solve doubt')
      }

      setResult({
        extractedText: data.data?.extractedText || '',
        solution: data.data?.solution || '',
      })
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl mb-2">
          <Camera className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
          AI Doubt Solver
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Snap a photo of your math, physics, or coding problem. Our AI will extract the text and explain the solution step-by-step.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="space-y-6">
          <div 
            className={clsx(
              "relative group border-2 border-dashed rounded-3xl p-8 transition-all duration-300 text-center cursor-pointer overflow-hidden",
              selectedImage 
                ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10" 
                : "border-gray-300 dark:border-gray-700 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
            )}
            onClick={() => !selectedImage && fileInputRef.current?.click()}
          >
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageUpload}
            />

            {selectedImage ? (
              <div className="relative rounded-2xl overflow-hidden aspect-video w-full flex items-center justify-center bg-black/5">
                <img src={selectedImage} alt="Problem" className="object-contain max-h-full max-w-full" />
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedImage(null)
                    setResult(null)
                  }}
                  className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-full group-hover:scale-110 transition-transform duration-300">
                  <Upload className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    SVG, PNG, JPG or GIF (max. 5MB)
                  </p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleSolve}
            disabled={!selectedImage || isLoading}
            className="w-full flex items-center justify-center py-4 px-6 rounded-2xl text-white font-semibold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:-translate-y-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                Solving with AI...
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6 mr-3" />
                Solve Doubt Instantly
              </>
            )}
          </button>
          
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl text-sm border border-red-200 dark:border-red-900/50 flex items-center">
              <X className="w-5 h-5 mr-2 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          <div className={clsx(
            "bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden transition-all duration-500",
            result ? "opacity-100 translate-y-0" : "opacity-50 translate-y-4"
          )}>
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-lg">AI Solution</h3>
            </div>
            
            <div className="p-6 min-h-[400px]">
              {!result && !isLoading && (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 space-y-4 min-h-[300px]">
                  <ImageIcon className="w-12 h-12 opacity-50" />
                  <p>Upload an image and click solve to see the magic here.</p>
                </div>
              )}

              {isLoading && (
                <div className="h-full flex flex-col items-center justify-center text-indigo-500 space-y-4 min-h-[300px]">
                  <Loader2 className="w-10 h-10 animate-spin" />
                  <p className="animate-pulse font-medium">Analyzing your problem...</p>
                </div>
              )}

              {result && (
                <div className="space-y-6 prose prose-indigo dark:prose-invert max-w-none">
                  {result.extractedText && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 text-sm">
                      <span className="font-semibold text-gray-500 block mb-2 uppercase tracking-wider text-xs">Extracted Text</span>
                      {result.extractedText}
                    </div>
                  )}
                  <div className="mt-6 text-gray-800 dark:text-gray-200 leading-relaxed">
                    <ReactMarkdown>{result.solution || ''}</ReactMarkdown>
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
