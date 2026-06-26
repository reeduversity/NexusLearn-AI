'use client'

import React, { useState } from 'react'
import { Wallet, PieChart, TrendingUp, AlertTriangle, Lightbulb, DollarSign, Plus, Trash2, Loader2 } from 'lucide-react'
import clsx from 'clsx'

type Expense = {
  id: number
  category: string
  amount: number
}

const CATEGORIES = ["Food & Dining", "Rent & Utilities", "Transportation", "Entertainment", "Textbooks & Supplies", "Shopping", "Other"]

export default function FinanceCoachPage() {
  const [income, setIncome] = useState<number>(0)
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: Date.now(), category: "Food & Dining", amount: 0 }
  ])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const addExpenseRow = () => {
    setExpenses([...expenses, { id: Date.now(), category: "Other", amount: 0 }])
  }

  const removeExpenseRow = (id: number) => {
    setExpenses(expenses.filter(e => e.id !== id))
  }

  const updateExpense = (id: number, field: keyof Expense, value: any) => {
    setExpenses(expenses.map(e => e.id === id ? { ...e, [field]: value } : e))
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0)
  const balance = (income || 0) - totalExpenses

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!income || expenses.length === 0) return

    setIsAnalyzing(true)
    setError(null)
    setAnalysis(null)

    try {
      const response = await fetch('/api/finance/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          income: Number(income),
          expenses: expenses.map(e => ({ category: e.category, amount: Number(e.amount) })).filter(e => e.amount > 0)
        })
      })

      const json = await response.json()

      if (!response.ok) {
        throw new Error(json.error || 'Failed to analyze budget')
      }

      setAnalysis(json.data)
    } catch (err: any) {
      setError(err.message || 'An error occurred during analysis.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 space-y-8 animate-in fade-in zoom-in duration-500">
      
      {/* Header section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center justify-center p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl mb-2 shadow-sm">
          <Wallet className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-600">
          AI Finance Coach
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Track your student budget, identify wasteful spending, and let AI build a personalized savings plan for you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Section */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-gray-100 dark:border-zinc-800 shadow-xl">
            <h2 className="text-xl font-bold flex items-center space-x-2 mb-6 text-gray-800 dark:text-gray-100">
              <PieChart className="w-5 h-5 text-emerald-500" />
              <span>Income & Expenses</span>
            </h2>

            <form onSubmit={handleAnalyze} className="space-y-6">
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Monthly Income / Allowance ($)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 1500"
                    value={income || ''}
                    onChange={(e) => setIncome(Number(e.target.value))}
                    className="w-full rounded-2xl border border-gray-200 dark:border-zinc-700 pl-10 pr-4 py-4 text-sm bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-semibold"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Monthly Expenses
                  </label>
                  <button type="button" onClick={addExpenseRow} className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center">
                    <Plus className="w-3 h-3 mr-1" /> Add Row
                  </button>
                </div>
                
                <div className="space-y-3">
                  {expenses.map((expense) => (
                    <div key={expense.id} className="flex items-center gap-2">
                      <select 
                        value={expense.category}
                        onChange={(e) => updateExpense(expense.id, 'category', e.target.value)}
                        className="flex-1 rounded-xl border border-gray-200 dark:border-zinc-700 p-3 text-sm bg-white dark:bg-zinc-800 outline-none"
                      >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <div className="relative w-32 shrink-0">
                        <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="number"
                          min="0"
                          value={expense.amount || ''}
                          onChange={(e) => updateExpense(expense.id, 'amount', Number(e.target.value))}
                          placeholder="Amount"
                          className="w-full rounded-xl border border-gray-200 dark:border-zinc-700 pl-7 pr-3 py-3 text-sm bg-white dark:bg-zinc-800 outline-none"
                        />
                      </div>
                      {expenses.length > 1 && (
                        <button type="button" onClick={() => removeExpenseRow(expense.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-gray-100 dark:border-zinc-700 flex justify-between items-center">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Balance</span>
                <span className={clsx("font-black text-xl", balance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>
                  ${balance}
                </span>
              </div>

              <button
                type="submit"
                disabled={!income || expenses.length === 0 || isAnalyzing}
                className="w-full flex items-center justify-center py-4 px-6 rounded-2xl text-white font-semibold text-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/30 hover:-translate-y-1 disabled:opacity-50 transition-all duration-300"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                    Analyzing Budget...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-6 h-6 mr-3" />
                    Get AI Strategy
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
        <div className="lg:col-span-7">
          <div className={clsx(
            "bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-xl overflow-hidden transition-all duration-700 h-full min-h-[500px]",
            analysis ? "opacity-100 translate-y-0" : "opacity-50 translate-y-4"
          )}>
            
            <div className="p-6 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/50 flex items-center">
              <Lightbulb className="w-6 h-6 text-emerald-500 mr-3" />
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                AI Budget Strategy
              </h2>
            </div>
            
            <div className="p-6">
              {!analysis && !isAnalyzing && (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 space-y-4 min-h-[300px]">
                  <Wallet className="w-16 h-16 opacity-30" />
                  <p className="text-lg">Enter your finances to generate a smart saving strategy.</p>
                </div>
              )}

              {isAnalyzing && (
                <div className="h-full flex flex-col items-center justify-center text-emerald-500 space-y-4 min-h-[300px]">
                  <Loader2 className="w-12 h-12 animate-spin" />
                  <p className="animate-pulse font-medium text-lg">AI is evaluating your spending habits...</p>
                </div>
              )}

              {analysis && (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                  
                  {/* Score & Summary */}
                  <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="shrink-0 relative flex items-center justify-center">
                      <svg className="w-32 h-32 transform -rotate-90">
                        <circle cx="64" cy="64" r="56" fill="transparent" stroke="currentColor" strokeWidth="12" className="text-gray-100 dark:text-zinc-800" />
                        <circle cx="64" cy="64" r="56" fill="transparent" stroke="currentColor" strokeWidth="12" strokeDasharray={56 * 2 * Math.PI} strokeDashoffset={(56 * 2 * Math.PI) * (1 - analysis.health_score / 100)} className={clsx("transition-all duration-1000", analysis.health_score >= 70 ? "text-emerald-500" : analysis.health_score >= 40 ? "text-amber-500" : "text-red-500")} />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black text-gray-900 dark:text-white">{analysis.health_score}</span>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Score</span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Financial Health</h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{analysis.summary}</p>
                    </div>
                  </div>

                  {/* Savings Potential */}
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-emerald-800 dark:text-emerald-300 mb-1">Monthly Savings Potential</h4>
                      <p className="text-sm text-emerald-600 dark:text-emerald-400">If you follow the advice below, you could save approximately:</p>
                    </div>
                    <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                      ${analysis.savings_potential}
                    </div>
                  </div>

                  {/* Actionable Advice */}
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                      <TrendingUp className="w-5 h-5 text-emerald-500 mr-2" />
                      Action Plan
                    </h4>
                    <ul className="space-y-3">
                      {analysis.advice.map((tip: string, i: number) => (
                        <li key={i} className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-100 dark:border-zinc-700/50 flex gap-3">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 font-bold text-sm shrink-0">
                            {i + 1}
                          </span>
                          <span className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{tip}</span>
                        </li>
                      ))}
                    </ul>
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
