import { createClient } from '@/lib/supabase/server'
import {
  FolderKanban,
  Users,
  CalendarDays,
  MapPin,
  BookOpen,
  Megaphone,
  ShieldAlert,
  ArrowRight,
  Building2,
} from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Campus Hub | NexusLearn AI' }

const campusModules = [
  {
    name: 'Project Hub',
    description: 'Collaborate on group projects, assign tasks, and track progress together.',
    icon: FolderKanban,
    href: '/projects',
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'hover:border-blue-500',
  },
  {
    name: 'Study Groups',
    description: 'Find and join study groups matched to your interests and courses.',
    icon: Users,
    href: '/groups',
    color: 'text-green-500',
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'hover:border-green-500',
  },
  {
    name: 'Campus Events',
    description: 'Discover workshops, seminars, hackathons, and social events on campus.',
    icon: CalendarDays,
    href: '/events',
    color: 'text-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'hover:border-purple-500',
  },
  {
    name: 'Campus Map',
    description: 'Navigate buildings, libraries, labs, and cafeterias with an interactive map.',
    icon: MapPin,
    href: '/campus-map',
    color: 'text-orange-500',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    border: 'hover:border-orange-500',
  },
  {
    name: 'Resources',
    description: 'Share and discover study materials, notes, and past papers from peers.',
    icon: BookOpen,
    href: '/resources',
    color: 'text-teal-500',
    bg: 'bg-teal-50 dark:bg-teal-900/20',
    border: 'hover:border-teal-500',
  },
  {
    name: 'Noticeboard',
    description: 'Post and browse campus notices, announcements, and lost & found items.',
    icon: Megaphone,
    href: '/campus#noticeboard',
    color: 'text-yellow-500',
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'hover:border-yellow-500',
  },
  {
    name: 'Safety Alerts',
    description: 'Stay informed with real-time campus safety notifications and advisories.',
    icon: ShieldAlert,
    href: '/campus#safety',
    color: 'text-red-500',
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'hover:border-red-500',
  },
]

export default async function CampusPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch quick stats
  const { count: projectCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('created_by', user?.id)

  const { count: groupCount } = await supabase
    .from('study_group_members')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user?.id)

  const { count: upcomingEventsCount } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .gte('event_date', new Date().toISOString())

  const stats = [
    { label: 'My Projects', value: projectCount || 0 },
    { label: 'My Groups', value: groupCount || 0 },
    { label: 'Upcoming Events', value: upcomingEventsCount || 0 },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
            <Building2 className="h-5 w-5 text-indigo-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Campus Hub</h1>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Your central hub for campus life — collaborate, connect, and stay informed.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Module Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {campusModules.map((mod) => (
          <Link
            key={mod.name}
            href={mod.href}
            className={`group flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 ${mod.border}`}
          >
            <div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${mod.bg}`}>
                <mod.icon className={`h-6 w-6 ${mod.color}`} />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                {mod.name}
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{mod.description}</p>
            </div>
            <div className="mt-4 flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400">
              <span>Open</span>
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>

      {/* Noticeboard Section */}
      <section id="noticeboard">
        <NoticeboardSection />
      </section>

      {/* Safety Alerts Section */}
      <section id="safety">
        <SafetySection />
      </section>
    </div>
  )
}

async function NoticeboardSection() {
  const supabase = await createClient()

  const { data: notices } = await supabase
    .from('digital_noticeboard')
    .select('*, profiles(full_name)')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-zinc-800 px-6 py-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
          <Megaphone className="mr-2 h-5 w-5 text-yellow-500" />
          Recent Notices
        </h2>
      </div>
      <div className="p-6">
        {notices && notices.length > 0 ? (
          <div className="space-y-4">
            {notices.map((notice: any) => (
              <div
                key={notice.id}
                className="flex items-start space-x-4 rounded-lg border border-gray-100 p-4 dark:border-zinc-800"
              >
                <div
                  className={`mt-1 h-2 w-2 shrink-0 rounded-full ${notice.type === 'lost_found' ? 'bg-orange-400' : 'bg-blue-400'}`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {notice.title}
                    </p>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${notice.type === 'lost_found' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}
                    >
                      {notice.type === 'lost_found' ? 'Lost & Found' : 'Notice'}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                    {notice.message}
                  </p>
                  <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                    {notice.profiles?.full_name || 'Anonymous'} ·{' '}
                    {new Date(notice.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Megaphone className="mx-auto h-10 w-10 text-gray-300 dark:text-zinc-600" />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              No notices posted yet. Be the first to share something!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

async function SafetySection() {
  const supabase = await createClient()

  const { data: alerts } = await supabase
    .from('safety_alerts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(3)

  const severityStyles: Record<string, { bg: string; text: string; icon: string }> = {
    emergency: {
      bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/40',
      text: 'text-red-700 dark:text-red-400',
      icon: 'text-red-500',
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-900/40',
      text: 'text-yellow-700 dark:text-yellow-400',
      icon: 'text-yellow-500',
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/40',
      text: 'text-blue-700 dark:text-blue-400',
      icon: 'text-blue-500',
    },
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-zinc-800 px-6 py-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
          <ShieldAlert className="mr-2 h-5 w-5 text-red-500" />
          Safety Alerts
        </h2>
      </div>
      <div className="p-6">
        {alerts && alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map((alert: any) => {
              const style = severityStyles[alert.type] || severityStyles.info
              return (
                <div
                  key={alert.id}
                  className={`rounded-lg border p-4 ${style.bg}`}
                >
                  <div className="flex items-center space-x-2">
                    <ShieldAlert className={`h-4 w-4 ${style.icon}`} />
                    <span className={`text-xs font-bold uppercase ${style.text}`}>
                      {alert.type}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(alert.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className={`mt-1 font-semibold ${style.text}`}>{alert.title}</p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{alert.message}</p>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <ShieldAlert className="mx-auto h-10 w-10 text-green-400" />
            <p className="mt-2 text-sm font-medium text-green-600 dark:text-green-400">
              All clear — no active safety alerts.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
