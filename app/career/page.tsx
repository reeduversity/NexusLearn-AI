import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  FileText,
  ScanSearch,
  MessageSquare,
  GraduationCap,
  Briefcase,
  Award,
  ArrowRight,
  TrendingUp,
  Users,
} from 'lucide-react'

export const metadata = { title: 'Career Hub | NexusLearn AI' }

const careerModules = [
  {
    title: 'Resume Builder',
    description: 'Build a professional resume with AI-powered suggestions and real-time preview.',
    icon: FileText,
    href: '/resume',
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    border: 'border-blue-100 dark:border-blue-900/30',
  },
  {
    title: 'ATS Analyzer',
    description: 'Scan your resume against ATS standards. Get score, keyword gaps, and improvements.',
    icon: ScanSearch,
    href: '/ats',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
    border: 'border-emerald-100 dark:border-emerald-900/30',
  },
  {
    title: 'Mock Interview',
    description: 'Practice with AI interviewer across DSA, HR, Behavioral, and Aptitude rounds.',
    icon: MessageSquare,
    href: '/career/interviews',
    color: 'text-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-950/20',
    border: 'border-purple-100 dark:border-purple-900/30',
  },
  {
    title: 'Placement Mode',
    description: 'Comprehensive placement prep with DSA practice, aptitude tests, and HR preparation.',
    icon: TrendingUp,
    href: '/placements',
    color: 'text-orange-500',
    bg: 'bg-orange-50 dark:bg-orange-950/20',
    border: 'border-orange-100 dark:border-orange-900/30',
  },
  {
    title: 'Internship Finder',
    description: 'Discover internships matched to your skills. Filter by domain, location, and duration.',
    icon: Briefcase,
    href: '/internships',
    color: 'text-cyan-500',
    bg: 'bg-cyan-50 dark:bg-cyan-950/20',
    border: 'border-cyan-100 dark:border-cyan-900/30',
  },
  {
    title: 'Scholarship Finder',
    description: 'Find scholarships you qualify for based on eligibility, amount, and deadlines.',
    icon: Award,
    href: '/scholarships',
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    border: 'border-amber-100 dark:border-amber-900/30',
  },
]

export default async function CareerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [
    { count: interviewCount },
    { count: resumeCount },
    { count: atsReportCount },
  ] = await Promise.all([
    supabase
      .from('interview_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user?.id),
    supabase
      .from('resumes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user?.id),
    supabase
      .from('ats_reports')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user?.id),
  ])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Career Hub</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Your all-in-one career toolkit — from resume building to placement prep and beyond.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
              <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{interviewCount || 0}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Mock Interviews</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{resumeCount || 0}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Resumes Created</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900/30">
              <ScanSearch className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{atsReportCount || 0}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">ATS Reports</p>
            </div>
          </div>
        </div>
      </div>

      {/* Career Module Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {careerModules.map((module) => {
          const Icon = module.icon
          return (
            <Link
              key={module.title}
              href={module.href}
              className="group rounded-xl border border-gray-200 bg-white p-6 transition-all hover:shadow-lg hover:border-gray-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
            >
              <div className={`inline-flex rounded-xl p-3 ${module.bg} border ${module.border} mb-4`}>
                <Icon className={`h-6 w-6 ${module.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {module.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                {module.description}
              </p>
              <div className="flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                Get Started
                <ArrowRight className="ml-1 h-4 w-4" />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
