'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  Calendar, 
  BarChart, 
  FileText, 
  Search, 
  Briefcase, 
  Users, 
  Wallet, 
  Heart,
  Camera,
  Youtube,
  Layers,
  Award,
  Mic,
  CalendarDays,
  Map,
  Globe2
} from 'lucide-react'

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Study Hub', href: '/study', icon: BookOpen },
  { name: 'Note Summarizer', href: '/study/summarizer', icon: BookOpen },
  { name: 'AI Tutor', href: '/tutor', icon: GraduationCap },
  { name: 'Voice Partner', href: '/voice-partner', icon: Mic },
  { name: 'Doubt Solver', href: '/doubt-solver', icon: Camera },
  { name: 'Scholarships', href: '/scholarships', icon: Award },
  { name: 'Internships', href: '/internships', icon: Briefcase },
  { name: 'YouTube AI', href: '/youtube-processor', icon: Youtube },
  { name: 'Planner', href: '/planner', icon: Calendar },
  { name: 'Syllabus Planner', href: '/planner/generator', icon: Calendar },
  { name: 'Flashcards', href: '/practice/flashcards', icon: Layers },
  { name: 'PYQ Analyzer', href: '/pyq', icon: BarChart },
  { name: 'Analytics', href: '/analytics', icon: BarChart },
  { name: 'Exams Overview', href: '/exams', icon: FileText },
  { name: 'Exam Generator', href: '/exams/generator', icon: FileText },
  { name: 'Research', href: '/research', icon: Search },
  { name: 'Finance Coach', href: '/finance', icon: Wallet },
  { name: 'Campus Events', href: '/events', icon: CalendarDays },
  { name: 'Campus Map', href: '/campus-map', icon: Map },
  { name: 'Wellbeing', href: '/wellbeing', icon: Heart },
  { name: 'Language Tutor', href: '/language', icon: Globe2 },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 glass-panel pt-20 transition-transform sm:translate-x-0 border-r border-gray-200/50 dark:border-zinc-800/50 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl">
      <div className="h-full overflow-y-auto px-4 pb-4 custom-scrollbar">
        <ul className="space-y-1.5 font-medium mt-4">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`group flex items-center rounded-xl px-3 py-2.5 transition-all duration-300 ease-in-out relative overflow-hidden ${
                    isActive 
                      ? 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-700 dark:from-indigo-500/20 dark:to-purple-500/20 dark:text-indigo-300 shadow-sm border border-indigo-200/50 dark:border-indigo-800/50' 
                      : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-zinc-800/80 dark:hover:text-gray-100 hover:scale-[1.02] border border-transparent'
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-r-full" />
                  )}
                  <item.icon className={`h-5 w-5 transition-all duration-300 ${
                    isActive 
                      ? 'text-indigo-600 dark:text-indigo-400 scale-110' 
                      : 'text-gray-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400'
                  }`} />
                  <span className="ml-3 font-semibold tracking-wide text-sm">{item.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </aside>
  )
}
