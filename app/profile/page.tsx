import { createClient } from '@/lib/supabase/server'
import { ProfileForm } from '@/components/profile/profile-form'
import { User, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'My Profile | NexusLearn AI' }

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-gray-500">Please sign in to view your profile settings.</p>
      </div>
    )
  }

  // Fetch from public profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const initialData = {
    fullName: profile?.full_name || user.user_metadata?.full_name || '',
    email: user.email || '',
    university: profile?.university || user.user_metadata?.university || '',
    course: profile?.course || user.user_metadata?.course || '',
    theme: profile?.theme_preference || 'system'
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-2"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
          <User className="mr-3 h-8 w-8 text-indigo-500" />
          My Profile Settings
        </h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Customize your study details, university information, and site preferences.
        </p>
      </div>

      {/* Main Profile Form Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
        <ProfileForm initialData={initialData} />
      </div>
    </div>
  )
}
