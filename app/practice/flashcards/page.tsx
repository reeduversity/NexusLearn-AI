'use client'

import React, { useState, useEffect } from 'react'
import { Layers, BrainCircuit, RefreshCw, Check, X, RotateCcw, Zap, Trophy } from 'lucide-react'
import clsx from 'clsx'

// Mock data to demonstrate if DB is empty
const mockCards = [
  { id: 1, front: "What does the 'S' in SOLID stand for?", back: "Single Responsibility Principle - A class should have one, and only one, reason to change." },
  { id: 2, front: "Explain the time complexity of QuickSort.", back: "Average case: O(n log n). Worst case: O(n^2) when the pivot is the smallest or largest element." },
  { id: 3, front: "What is a Closure in JavaScript?", back: "A closure is the combination of a function bundled together with references to its surrounding state (the lexical environment)." },
]

export default function FlashcardStudyPage() {
  const [cards, setCards] = useState<typeof mockCards>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [score, setScore] = useState({ correct: 0, incorrect: 0, hard: 0 })

  useEffect(() => {
    // In a real app, we would fetch from the database via Prisma here
    setCards(mockCards)
  }, [])

  const currentCard = cards[currentIndex]

  const handleNext = (quality: 'easy' | 'hard' | 'fail') => {
    // Basic SM-2 simulation stats updating
    if (quality === 'easy') setScore(s => ({ ...s, correct: s.correct + 1 }))
    if (quality === 'hard') setScore(s => ({ ...s, hard: s.hard + 1 }))
    if (quality === 'fail') setScore(s => ({ ...s, incorrect: s.incorrect + 1 }))

    setIsFlipped(false)
    setTimeout(() => {
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(c => c + 1)
      } else {
        setIsFinished(true)
      }
    }, 150) // wait for flip animation
  }

  const handleRestart = () => {
    setCurrentIndex(0)
    setIsFlipped(false)
    setIsFinished(false)
    setScore({ correct: 0, incorrect: 0, hard: 0 })
    // shuffle cards
    setCards([...mockCards].sort(() => Math.random() - 0.5))
  }

  if (isFinished) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center space-y-8 animate-in zoom-in duration-500">
        <div className="inline-flex items-center justify-center p-6 bg-amber-100 dark:bg-amber-900/30 rounded-full mb-4">
          <Trophy className="w-16 h-16 text-amber-500" />
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">Session Complete!</h1>
        <p className="text-xl text-gray-500 dark:text-gray-400">You reviewed {cards.length} cards using Spaced Repetition.</p>
        
        <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mt-8">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm">
            <Check className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{score.correct}</p>
            <p className="text-sm text-gray-500">Mastered</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm">
            <RefreshCw className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{score.hard}</p>
            <p className="text-sm text-gray-500">Review Soon</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm">
            <X className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{score.incorrect}</p>
            <p className="text-sm text-gray-500">Needs Work</p>
          </div>
        </div>

        <button 
          onClick={handleRestart}
          className="mt-12 bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 rounded-2xl font-bold text-lg inline-flex items-center transition-all hover:scale-105 shadow-lg shadow-amber-500/30"
        >
          <RotateCcw className="mr-3 w-5 h-5" />
          Study Again
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
            <Layers className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Smart Flashcards</h1>
            <p className="text-sm text-gray-500">Powered by SM-2 Algorithm</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm font-semibold bg-white dark:bg-zinc-900 px-4 py-2 rounded-full border border-gray-100 dark:border-zinc-800 shadow-sm">
          <span className="text-amber-500">{currentIndex + 1}</span>
          <span className="text-gray-300 dark:text-zinc-600">/</span>
          <span className="text-gray-500">{cards.length}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-100 dark:bg-zinc-800 rounded-full h-2 mb-8 overflow-hidden">
        <div 
          className="bg-amber-500 h-2 rounded-full transition-all duration-300" 
          style={{ width: `${((currentIndex) / cards.length) * 100}%` }}
        ></div>
      </div>

      {/* Card Container */}
      <div className="perspective-1000 w-full max-w-2xl mx-auto h-[400px]">
        <div 
          className={clsx(
            "w-full h-full transition-all duration-500 transform-style-3d cursor-pointer relative",
            isFlipped ? "rotate-y-180" : ""
          )}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Front */}
          <div className="absolute inset-0 w-full h-full backface-hidden bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-xl flex flex-col items-center justify-center p-10 text-center">
            <BrainCircuit className="w-12 h-12 text-gray-200 dark:text-zinc-800 absolute top-8 right-8" />
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 leading-tight">
              {currentCard?.front}
            </h2>
            <p className="absolute bottom-8 text-sm text-gray-400 font-medium uppercase tracking-widest animate-pulse">
              Click to reveal answer
            </p>
          </div>

          {/* Back */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-zinc-800 dark:to-zinc-900 rounded-3xl border border-amber-100 dark:border-zinc-700 shadow-xl flex flex-col items-center justify-center p-10 text-center">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 leading-relaxed">
              {currentCard?.back}
            </h2>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className={clsx(
        "flex items-center justify-center space-x-4 max-w-2xl mx-auto mt-12 transition-all duration-300",
        isFlipped ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      )}>
        <button 
          onClick={() => handleNext('fail')}
          className="flex-1 bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 py-4 rounded-2xl font-bold flex flex-col items-center justify-center group transition-colors shadow-sm"
        >
          <X className="w-6 h-6 mb-1 group-hover:scale-110 transition-transform" />
          <span>Again</span>
          <span className="text-xs font-normal opacity-70 mt-1">&lt; 1 min</span>
        </button>

        <button 
          onClick={() => handleNext('hard')}
          className="flex-1 bg-white dark:bg-zinc-900 border border-orange-200 dark:border-orange-900/50 hover:bg-orange-50 dark:hover:bg-orange-900/20 text-orange-600 dark:text-orange-400 py-4 rounded-2xl font-bold flex flex-col items-center justify-center group transition-colors shadow-sm"
        >
          <RefreshCw className="w-6 h-6 mb-1 group-hover:scale-110 transition-transform" />
          <span>Hard</span>
          <span className="text-xs font-normal opacity-70 mt-1">10 min</span>
        </button>

        <button 
          onClick={() => handleNext('easy')}
          className="flex-1 bg-white dark:bg-zinc-900 border border-green-200 dark:border-green-900/50 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 py-4 rounded-2xl font-bold flex flex-col items-center justify-center group transition-colors shadow-sm"
        >
          <Check className="w-6 h-6 mb-1 group-hover:scale-110 transition-transform" />
          <span>Easy</span>
          <span className="text-xs font-normal opacity-70 mt-1">4 days</span>
        </button>
      </div>

    </div>
  )
}
