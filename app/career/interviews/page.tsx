'use client'

import React, { useState, useRef } from 'react'
import { MessageSquare, Play, Video, Mic, StopCircle, CheckCircle2, ChevronRight, User, Bot, Loader2, AlertCircle } from 'lucide-react'
import clsx from 'clsx'

const QUESTION_BANK = [
  "Tell me about a time you had to learn a new technology quickly.",
  "How do you handle disagreements with a team member?",
  "Explain the difference between TCP and UDP as if I were a non-technical person.",
  "Describe a project you are most proud of and why."
]

export default function MockInterviewPage() {
  const [isStarted, setIsStarted] = useState(false)
  const [currentQIndex, setCurrentQIndex] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [feedback, setFeedback] = useState<any>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const handleStart = () => {
    setIsStarted(true)
    setCurrentQIndex(0)
    setFeedback(null)
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      audioChunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data)
        }
      }

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        await processAudio(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      recorder.start()
      setIsRecording(true)
      setFeedback(null)
    } catch (err) {
      console.error('Error accessing microphone:', err)
      alert('Could not access microphone. Please ensure permissions are granted.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleRecordToggle = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  const processAudio = async (audioBlob: Blob) => {
    setIsAnalyzing(true)
    setFeedback(null)

    try {
      // 1. Transcribe audio
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')
      const transcribeRes = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: formData
      })
      const transcribeJson = await transcribeRes.json()
      if (!transcribeRes.ok) throw new Error(transcribeJson.error || 'Failed to transcribe audio')
      
      const transcript = transcribeJson.data.userText
      if (!transcript || transcript.trim().length === 0) {
        throw new Error("No speech detected.")
      }

      // 2. Get feedback
      const feedbackRes = await fetch('/api/career/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: QUESTION_BANK[currentQIndex], transcript })
      })
      const feedbackJson = await feedbackRes.json()
      if (!feedbackRes.ok) throw new Error(feedbackJson.error || 'Failed to get feedback')

      setFeedback(feedbackJson.data)
    } catch (err: any) {
      console.error(err)
      alert(err.message || 'An error occurred during analysis.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleNext = () => {
    if (currentQIndex < QUESTION_BANK.length - 1) {
      setCurrentQIndex(c => c + 1)
      setFeedback(null)
    } else {
      setIsStarted(false)
    }
  }

  if (!isStarted) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="inline-flex items-center justify-center p-6 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4 shadow-sm">
          <MessageSquare className="w-16 h-16 text-purple-600 dark:text-purple-400" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          AI Interview Coach
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Practice behavioral and technical rounds with real-time AI feedback on your tone, structure, and content.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto text-left mt-8">
          <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
            <Video className="w-8 h-8 text-indigo-500 mb-4" />
            <h3 className="font-bold text-lg mb-2">Simulated Environment</h3>
            <p className="text-gray-500 text-sm">Face a realistic, pressure-tested interview scenario designed by hiring managers.</p>
          </div>
          <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-4" />
            <h3 className="font-bold text-lg mb-2">Instant Feedback</h3>
            <p className="text-gray-500 text-sm">Get actionable insights on filler words, STAR method usage, and technical accuracy.</p>
          </div>
        </div>

        <button 
          onClick={handleStart}
          className="mt-8 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-10 py-4 rounded-full font-bold text-lg inline-flex items-center transition-all hover:scale-105 shadow-xl shadow-purple-500/30"
        >
          <Play className="mr-3 w-5 h-5 fill-current" />
          Start Mock Interview
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 h-[calc(100vh-8rem)] flex flex-col animate-in slide-in-from-bottom-8 duration-500">
      
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center space-x-3">
          <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
          <span className="font-bold text-gray-800 dark:text-gray-200">Live Interview Session</span>
        </div>
        <div className="text-sm font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-3 py-1 rounded-full">
          Question {currentQIndex + 1} of {QUESTION_BANK.length}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* Main Interview Area */}
        <div className="lg:col-span-8 flex flex-col gap-6 h-full">
          
          {/* AI Question Card */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-zinc-800 dark:to-zinc-900 rounded-3xl p-8 border border-indigo-100 dark:border-zinc-700 shadow-sm flex-1 flex flex-col justify-center relative overflow-hidden">
            <Bot className="absolute top-8 right-8 w-16 h-16 text-indigo-500/10" />
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">
              "{QUESTION_BANK[currentQIndex]}"
            </h2>
          </div>

          {/* User Recording Area */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-gray-100 dark:border-zinc-800 shadow-sm flex flex-col items-center justify-center min-h-[250px]">
            
            {isAnalyzing ? (
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
                <p className="text-gray-500 font-medium animate-pulse">Analyzing response via AI...</p>
              </div>
            ) : (
              <>
                <div className={clsx(
                  "w-32 h-32 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 shadow-xl relative",
                  isRecording 
                    ? "bg-red-500 hover:bg-red-600 shadow-red-500/40" 
                    : "bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700"
                )} onClick={handleRecordToggle}>
                  {isRecording && (
                    <div className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping opacity-50"></div>
                  )}
                  {isRecording ? <StopCircle className="w-12 h-12 text-white" /> : <Mic className="w-12 h-12 text-gray-400" />}
                </div>
                <p className="mt-6 text-gray-500 font-medium">
                  {isRecording ? "Recording your answer... Click to stop." : "Click microphone to start answering"}
                </p>
              </>
            )}

          </div>
        </div>

        {/* Feedback Sidebar */}
        <div className="lg:col-span-4 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm p-6 overflow-y-auto">
          <h3 className="font-bold text-xl mb-6 text-gray-900 dark:text-white border-b border-gray-100 dark:border-zinc-800 pb-4">AI Feedback</h3>
          
          {!feedback && !isAnalyzing && (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 min-h-[300px]">
              <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
              <p>Answer the question to generate real-time AI feedback on your performance.</p>
            </div>
          )}

          {feedback && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl">
                <span className="font-bold text-purple-900 dark:text-purple-100">Performance Score</span>
                <span className="text-2xl font-black text-purple-600 dark:text-purple-400">{feedback.score}/100</span>
              </div>

              <div>
                <h4 className="font-bold text-emerald-600 dark:text-emerald-400 mb-3 flex items-center"><CheckCircle2 className="w-4 h-4 mr-2" /> Strengths</h4>
                <ul className="space-y-2">
                  {feedback.strengths.map((s: string, i: number) => (
                    <li key={i} className="text-sm text-gray-700 dark:text-gray-300 bg-emerald-50 dark:bg-emerald-900/10 px-3 py-2 rounded-lg">{s}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-red-600 dark:text-red-400 mb-3 flex items-center"><AlertCircle className="w-4 h-4 mr-2" /> Needs Improvement</h4>
                <ul className="space-y-2">
                  {feedback.improvements.map((s: string, i: number) => (
                    <li key={i} className="text-sm text-gray-700 dark:text-gray-300 bg-red-50 dark:bg-red-900/10 px-3 py-2 rounded-lg">{s}</li>
                  ))}
                </ul>
              </div>

              <button 
                onClick={handleNext}
                className="w-full mt-6 py-4 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-xl font-bold flex items-center justify-center transition-colors"
              >
                {currentQIndex < QUESTION_BANK.length - 1 ? "Next Question" : "Finish Interview"}
                <ChevronRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
