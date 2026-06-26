import { createClient } from '@/lib/supabase/server'
import { MockTestsClient } from '@/components/mock-tests/mock-tests-client'
import Link from 'next/link'
import { ArrowLeft, ClipboardList } from 'lucide-react'

export const metadata = { title: 'Mock Tests | NexusLearn AI' }

export default async function MockTestsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-gray-500">Please sign in to take mock exams.</p>
      </div>
    )
  }

  // Fetch all mock tests for the user
  const { data: mockTests } = await supabase
    .from('mock_tests')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <div>
        <Link
          href="/exams"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-2"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Exams Hub
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
          <ClipboardList className="mr-3 h-8 w-8 text-purple-500" />
          Mock Tests
        </h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          AI-generated mock exams based on predicted topics and your learning gaps.
        </p>
      </div>

      <MockTestsClient initialTests={mockTests || []} userId={user.id} />
    </div>
  )
}
