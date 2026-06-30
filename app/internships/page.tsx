'use client'

import React, { useState } from 'react'
import { Briefcase, MapPin, Building2, Clock, Search, Loader2, Sparkles, Star, ChevronRight, BookmarkPlus } from 'lucide-react'
import clsx from 'clsx'

const MOCK_INTERNSHIPS = [
  {
    id: 1,
    role: "Software Engineering Intern",
    company: "Stripe",
    location: "Remote / San Francisco, CA",
    type: "Summer 2027",
    match: 98,
    tags: ["React", "TypeScript", "Node.js"],
    description: "Join the core payments team to build scalable APIs and beautiful dashboard interfaces."
  },
  {
    id: 2,
    role: "Frontend Developer Intern",
    company: "Vercel",
    location: "Remote",
    type: "Fall 2026",
    match: 92,
    tags: ["Next.js", "Tailwind", "Frontend"],
    description: "Help build the future of the web. Work on Next.js core features and v0 generative UI."
  },
  {
    id: 3,
    role: "Full Stack Intern",
    company: "Linear",
    location: "Remote",
    type: "Winter 2026",
    match: 85,
    tags: ["GraphQL", "React", "Design"],
    description: "Craft pixel-perfect, high-performance issue tracking tools for modern teams."
  }
]

export default function InternshipMatchmakerPage() {
  const [skills, setSkills] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<typeof MOCK_INTERNSHIPS | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!skills.trim()) return

    setIsSearching(true)
    setResults(null)

    try {
      const response = await fetch('/api/internships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills })
      })

      const json = await response.json()

      if (!response.ok) {
        throw new Error(json.error || 'Failed to find internships')
      }

      setResults(json.data)
    } catch (err: any) {
      console.error(err)
      alert(err.message || 'An error occurred.')
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 space-y-8 animate-in fade-in zoom-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm">
        <div>
          <div className="inline-flex items-center justify-center p-3 bg-cyan-100 dark:bg-cyan-900/30 rounded-2xl mb-4">
            <Briefcase className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">AI Internship Matchmaker</h1>
          <p className="mt-2 text-lg text-gray-500 dark:text-gray-400 max-w-2xl">
            Input your current skills and tech stack. Our AI will match you with the best internships and mentorships actively hiring.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Search Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm">
            <h2 className="text-xl font-bold flex items-center mb-6 text-gray-900 dark:text-white">
              <Search className="mr-2 h-5 w-5 text-cyan-500" />
              Find Opportunities
            </h2>
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Your Skills & Tech Stack
                </label>
                <textarea
                  rows={5}
                  placeholder="e.g. React, Next.js, TypeScript, Tailwind CSS, Prisma, Node.js. Looking for remote frontend roles..."
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 dark:border-zinc-700 p-4 text-sm bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                />
              </div>
              
              <button
                type="submit"
                disabled={isSearching || !skills.trim()}
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-2xl font-bold flex items-center justify-center transition-all hover:-translate-y-0.5 disabled:opacity-50 shadow-lg shadow-cyan-500/30"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Finding Matches...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Find Internships
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-8">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
            <div className="p-6 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/50 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
                <Star className="w-5 h-5 mr-2 text-cyan-500" />
                Top Matches For You
              </h2>
              {results && (
                <span className="text-sm font-semibold bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400 px-3 py-1 rounded-full">
                  {results.length} Roles Found
                </span>
              )}
            </div>

            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
              {!results && !isSearching && (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 text-center py-20">
                  <Briefcase className="w-16 h-16 opacity-30 mb-4" />
                  <p className="text-lg">Enter your skills to discover your dream internship.</p>
                </div>
              )}

              {isSearching && (
                <div className="h-full flex flex-col items-center justify-center text-cyan-500 py-20">
                  <Loader2 className="w-12 h-12 animate-spin mb-4" />
                  <p className="animate-pulse font-medium text-lg">Scanning job boards and company portals...</p>
                </div>
              )}

              {results && (
                <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                  {results.map((job) => (
                    <div key={job.id} className="group p-6 bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-700/50 rounded-2xl hover:border-cyan-300 dark:hover:border-cyan-500/50 transition-all hover:shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-start gap-4">
                      
                      <div className="w-16 h-16 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 flex items-center justify-center shrink-0 shadow-sm">
                        <Building2 className="w-8 h-8 text-gray-400" />
                      </div>

                      <div className="flex-1 pr-12">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{job.role}</h3>
                          <div className="hidden md:flex items-center bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-md text-xs font-bold">
                            {job.match}% Match
                          </div>
                        </div>
                        
                        <p className="text-sm font-semibold text-cyan-600 dark:text-cyan-400 mb-3">{job.company}</p>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4 font-medium">
                          <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {job.location}</span>
                          <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> {job.type}</span>
                        </div>

                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 leading-relaxed">
                          {job.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-2">
                          {job.tags.map((tag, i) => (
                            <span key={i} className="text-xs font-semibold px-3 py-1 bg-gray-200 text-gray-700 dark:bg-zinc-700 dark:text-gray-300 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="absolute top-6 right-6">
                        <button className="text-gray-400 hover:text-cyan-500 transition-colors">
                          <BookmarkPlus className="w-6 h-6" />
                        </button>
                      </div>

                      <div className="md:hidden mt-2 flex items-center bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-md text-sm font-bold w-max">
                        {job.match}% Match
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
