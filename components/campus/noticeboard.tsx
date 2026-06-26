import { createClient } from '@/lib/supabase/server'
import {
  Megaphone,
  Plus,
  Search as SearchIcon,
  Clock,
  User,
  Tag,
  AlertCircle,
} from 'lucide-react'

interface NoticeboardProps {
  activeTab?: 'notice' | 'lost_found'
}

export default async function Noticeboard({ activeTab = 'notice' }: NoticeboardProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch notices
  const { data: notices } = await supabase
    .from('digital_noticeboard')
    .select('*, profiles(full_name, avatar_url)')
    .eq('type', 'notice')
    .order('created_at', { ascending: false })
    .limit(20)

  // Fetch lost & found
  const { data: lostFound } = await supabase
    .from('digital_noticeboard')
    .select('*, profiles(full_name, avatar_url)')
    .eq('type', 'lost_found')
    .order('created_at', { ascending: false })
    .limit(20)

  const tabs = [
    {
      id: 'notice' as const,
      label: 'Notices',
      count: (notices || []).length,
      items: notices || [],
    },
    {
      id: 'lost_found' as const,
      label: 'Lost & Found',
      count: (lostFound || []).length,
      items: lostFound || [],
    },
  ]

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-zinc-800 px-6 py-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
          <Megaphone className="mr-2 h-5 w-5 text-yellow-500" />
          Digital Noticeboard
        </h2>
        <button className="inline-flex items-center rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
          <Plus className="mr-1.5 h-4 w-4" />
          Post New
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-zinc-800">
        <div className="flex px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`relative px-4 py-3 text-sm font-medium transition-colors ${
                tab.id === activeTab
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <span className="flex items-center">
                {tab.label}
                <span
                  className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${
                    tab.id === activeTab
                      ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                      : 'bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-gray-400'
                  }`}
                >
                  {tab.count}
                </span>
              </span>
              {tab.id === activeTab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {tabs
          .filter((tab) => tab.id === activeTab)
          .map((tab) => (
            <div key={tab.id}>
              {tab.items.length > 0 ? (
                <div className="space-y-4">
                  {tab.items.map((item: any) => (
                    <div
                      key={item.id}
                      className="rounded-lg border border-gray-100 bg-gray-50 p-4 transition-colors hover:bg-gray-100 dark:border-zinc-800 dark:bg-zinc-800/50 dark:hover:bg-zinc-800"
                    >
                      {/* Item Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                              {item.title}
                            </h3>
                            <span
                              className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                                item.type === 'lost_found'
                                  ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                              }`}
                            >
                              {item.type === 'lost_found' ? 'Lost & Found' : 'Notice'}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                            {item.message}
                          </p>
                        </div>
                      </div>

                      {/* Item Footer */}
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-gray-400 dark:text-gray-500">
                          <div className="flex items-center">
                            <User className="mr-1 h-3 w-3" />
                            <span>{item.profiles?.full_name || 'Anonymous'}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            <span>
                              {new Date(item.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                        {item.user_id === user?.id && (
                          <span className="rounded bg-gray-200 px-2 py-0.5 text-xs text-gray-500 dark:bg-zinc-700 dark:text-gray-400">
                            Your post
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  {tab.id === 'notice' ? (
                    <>
                      <Megaphone className="mx-auto h-10 w-10 text-gray-300 dark:text-zinc-600" />
                      <h3 className="mt-3 text-sm font-medium text-gray-900 dark:text-white">
                        No notices yet
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Be the first to post a notice for the campus community.
                      </p>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="mx-auto h-10 w-10 text-gray-300 dark:text-zinc-600" />
                      <h3 className="mt-3 text-sm font-medium text-gray-900 dark:text-white">
                        No lost & found items
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Post here if you&apos;ve lost or found something on campus.
                      </p>
                    </>
                  )}
                  <button className="mt-4 inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
                    <Plus className="mr-2 h-4 w-4" />
                    Post New
                  </button>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  )
}
