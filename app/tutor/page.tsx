import { getCurrentUser } from '@/lib/auth-helpers'
import { TutorClient } from '@/components/tutor/tutor-client'

export const metadata = { title: 'AI Tutor | NexusLearn AI' }

export default async function AITutorPage() {
  const user = await getCurrentUser()

  if (!user) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-gray-500">Please sign in to access your AI Tutor.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Tutor System</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Your personal AI teachers, ready to solve your doubts 24/7.
        </p>
      </div>

      <TutorClient userId={user.id} />
    </div>
  )
}
