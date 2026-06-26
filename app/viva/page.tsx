import { createClient } from '@/lib/supabase/server'
import { VivaClient } from '@/components/viva/viva-client'
import Link from 'next/link'
import { ArrowLeft, Mic } from 'lucide-react'

export const metadata = { title: 'Viva Mode | NexusLearn AI' }

export default async function VivaModePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-gray-500">Please sign in to access Viva practice.</p>
      </div>
    )
  }

  // Fetch past sessions
  const { data: sessions } = await supabase
    .from('viva_sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      {/* Header Back Link */}
      <div>
        <Link
          href="/exams"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-2"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Exams Hub
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
          <Mic className="mr-3 h-8 w-8 text-rose-500" />
          Viva Mode
        </h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          AI-powered viva practice — select a topic and face real exam-style questions.
        </p>
      </div>

      <VivaClient initialSessions={sessions || []} userId={user.id} />
    </div>
  )
}
