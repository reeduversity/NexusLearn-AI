'use client'

import { useState } from 'react'
import { Smile, Frown, Meh, SmilePlus, Angry, Zap, Send, MessageCircle } from 'lucide-react'
import { logMood, sendWellbeingMessage } from '@/actions/wellbeing'

const moodIcons = [
  { value: 1, icon: Angry, label: 'Terrible', color: 'text-red-500' },
  { value: 2, icon: Frown, label: 'Bad', color: 'text-orange-500' },
  { value: 3, icon: Meh, label: 'Okay', color: 'text-yellow-500' },
  { value: 4, icon: Smile, label: 'Good', color: 'text-lime-500' },
  { value: 5, icon: SmilePlus, label: 'Great', color: 'text-green-500' },
]

const energyLevels = [
  { value: 1, label: 'Exhausted' },
  { value: 2, label: 'Tired' },
  { value: 3, label: 'Normal' },
  { value: 4, label: 'Energized' },
  { value: 5, label: 'Supercharged' },
]

export function MoodLogger() {
  const [selectedMood, setSelectedMood] = useState(0)
  const [selectedEnergy, setSelectedEnergy] = useState(0)
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleSubmit() {
    if (selectedMood === 0 || selectedEnergy === 0) {
      setMessage({ type: 'error', text: 'Please select both mood and energy level.' })
      return
    }

    setIsSubmitting(true)
    setMessage(null)

    const formData = new FormData()
    formData.set('mood', String(selectedMood))
    formData.set('energy', String(selectedEnergy))
    formData.set('notes', notes)

    const result = await logMood(formData)

    if (result?.error) {
      setMessage({ type: 'error', text: result.error })
    } else {
      setMessage({ type: 'success', text: 'Mood logged successfully!' })
      setSelectedMood(0)
      setSelectedEnergy(0)
      setNotes('')
    }

    setIsSubmitting(false)
  }

  return (
    <div className="space-y-6">
      {/* Mood Selection */}
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">How are you feeling?</p>
        <div className="flex items-center justify-between gap-2">
          {moodIcons.map((m) => {
            const Icon = m.icon
            return (
              <button
                key={m.value}
                onClick={() => setSelectedMood(m.value)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                  selectedMood === m.value
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 ring-2 ring-indigo-500 scale-110'
                    : 'hover:bg-gray-50 dark:hover:bg-zinc-800'
                }`}
              >
                <Icon className={`h-7 w-7 ${selectedMood === m.value ? m.color : 'text-gray-400'}`} />
                <span className="text-xs text-gray-500 dark:text-gray-400">{m.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Energy Level */}
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          <Zap className="inline h-4 w-4 mr-1 text-yellow-500" />
          Energy Level
        </p>
        <div className="flex items-center gap-2">
          {energyLevels.map((e) => (
            <button
              key={e.value}
              onClick={() => setSelectedEnergy(e.value)}
              className={`flex-1 py-2 px-2 text-xs font-medium rounded-lg transition-all ${
                selectedEnergy === e.value
                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 ring-2 ring-yellow-500'
                  : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-700'
              }`}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any thoughts or notes about your day..."
          rows={2}
          className="w-full rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Logging...' : 'Log My Mood'}
      </button>

      {message && (
        <p className={`text-sm text-center ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          {message.text}
        </p>
      )}
    </div>
  )
}

export function WellbeingChat() {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSend() {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    const result = await sendWellbeingMessage(userMessage)

    if (result?.reply) {
      setMessages((prev) => [...prev, { role: 'assistant', content: result.reply }])
    } else {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I couldn\'t process that right now. Please try again.' },
      ])
    }

    setIsLoading(false)
  }

  return (
    <div className="flex flex-col h-80">
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageCircle className="h-10 w-10 text-gray-300 dark:text-zinc-600 mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Talk to your AI Wellbeing Companion about stress, motivation, or anything on your mind.
            </p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-gray-100'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-zinc-800 rounded-xl px-4 py-2.5 text-sm text-gray-500">
              <span className="animate-pulse">Thinking...</span>
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="How are you feeling today?"
          className="flex-1 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="p-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
