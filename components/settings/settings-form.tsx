'use client'

import { useState } from 'react'
import { Save, Loader2, Download } from 'lucide-react'
import { updateSettings } from '@/actions/wellbeing'

interface SettingsFormProps {
  initialData: {
    emailNotifications: boolean
    pushNotifications: boolean
    studyReminders: boolean
    weeklyDigest: boolean
    aiModel: string
  }
}

function ToggleSwitch({
  name,
  label,
  description,
  defaultChecked,
}: {
  name: string
  label: string
  description: string
  defaultChecked: boolean
}) {
  const [checked, setChecked] = useState(defaultChecked)

  return (
    <div className="flex items-center justify-between py-4">
      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">{label}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="sr-only peer"
        />
        <div
          onClick={() => setChecked(!checked)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
            checked ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-zinc-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
              checked ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </div>
      </label>
    </div>
  )
}

export function SettingsForm({ initialData }: SettingsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    setMessage(null)

    const result = await updateSettings(formData)

    if (result?.error) {
      setMessage({ type: 'error', text: result.error })
    } else {
      setMessage({ type: 'success', text: 'Settings saved successfully!' })
    }

    setIsSubmitting(false)
  }

  async function handleExport() {
    setIsExporting(true)
    // Simulate data export
    await new Promise((resolve) => setTimeout(resolve, 2000))
    const blob = new Blob(
      [JSON.stringify({ exported_at: new Date().toISOString(), message: 'Your data export is ready.' }, null, 2)],
      { type: 'application/json' }
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `nexuslearn-data-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setIsExporting(false)
  }

  return (
    <form action={handleSubmit} className="space-y-8">
      {/* Notification Preferences */}
      <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Notifications</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Manage how you receive updates and reminders.</p>
        <div className="divide-y divide-gray-100 dark:divide-zinc-800">
          <ToggleSwitch
            name="email_notifications"
            label="Email Notifications"
            description="Receive study summaries and updates via email"
            defaultChecked={initialData.emailNotifications}
          />
          <ToggleSwitch
            name="push_notifications"
            label="Push Notifications"
            description="Browser push notifications for reminders"
            defaultChecked={initialData.pushNotifications}
          />
          <ToggleSwitch
            name="study_reminders"
            label="Study Reminders"
            description="Daily reminders to maintain your study streak"
            defaultChecked={initialData.studyReminders}
          />
          <ToggleSwitch
            name="weekly_digest"
            label="Weekly Digest"
            description="Weekly summary of your learning progress"
            defaultChecked={initialData.weeklyDigest}
          />
        </div>
      </div>

      {/* AI Model Preferences */}
      <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">AI Preferences</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Configure how AI assists your learning.</p>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Preferred AI Model
          </label>
          <select
            name="ai_model"
            defaultValue={initialData.aiModel}
            className="w-full max-w-xs rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="llama-4-scout">Llama 4 Scout (Default)</option>
            <option value="llama-4-maverick">Llama 4 Maverick</option>
            <option value="deepseek-r1-distill-llama-70b">DeepSeek R1 70B</option>
          </select>
        </div>
      </div>

      {/* Data & Privacy */}
      <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Data & Privacy</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Export your data or manage your account.</p>

        <div className="space-y-4">
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {isExporting ? 'Exporting...' : 'Export My Data'}
          </button>

          <div className="pt-4 border-t border-gray-100 dark:border-zinc-800">
            <h3 className="text-sm font-medium text-red-600 dark:text-red-400">Danger Zone</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-3">
              Once you delete your account, there is no going back.
            </p>
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isSubmitting ? 'Saving...' : 'Save Settings'}
        </button>
        {message && (
          <p className={`text-sm font-medium ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {message.text}
          </p>
        )}
      </div>
    </form>
  )
}
