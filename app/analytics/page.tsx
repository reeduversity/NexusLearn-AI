import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-helpers'
import { Activity, Target, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react'

export const metadata = { title: 'Analytics Engine | NexusLearn AI' }

export default async function AnalyticsPage() {
  const user = await getCurrentUser()

  // Fetch Weaknesses
  const weaknesses = user ? await prisma.weakness.findMany({
    where: { userId: user.id },
    orderBy: { currentStrength: 'asc' },
  }) : []

  // Mocking heatmap data for rendering demonstration
  const heatmapData = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    level: Math.floor(Math.random() * 4) // 0-3 intensity
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Performance Analytics</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">Track your strengths, identify weaknesses, and view your study consistency.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Weakness Engine */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
            Topic Strength Meter (Weaknesses)
          </h2>
          <div className="space-y-4">
            {weaknesses && weaknesses.length > 0 ? (
              weaknesses.map(weakness => (
                <div key={weakness.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{weakness.topic}</span>
                    <span className="text-gray-500">{Math.round(weakness.currentStrength)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-zinc-800 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${weakness.currentStrength < 40 ? 'bg-red-500' : 'bg-orange-400'}`} 
                      style={{ width: `${weakness.currentStrength}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 border border-dashed border-gray-200 dark:border-zinc-800 rounded-lg">
                <ShieldCheck className="mx-auto h-8 w-8 text-green-500 mb-2" />
                <p className="text-sm text-gray-500">No weaknesses detected yet! Keep practicing.</p>
              </div>
            )}
          </div>
        </div>

        {/* Revision Heatmap */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <Activity className="mr-2 h-5 w-5 text-indigo-500" />
            30-Day Study Heatmap
          </h2>
          <div className="grid grid-cols-7 gap-2">
            {heatmapData.map((data, idx) => (
              <div 
                key={idx} 
                title={data.date}
                className={`aspect-square rounded-md ${
                  data.level === 0 ? 'bg-gray-100 dark:bg-zinc-800' :
                  data.level === 1 ? 'bg-indigo-200 dark:bg-indigo-900/40' :
                  data.level === 2 ? 'bg-indigo-400 dark:bg-indigo-700/60' :
                  'bg-indigo-600 dark:bg-indigo-500'
                }`}
              ></div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-end text-xs text-gray-500 space-x-2">
            <span>Less</span>
            <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-zinc-800"></div>
            <div className="w-3 h-3 rounded-sm bg-indigo-200 dark:bg-indigo-900/40"></div>
            <div className="w-3 h-3 rounded-sm bg-indigo-400 dark:bg-indigo-700/60"></div>
            <div className="w-3 h-3 rounded-sm bg-indigo-600 dark:bg-indigo-500"></div>
            <span>More</span>
          </div>
        </div>

        {/* Exam Probability Predictor */}
        <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <Target className="mr-2 h-5 w-5 text-green-500" />
            Exam Probability Predictor
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-900/30">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-400">Data Structures & Algorithms Final</h3>
              <p className="text-sm text-green-600 dark:text-green-500 mt-1">Based on PYQ completion and Quiz accuracy.</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-green-700 dark:text-green-400">Predicted Score</p>
                <p className="text-4xl font-black text-green-600 dark:text-green-500">82%</p>
              </div>
              <TrendingUp className="h-10 w-10 text-green-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
