'use client'

import { useState } from 'react'
import { sendPasswordResetLink } from '@/actions/auth'

export default function ForgotPasswordPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [resetUrl, setResetUrl] = useState('')

  async function handleSubmit(formData: FormData) {
    setStatus('loading')
    setErrorMessage('')
    const res = await sendPasswordResetLink(formData)
    
    if (res?.error) {
      setErrorMessage(res.error)
      setStatus('error')
    } else {
      if (res?.resetUrl) {
        setResetUrl(res.resetUrl)
      }
      setStatus('success')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-zinc-950 p-4">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Reset Password
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>
        
        {status === 'success' ? (
          <div className="rounded-md bg-green-50 dark:bg-green-900/30 p-4">
            <div className="flex">
              <div className="ml-3 w-full">
                <h3 className="text-sm font-medium text-green-800 dark:text-green-300">Reset Link Sent</h3>
                <div className="mt-2 text-sm text-green-700 dark:text-green-400">
                  <p>Check your email for the password reset link. If you don't see it, check your spam folder.</p>
                  {resetUrl && (
                    <div className="mt-4 p-3 bg-white dark:bg-zinc-800 rounded border border-green-200 dark:border-green-800 break-all">
                      <p className="font-semibold mb-1 text-gray-900 dark:text-white">Development Link:</p>
                      <a href={resetUrl} className="text-indigo-600 dark:text-indigo-400 hover:underline">
                        {resetUrl}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" action={handleSubmit}>
            {status === 'error' && (
              <div className="text-sm text-red-500 text-center">{errorMessage}</div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="email">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                  placeholder="you@university.edu"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-50"
            >
              {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}
        
        <div className="mt-4 flex items-center justify-center gap-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Remembered your password?
          </p>
          <a href="/login" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
            Back to login
          </a>
        </div>
      </div>
    </div>
  )
}
