import { createClient } from '@/lib/supabase/server'
import { StatCard } from '@/components/dashboard/stat-card'
import { BookOpen, Target, Flame, Timer, AlertCircle, FileText, Calendar, Sparkles, ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'Dashboard | NexusLearn AI',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // 1. Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  const userName = user?.user_metadata?.full_name?.split(' ')[0] || 'Student'

  // Fetch real data from DB without hardcoded fallbacks
  const [
    { count: pendingAssignments },
    { data: recentNotes },
    { data: upcomingExams },
    { count: materialsCount },
    { data: profileData }
  ] = await Promise.all([
    supabase.from('assignments').select('*', { count: 'exact', head: true }).eq('user_id', user?.id).eq('status', 'pending'),
    supabase.from('notes').select('id, title, created_at').eq('user_id', user?.id).order('created_at', { ascending: false }).limit(3),
    supabase.from('exam_predictions').select('id, title, exam_date').eq('user_id', user?.id).gte('exam_date', new Date().toISOString()).order('exam_date', { ascending: true }).limit(2),
    supabase.from('materials').select('*', { count: 'exact', head: true }).eq('user_id', user?.id),
    supabase.from('profiles').select('study_streak, focus_time_minutes').eq('id', user?.id).single()
  ])

  // Process dynamic analytics from database
  const studyStreak = profileData?.study_streak || 0
  const totalFocusMinutes = profileData?.focus_time_minutes || 0
  const focusTimeHours = Math.floor(totalFocusMinutes / 60)
  const focusTimeMins = totalFocusMinutes % 60
  const focusTime = `${focusTimeHours}h ${focusTimeMins}m`

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-sm font-semibold mb-3 border border-indigo-100 dark:border-indigo-500/20">
            <Sparkles className="w-4 h-4" />
            <span>AI Copilot Active</span>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">{userName}</span> 👋
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400 text-lg">
            Here's what's happening with your studies today.
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all duration-300 hover:scale-105 hover:shadow-indigo-500/50">
            <span className="relative flex items-center gap-2">
              <Timer className="w-5 h-5" />
              Start Focus Session
            </span>
          </button>
        </div>
      </div>

      {/* Top Stats Layer */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Study Streak" value={`${studyStreak} days`} icon={Flame} description="You're on fire! Keep it up." trend={{ value: 12, isPositive: true }} />
        <StatCard title="Pending Tasks" value={pendingAssignments || 0} icon={Target} description="Assignments due this week" />
        <StatCard title="Focus Time" value={focusTime} icon={Timer} description="Total focus time this week" />
        <StatCard title="Materials Studied" value={materialsCount || 0} icon={BookOpen} description="Documents analyzed by AI" />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Left Column - Priority */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 sm:p-8 rounded-2xl relative overflow-hidden group hover:border-red-200 dark:hover:border-red-900/50 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/10 transition-colors"></div>
            <div className="flex items-center justify-between mb-6 relative z-10">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                Weak Topics to Revise
              </h2>
              <button className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 group/btn">
                View All Analytics <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
            <div className="space-y-4 relative z-10">
              {/* Fallback Empty State */}
              <div className="p-5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-900/50 dark:to-zinc-800/50 border border-gray-200/50 dark:border-zinc-700/50 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center shadow-sm mb-3">
                  <Target className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">No Weak Topics Identified</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm">Your AI engine is currently analyzing your quizzes to determine weak areas. Take a quiz to generate insights!</p>
                <button className="mt-4 px-4 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors shadow-sm">
                  Take a Mock Test
                </button>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 sm:p-8 rounded-2xl relative overflow-hidden group hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-colors">
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors"></div>
            <div className="flex items-center justify-between mb-6 relative z-10">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                  <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                Recent AI Summaries
              </h2>
            </div>
            <div className="space-y-3 relative z-10">
              {recentNotes && recentNotes.length > 0 ? (
                recentNotes.map(note => (
                  <div key={note.id} className="flex justify-between items-center p-4 bg-white/50 dark:bg-zinc-900/50 hover:bg-white dark:hover:bg-zinc-800 rounded-xl cursor-pointer transition-all duration-300 border border-gray-100 dark:border-zinc-800/50 hover:shadow-md hover:scale-[1.01] group/item">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-500">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-gray-100 group-hover/item:text-indigo-600 dark:group-hover/item:text-indigo-400 transition-colors">{note.title}</span>
                    </div>
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full">{new Date(note.created_at).toLocaleDateString()}</span>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-gray-500 italic bg-gray-50/50 dark:bg-zinc-900/30 rounded-xl border border-dashed border-gray-200 dark:border-zinc-800">No notes generated yet. Upload a PDF to start!</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Secondary */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
              <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              Upcoming Exams
            </h2>
            <div className="space-y-3">
              {upcomingExams && upcomingExams.length > 0 ? (
                upcomingExams.map(exam => (
                  <div key={exam.id} className="p-4 bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/20 dark:to-zinc-900/50 rounded-xl border border-orange-100 dark:border-orange-900/30 shadow-sm relative overflow-hidden group/card hover:shadow-md transition-all">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-400"></div>
                    <p className="font-bold text-gray-900 dark:text-gray-100">{exam.title}</p>
                    <p className="text-xs font-medium text-orange-600 dark:text-orange-500 mt-1.5 flex items-center gap-1">
                      <Timer className="w-3 h-3" />
                      {new Date(exam.exam_date).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4 bg-gray-50/50 dark:bg-zinc-900/30 rounded-xl border border-dashed border-gray-200 dark:border-zinc-800">No upcoming exams scheduled.</p>
              )}
            </div>
          </div>
          
          <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 p-6 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
            {/* Abstract Background Shapes */}
            <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            
            <div className="absolute top-0 right-0 p-4 opacity-20 transform group-hover:rotate-12 transition-transform duration-500">
              <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-bold mb-4 uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5" /> Challenge
              </div>
              <h2 className="text-xl font-extrabold mb-2 text-white">Daily AI Challenge</h2>
              <p className="text-sm text-indigo-100 mb-6 leading-relaxed">Complete 5 Physics flashcards to maintain your learning streak and unlock a badge.</p>
              <button className="w-full py-3 bg-white text-indigo-700 font-bold rounded-xl hover:bg-gray-50 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group/btn">
                Accept Challenge
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  )
}
