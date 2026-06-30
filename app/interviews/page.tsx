'use client'

import { useState, useRef, useEffect } from 'react'
import {
  MessageSquare,
  Send,
  Bot,
  User,
  Code2,
  Brain,
  Users,
  Heart,
  Loader2,
  RotateCcw,
  Trophy,
  Lightbulb,
} from 'lucide-react'

interface Message {
  role: 'ai' | 'user'
  content: string
  feedback?: string
  score?: number
  tips?: string[]
}

const interviewTypes = [
  { id: 'dsa', label: 'DSA / Technical', icon: Code2, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/20', border: 'border-blue-200 dark:border-blue-900/30', description: 'Data structures, algorithms, and coding problems' },
  { id: 'aptitude', label: 'Aptitude', icon: Brain, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/20', border: 'border-purple-200 dark:border-purple-900/30', description: 'Logical reasoning, quantitative aptitude, and puzzles' },
  { id: 'hr', label: 'HR Round', icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20', border: 'border-emerald-200 dark:border-emerald-900/30', description: 'Salary negotiation, company fit, and professional goals' },
  { id: 'behavioral', label: 'Behavioral', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-950/20', border: 'border-rose-200 dark:border-rose-900/30', description: 'STAR method, teamwork, leadership, and conflict resolution' },
]

export default function MockInterviewPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionStarted, setSessionStarted] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const startInterview = async (typeId: string) => {
    setSelectedType(typeId)
    setMessages([])
    setSessionStarted(true)
    setLoading(true)

    try {
      const typeName = interviewTypes.find((t) => t.id === typeId)?.label || typeId

      // Get opening question from AI
      const response = await fetch('/api/career/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: typeName,
          question: `Start a ${typeName} mock interview. Ask the first question.`,
        }),
      })

      if (!response.ok) throw new Error('Failed to start interview')

      const { data } = await response.json()
      setMessages([{
        role: 'ai',
        content: data.followUpQuestion || data.follow_up_question || `Welcome to your ${typeName} interview! Let me start with the first question.`,
      }])
    } catch (err) {
      console.error('Failed to start interview:', err)
      setMessages([{
        role: 'ai',
        content: 'Sorry, I encountered an error starting the interview. Please try again.',
      }])
    } finally {
      setLoading(false)
    }
  }

  const sendAnswer = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const typeName = interviewTypes.find((t) => t.id === selectedType)?.label || selectedType || ''

      const response = await fetch('/api/career/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: typeName,
          question: userMessage,
        }),
      })

      if (!response.ok) throw new Error('Failed to get response')

      const { data } = await response.json()
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: data.followUpQuestion || data.follow_up_question || 'Good answer! Any other thoughts?',
          feedback: data.feedback,
          score: data.score,
          tips: data.tips,
        },
      ])
    } catch (err) {
      console.error('Interview error:', err)
      setMessages((prev) => [
        ...prev,
        { role: 'ai', content: 'Sorry, I had trouble processing your response. Please try again.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const endSession = async () => {
    setSessionStarted(false)
    setSelectedType(null)
    setMessages([])
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendAnswer()
    }
  }

  // Type selection screen
  if (!sessionStarted) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mock Interview AI</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Practice interviews with AI. Choose your interview type to begin.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {interviewTypes.map((type) => {
            const Icon = type.icon
            return (
              <button
                key={type.id}
                onClick={() => startInterview(type.id)}
                className={`rounded-xl border p-6 text-left transition-all hover:shadow-md ${type.bg} ${type.border} hover:scale-[1.02]`}
              >
                <Icon className={`h-8 w-8 ${type.color} mb-3`} />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{type.label}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{type.description}</p>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // Chat interface
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <MessageSquare className="mr-2 h-6 w-6 text-indigo-500" />
            {interviewTypes.find((t) => t.id === selectedType)?.label} Interview
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Answer naturally. The AI will evaluate and follow up.</p>
        </div>
        <button
          onClick={endSession}
          className="inline-flex items-center rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/40 transition-colors"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          End Session
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-1' : ''}`}>
              <div className={`flex items-start space-x-2 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`shrink-0 rounded-full p-2 ${msg.role === 'ai' ? 'bg-indigo-100 dark:bg-indigo-900/30' : 'bg-gray-200 dark:bg-zinc-700'}`}>
                  {msg.role === 'ai' ? <Bot className="h-4 w-4 text-indigo-600 dark:text-indigo-400" /> : <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />}
                </div>
                <div>
                  <div className={`rounded-xl px-4 py-3 text-sm ${
                    msg.role === 'ai'
                      ? 'bg-white border border-gray-200 text-gray-800 dark:bg-zinc-900 dark:border-zinc-800 dark:text-gray-200'
                      : 'bg-indigo-600 text-white'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>

                  {/* Feedback card */}
                  {msg.feedback && (
                    <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/30 dark:bg-amber-950/20">
                      {msg.score !== undefined && (
                        <div className="flex items-center space-x-2 mb-2">
                          <Trophy className="h-4 w-4 text-amber-500" />
                          <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">Score: {msg.score}/10</span>
                        </div>
                      )}
                      <p className="text-xs text-amber-800 dark:text-amber-300">{msg.feedback}</p>
                      {msg.tips && msg.tips.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {msg.tips.map((tip, i) => (
                            <p key={i} className="text-xs text-amber-700 dark:text-amber-400 flex items-start">
                              <Lightbulb className="mr-1 h-3 w-3 mt-0.5 shrink-0" /> {tip}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2">
              <div className="rounded-full p-2 bg-indigo-100 dark:bg-indigo-900/30">
                <Bot className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="rounded-xl bg-white border border-gray-200 px-4 py-3 dark:bg-zinc-900 dark:border-zinc-800">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="mt-4 flex items-end space-x-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          placeholder="Type your answer..."
          disabled={loading}
        />
        <button
          onClick={sendAnswer}
          disabled={loading || !input.trim()}
          className="shrink-0 rounded-xl bg-indigo-600 p-3 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
