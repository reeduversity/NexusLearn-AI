'use client'

import React, { useState, useEffect } from 'react'
import { Heart, Wind, MessageCircle, Smile, Frown, Meh, Loader2, Send } from 'lucide-react'
import clsx from 'clsx'

const MOODS = [
  { id: 'happy', icon: Smile, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30', label: 'Great' },
  { id: 'okay', icon: Meh, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30', label: 'Okay' },
  { id: 'sad', icon: Frown, color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-900/30', label: 'Stressed' }
]

export default function WellbeingPage() {
  const [mood, setMood] = useState('okay')
  const [messages, setMessages] = useState<{role: 'user'|'bot', content: string}[]>([
    { role: 'bot', content: "Hi there! I'm your wellbeing companion. How are you feeling today?" }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [breathingPhase, setBreathingPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale')
  const [isBreathing, setIsBreathing] = useState(false)

  // Breathing logic
  useEffect(() => {
    if (!isBreathing) return
    
    let timer: NodeJS.Timeout
    const cycle = () => {
      setBreathingPhase('Inhale')
      timer = setTimeout(() => {
        setBreathingPhase('Hold')
        timer = setTimeout(() => {
          setBreathingPhase('Exhale')
          timer = setTimeout(cycle, 4000)
        }, 4000)
      }, 4000)
    }

    cycle()
    return () => clearTimeout(timer)
  }, [isBreathing])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setIsTyping(true)

    try {
      const response = await fetch('/api/wellbeing/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, mood })
      })
      const json = await response.json()
      if (response.ok) {
        setMessages(prev => [...prev, { role: 'bot', content: json.data.reply }])
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 space-y-8 animate-in fade-in zoom-in duration-500">
      
      {/* Header section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center justify-center p-3 bg-pink-100 dark:bg-pink-900/30 rounded-2xl mb-2 shadow-sm">
          <Heart className="w-8 h-8 text-pink-600 dark:text-pink-400" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600">
          AI Wellbeing Companion
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Take a deep breath. Track your mood and chat with your empathetic AI support system.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Breathing Exercise */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-gray-100 dark:border-zinc-800 shadow-xl flex flex-col items-center justify-center text-center min-h-[500px]">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Box Breathing</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-12">Follow the circle to relax your mind.</p>

          <div className="relative w-64 h-64 mb-12 flex items-center justify-center">
            {/* Pulsing rings */}
            <div className={clsx(
              "absolute inset-0 rounded-full border-4 transition-all duration-[4000ms] ease-in-out",
              !isBreathing ? "border-pink-200 dark:border-pink-900 scale-100" :
              breathingPhase === 'Inhale' ? "border-pink-400 dark:border-pink-500 scale-150" :
              breathingPhase === 'Hold' ? "border-pink-500 dark:border-pink-400 scale-150" :
              "border-pink-300 dark:border-pink-700 scale-100"
            )}></div>
            
            <div className="z-10 bg-gradient-to-tr from-pink-400 to-purple-500 w-32 h-32 rounded-full shadow-lg shadow-pink-500/50 flex items-center justify-center">
              <span className="text-white font-black text-2xl tracking-widest uppercase">
                {isBreathing ? breathingPhase : "Start"}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsBreathing(!isBreathing)}
            className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-black font-bold rounded-2xl hover:scale-105 transition-transform flex items-center"
          >
            <Wind className="w-5 h-5 mr-2" />
            {isBreathing ? "Stop Exercise" : "Begin Breathing"}
          </button>
        </div>

        {/* Chat & Mood Tracker */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-xl overflow-hidden flex flex-col min-h-[500px] h-[600px]">
          
          {/* Mood Selector */}
          <div className="p-6 bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-100 dark:border-zinc-800 flex flex-col items-center">
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">How are you feeling?</p>
            <div className="flex gap-4">
              {MOODS.map(m => (
                <button
                  key={m.id}
                  onClick={() => setMood(m.id)}
                  className={clsx(
                    "p-3 rounded-2xl flex flex-col items-center justify-center w-24 transition-all",
                    mood === m.id ? `${m.bg} ${m.color} ring-2 ring-current` : "bg-white dark:bg-zinc-800 text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-700"
                  )}
                >
                  <m.icon className="w-8 h-8 mb-1" />
                  <span className="text-xs font-bold">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar">
            {messages.map((msg, i) => (
              <div key={i} className={clsx(
                "max-w-[85%] rounded-2xl p-4",
                msg.role === 'user' 
                  ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white ml-auto rounded-tr-sm" 
                  : "bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 mr-auto rounded-tl-sm"
              )}>
                {msg.content}
              </div>
            ))}
            {isTyping && (
              <div className="bg-gray-100 dark:bg-zinc-800 text-gray-500 max-w-[85%] rounded-2xl p-4 mr-auto rounded-tl-sm flex items-center">
                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Typing...
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-zinc-900 border-t border-gray-100 dark:border-zinc-800">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Share your thoughts..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 rounded-xl bg-gray-100 dark:bg-zinc-800 border-transparent focus:border-pink-500 focus:bg-white dark:focus:bg-zinc-900 focus:ring-0 px-4 py-3 outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="bg-pink-500 hover:bg-pink-600 text-white p-3 rounded-xl transition-colors disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>

        </div>

      </div>
    </div>
  )
}
