'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Loader2, Volume2, User, Bot, AlertCircle } from 'lucide-react'
import clsx from 'clsx'

export default function VoicePartnerPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: "Hi there! I'm your AI Study Partner. What topic would you like to review today?" }
  ])

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  // Speech synthesis cleanup
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

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
      setError(null)
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel() // Stop AI if it's talking
      }
      setIsSpeaking(false)
    } catch (err) {
      console.error('Error accessing microphone:', err)
      setError('Could not access microphone. Please ensure permissions are granted.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true)
    setError(null)

    const formData = new FormData()
    formData.append('audio', audioBlob, 'recording.webm')

    try {
      const response = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: formData
      })

      const json = await response.json()

      if (!response.ok) {
        throw new Error(json.error || 'Failed to process audio')
      }

      const { userText, aiResponse } = json.data
      
      if (userText) {
        setMessages(prev => [...prev, { role: 'user', text: userText }])
      }
      
      setMessages(prev => [...prev, { role: 'ai', text: aiResponse }])
      
      speakResponse(aiResponse)

    } catch (err: any) {
      setError(err.message || 'An error occurred.')
    } finally {
      setIsProcessing(false)
    }
  }

  const speakResponse = (text: string) => {
    if (!window.speechSynthesis) return

    const utterance = new SpeechSynthesisUtterance(text)
    
    // Try to find a good English voice
    const voices = window.speechSynthesis.getVoices()
    const preferredVoice = voices.find(v => v.lang.includes('en') && v.name.includes('Google')) || voices[0]
    if (preferredVoice) utterance.voice = preferredVoice
    
    utterance.rate = 1.0
    utterance.pitch = 1.0

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 flex flex-col h-[calc(100vh-8rem)] animate-in fade-in duration-500">
      
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center justify-center gap-3">
          <Volume2 className="w-8 h-8 text-cyan-500" />
          AI Voice Partner
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Practice verbal answers and interviews seamlessly.</p>
      </div>

      <div className="flex-1 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm p-6 overflow-y-auto mb-6 flex flex-col gap-6 custom-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={clsx("flex items-start gap-4", msg.role === 'user' ? "flex-row-reverse" : "")}>
            <div className={clsx(
              "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
              msg.role === 'user' ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" : "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400"
            )}>
              {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>
            
            <div className={clsx(
              "px-5 py-3 rounded-2xl max-w-[80%]",
              msg.role === 'user' 
                ? "bg-indigo-600 text-white rounded-tr-sm" 
                : "bg-gray-100 text-gray-800 dark:bg-zinc-800 dark:text-gray-200 rounded-tl-sm"
            )}>
              <p className="leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}
        
        {isProcessing && (
          <div className="flex items-start gap-4">
             <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400">
              <Bot className="w-5 h-5" />
            </div>
            <div className="px-5 py-4 rounded-2xl bg-gray-100 dark:bg-zinc-800 rounded-tl-sm flex items-center">
              <Loader2 className="w-5 h-5 animate-spin text-cyan-500 mr-2" />
              <span className="text-gray-500 dark:text-gray-400 text-sm">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center justify-center">
        {error && (
          <div className="mb-4 text-red-500 text-sm flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" /> {error}
          </div>
        )}

        <div className="relative">
          {/* Pulsing ring when speaking or recording */}
          {(isRecording || isSpeaking) && (
            <div className={clsx(
              "absolute inset-0 rounded-full animate-ping opacity-20 scale-150",
              isRecording ? "bg-red-500" : "bg-cyan-500"
            )}></div>
          )}
          
          <button
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            disabled={isProcessing}
            className={clsx(
              "relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl",
              isProcessing ? "bg-gray-300 dark:bg-zinc-800 text-gray-500 cursor-not-allowed" :
              isRecording 
                ? "bg-red-500 text-white scale-110 shadow-red-500/50" 
                : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:scale-105 hover:shadow-cyan-500/30"
            )}
          >
            {isRecording ? <Mic className="w-10 h-10 animate-pulse" /> : <Mic className="w-10 h-10" />}
          </button>
        </div>
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 font-medium">
          {isRecording ? "Release to Send" : "Hold to Speak"}
        </p>
      </div>

    </div>
  )
}
