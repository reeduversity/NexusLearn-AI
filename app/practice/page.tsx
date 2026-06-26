import { createClient } from '@/lib/supabase/server'
import { PracticeClient } from '@/components/practice/practice-client'
import Link from 'next/link'
import { ArrowLeft, Dumbbell } from 'lucide-react'

export const metadata = { title: 'Practice Engine | NexusLearn AI' }

export default async function PracticeEnginePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-gray-500">Please sign in to access the Practice Engine.</p>
      </div>
    )
  }

  // Fetch practice sessions/attempts for the user
  const { data: attempts } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Map to PracticeSession structure
  const practiceSessions = (attempts || []).map((a) => ({
    id: a.id,
    topic: a.topic,
    total_questions: 3, // mock size
    score: a.score,
    status: 'completed',
    created_at: a.created_at
  }))

  return (
    <div className="space-y-6">
      {/* Header Link */}
      <div>
        <Link
          href="/exams"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-2"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Exams Hub
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
          <Dumbbell className="mr-3 h-8 w-8 text-emerald-500" />
          Practice Engine
        </h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Topic-wise practice sessions with adaptive difficulty and progress tracking.
        </p>
      </div>

      <PracticeClient initialSessions={practiceSessions} userId={user.id} />
    </div>
  )
}
