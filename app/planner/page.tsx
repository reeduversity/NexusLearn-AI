import { createClient } from '@/lib/supabase/server'
import { Calendar as CalendarIcon, CheckCircle, Clock, Target, ListTodo, Upload, Zap, CalendarPlus } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Digital Study Planner | NexusLearn AI' }

export default async function PlannerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: assignments } = await supabase
    .from('assignments')
    .select('*')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Calculate progress
  const totalTasks = assignments?.length || 0
  const completedTasks = assignments?.filter(t => t.status === 'completed').length || 0
  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm">
        <div>
          <div className="inline-flex items-center justify-center p-3 bg-fuchsia-100 dark:bg-fuchsia-900/30 rounded-2xl mb-4">
            <Target className="w-6 h-6 text-fuchsia-600 dark:text-fuchsia-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Digital Study Planner</h1>
          <p className="mt-2 text-lg text-gray-500 dark:text-gray-400 max-w-xl">Master your schedule. Track assignments, sync with calendar, and let AI keep you on track.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/planner/generator" className="rounded-2xl bg-gray-100 dark:bg-zinc-800 px-6 py-3 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-zinc-700 flex items-center justify-center transition-colors">
            <Upload className="mr-2 h-5 w-5" />
            Upload Syllabus
          </Link>
          <button className="rounded-2xl bg-gradient-to-r from-fuchsia-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white hover:shadow-lg hover:shadow-fuchsia-500/30 flex items-center justify-center transition-all hover:-translate-y-0.5">
            <CalendarPlus className="mr-2 h-5 w-5" />
            Sync Google Calendar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column - Assignments & Progress */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Progress Card */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h3 className="font-bold text-gray-800 dark:text-gray-200">Weekly Progress</h3>
                <p className="text-sm text-gray-500">{completedTasks} of {totalTasks} tasks completed</p>
              </div>
              <span className="text-3xl font-black text-fuchsia-500">{progressPercent}%</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-zinc-800 rounded-full h-3 mb-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-fuchsia-500 to-purple-500 h-3 rounded-full transition-all duration-1000" 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Assignment Tracker */}
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold flex items-center text-gray-900 dark:text-white">
                <ListTodo className="mr-3 h-6 w-6 text-fuchsia-500" />
                Active Assignments
              </h2>
              <button className="text-sm font-semibold text-fuchsia-600 dark:text-fuchsia-400 bg-fuchsia-50 dark:bg-fuchsia-900/20 px-4 py-2 rounded-xl hover:bg-fuchsia-100 dark:hover:bg-fuchsia-900/40 transition-colors">
                + New Task
              </button>
            </div>
            
            <div className="space-y-4">
              {assignments && assignments.length > 0 ? (
                assignments.map(task => (
                  <div key={task.id} className="group flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-700/50 rounded-2xl hover:border-fuchsia-300 dark:hover:border-fuchsia-500/50 hover:shadow-sm transition-all cursor-pointer">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <CheckCircle className={`h-6 w-6 transition-colors ${task.status === 'completed' ? 'text-green-500' : 'text-gray-300 dark:text-zinc-600 group-hover:text-fuchsia-400'}`} />
                      </div>
                      <div className="ml-4">
                        <p className={`font-semibold text-lg ${task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-800 dark:text-gray-200'}`}>
                          {task.title}
                        </p>
                        <div className="flex items-center mt-1 space-x-3">
                          <span className={clsx(
                            "text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider",
                            task.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                            task.priority === 'low' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          )}>
                            {task.priority || 'medium'}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center">
                            <Clock className="w-3 h-3 mr-1" /> Today
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-gray-50 dark:bg-zinc-800/30 rounded-2xl border-2 border-dashed border-gray-200 dark:border-zinc-700">
                  <ListTodo className="mx-auto h-12 w-12 text-gray-300 dark:text-zinc-600 mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">No pending assignments.</p>
                  <Link href="/planner/generator" className="text-fuchsia-500 hover:underline mt-2 inline-block text-sm font-semibold">Generate a plan from your syllabus</Link>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column - Widgets */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Exam Countdown Widget */}
          <div className="bg-gradient-to-br from-orange-500 to-red-500 p-8 rounded-3xl shadow-lg shadow-orange-500/20 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <CalendarIcon className="w-24 h-24" />
            </div>
            <h2 className="text-lg font-semibold mb-1 opacity-90">Next Big Exam</h2>
            <p className="text-xl font-bold mb-6">Data Structures & Algorithms</p>
            <div className="flex items-baseline space-x-2">
              <span className="text-5xl font-black">14</span>
              <span className="text-lg font-medium opacity-90">Days Left</span>
            </div>
          </div>

          {/* Spaced Repetition Widget */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-2xl"></div>
            <h2 className="text-lg font-bold flex items-center text-gray-900 dark:text-white mb-2">
              <Zap className="mr-2 h-5 w-5 text-blue-500" />
              Spaced Repetition
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              You have 12 flashcards due for review today based on the SM-2 algorithm.
            </p>
            <Link href="/practice/flashcards" className="block text-center w-full rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 px-4 py-3 text-sm font-bold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
              Start Review Session
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
