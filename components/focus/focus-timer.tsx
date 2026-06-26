'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Timer, Play, Pause, RotateCcw } from 'lucide-react'
import { saveFocusSession } from '@/actions/wellbeing'

const POMODORO_DURATION = 25 * 60 // 25 minutes in seconds
const SHORT_BREAK = 5 * 60
const LONG_BREAK = 15 * 60

type TimerMode = 'focus' | 'short_break' | 'long_break'

export function FocusTimer() {
  const [mode, setMode] = useState<TimerMode>('focus')
  const [timeLeft, setTimeLeft] = useState(POMODORO_DURATION)
  const [isRunning, setIsRunning] = useState(false)
  const [completedSessions, setCompletedSessions] = useState(0)
  const [saveMessage, setSaveMessage] = useState('')
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)

  const getDuration = useCallback((m: TimerMode) => {
    if (m === 'focus') return POMODORO_DURATION
    if (m === 'short_break') return SHORT_BREAK
    return LONG_BREAK
  }, [])

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!)
            setIsRunning(false)
            if (mode === 'focus') {
              setCompletedSessions((s) => s + 1)
              const elapsed = Math.round((Date.now() - startTimeRef.current) / 60000)
              saveFocusSession(elapsed > 0 ? elapsed : 25).then((res) => {
                if (res?.success !== false) {
                  setSaveMessage('Session saved!')
                  setTimeout(() => setSaveMessage(''), 3000)
                }
              })
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, timeLeft, mode])

  function handleStart() {
    if (!isRunning) {
      startTimeRef.current = Date.now()
    }
    setIsRunning(true)
  }

  function handlePause() {
    setIsRunning(false)
  }

  function handleReset() {
    setIsRunning(false)
    setTimeLeft(getDuration(mode))
  }

  function switchMode(newMode: TimerMode) {
    setIsRunning(false)
    setMode(newMode)
    setTimeLeft(getDuration(newMode))
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const progress = ((getDuration(mode) - timeLeft) / getDuration(mode)) * 100
  const circumference = 2 * Math.PI * 120
  const strokeDashoffset = circumference - (progress / 100) * circumference

  const modeColors: Record<TimerMode, { ring: string; bg: string; text: string }> = {
    focus: { ring: 'stroke-indigo-500', bg: 'bg-indigo-600', text: 'text-indigo-600 dark:text-indigo-400' },
    short_break: { ring: 'stroke-green-500', bg: 'bg-green-600', text: 'text-green-600 dark:text-green-400' },
    long_break: { ring: 'stroke-orange-500', bg: 'bg-orange-600', text: 'text-orange-600 dark:text-orange-400' },
  }

  const colors = modeColors[mode]

  return (
    <div className="flex flex-col items-center space-y-8">
      {/* Mode Tabs */}
      <div className="flex items-center gap-2 bg-gray-100 dark:bg-zinc-800 rounded-xl p-1">
        {[
          { key: 'focus' as TimerMode, label: 'Focus' },
          { key: 'short_break' as TimerMode, label: 'Short Break' },
          { key: 'long_break' as TimerMode, label: 'Long Break' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => switchMode(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              mode === tab.key
                ? `${colors.bg} text-white`
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Circular Timer */}
      <div className="relative w-64 h-64">
        <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 256 256">
          <circle
            cx="128"
            cy="128"
            r="120"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-gray-200 dark:text-zinc-800"
          />
          <circle
            cx="128"
            cy="128"
            r="120"
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            className={`${colors.ring} transition-all duration-1000`}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Timer className={`h-6 w-6 mb-2 ${colors.text}`} />
          <span className="text-5xl font-mono font-bold text-gray-900 dark:text-white">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400 mt-1 capitalize">
            {mode.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {!isRunning ? (
          <button
            onClick={handleStart}
            className={`flex items-center gap-2 ${colors.bg} text-white px-8 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity`}
          >
            <Play className="h-5 w-5" />
            {timeLeft === getDuration(mode) ? 'Start' : 'Resume'}
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="flex items-center gap-2 bg-gray-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-gray-700 transition-colors"
          >
            <Pause className="h-5 w-5" />
            Pause
          </button>
        )}
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
        >
          <RotateCcw className="h-5 w-5" />
          Reset
        </button>
      </div>

      {/* Session Info */}
      <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
        <span>Sessions completed: <strong className={colors.text}>{completedSessions}</strong></span>
      </div>

      {saveMessage && (
        <p className="text-sm text-green-600 dark:text-green-400 font-medium">{saveMessage}</p>
      )}
    </div>
  )
}
