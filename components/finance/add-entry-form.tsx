'use client'

import { useState } from 'react'
import { Plus, DollarSign } from 'lucide-react'
import { addBudgetEntry } from '@/actions/wellbeing'

const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Books & Supplies',
  'Entertainment',
  'Housing & Rent',
  'Utilities',
  'Health',
  'Clothing',
  'Subscriptions',
  'Other',
]

const INCOME_CATEGORIES = [
  'Part-time Job',
  'Scholarship',
  'Allowance',
  'Freelance',
  'Other',
]

export function AddEntryForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    setMessage(null)

    formData.set('type', type)
    const result = await addBudgetEntry(formData)

    if (result?.error) {
      setMessage({ type: 'error', text: result.error })
    } else {
      setMessage({ type: 'success', text: 'Entry added successfully!' })
      setIsOpen(false)
      setTimeout(() => setMessage(null), 3000)
    }

    setIsSubmitting(false)
  }

  if (!isOpen) {
    return (
      <div>
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Entry
        </button>
        {message && (
          <p className={`mt-2 text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {message.text}
          </p>
        )}
      </div>
    )
  }

  return (
    <form action={handleSubmit} className="space-y-4 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-green-500" />
          New Entry
        </h3>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm"
        >
          Cancel
        </button>
      </div>

      {/* Type Toggle */}
      <div className="flex items-center gap-2 bg-gray-100 dark:bg-zinc-800 rounded-lg p-1">
        <button
          type="button"
          onClick={() => setType('expense')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
            type === 'expense'
              ? 'bg-red-500 text-white'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          Expense
        </button>
        <button
          type="button"
          onClick={() => setType('income')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
            type === 'income'
              ? 'bg-green-500 text-white'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          Income
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Amount</label>
          <input
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            placeholder="0.00"
            className="w-full rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Category</label>
          <select
            name="category"
            required
            className="w-full rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">Select...</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Description (optional)</label>
        <input
          name="description"
          type="text"
          placeholder="What was this for?"
          className="w-full rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
      >
        {isSubmitting ? 'Adding...' : `Add ${type === 'income' ? 'Income' : 'Expense'}`}
      </button>
    </form>
  )
}
