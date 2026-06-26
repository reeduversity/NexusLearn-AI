'use client'

import React, { useState } from 'react'
import { Award, Search, Filter, Loader2, Sparkles, ChevronRight, DollarSign, Calendar, ExternalLink } from 'lucide-react'
import clsx from 'clsx'

const MOCK_SCHOLARSHIPS = [
  {
    id: 1,
    title: "Women Techmakers Scholars Program",
    provider: "Google",
    amount: "$10,000",
    deadline: "Dec 15, 2026",
    match: 95,
    tags: ["Women in Tech", "Computer Science", "Merit-based"],
    description: "For female students demonstrating strong academic record and leadership in computer science."
  },
  {
    id: 2,
    title: "Generation Google Scholarship",
    provider: "Google",
    amount: "$10,000",
    deadline: "Nov 30, 2026",
    match: 88,
    tags: ["Underrepresented", "Technology"],
    description: "Helps aspiring students pursuing computer science degrees excel in technology."
  },
  {
    id: 3,
    title: "Palantir Future Scholarship",
    provider: "Palantir Technologies",
    amount: "$7,000",
    deadline: "Jan 10, 2027",
    match: 75,
    tags: ["Data Science", "Software Engineering"],
    description: "Awarded to students showcasing exceptional promise in software engineering."
  }
]

export default function ScholarshipFinderPage() {
  const [profile, setProfile] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<typeof MOCK_SCHOLARSHIPS | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile.trim()) return

    setIsSearching(true)
    setResults(null)

    try {
      const response = await fetch('/api/scholarships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile })
      })

      const json = await response.json()

      if (!response.ok) {
        throw new Error(json.error || 'Failed to find scholarships')
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
          <div className="inline-flex items-center justify-center p-3 bg-amber-100 dark:bg-amber-900/30 rounded-2xl mb-4">
            <Award className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">AI Scholarship Finder</h1>
          <p className="mt-2 text-lg text-gray-500 dark:text-gray-400 max-w-2xl">
            Describe your background, major, and achievements. Our AI will match you with high-probability scholarships from around the globe.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Search Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm">
            <h2 className="text-xl font-bold flex items-center mb-6 text-gray-900 dark:text-white">
              <Search className="mr-2 h-5 w-5 text-amber-500" />
              Find Matches
            </h2>
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Your Profile & Background
                </label>
                <textarea
                  rows={6}
                  placeholder="e.g. I am a female sophomore studying Computer Science at XYZ University with a 3.8 GPA. I am passionate about AI and participate in the robotics club..."
                  value={profile}
                  onChange={(e) => setProfile(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 dark:border-zinc-700 p-4 text-sm bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                />
              </div>
              
              <button
                type="submit"
                disabled={isSearching || !profile.trim()}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl font-bold flex items-center justify-center transition-all hover:-translate-y-0.5 disabled:opacity-50 shadow-lg shadow-amber-500/30"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Finding Matches...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Find Scholarships
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
                <Filter className="w-5 h-5 mr-2 text-amber-500" />
                Recommended For You
              </h2>
              {results && (
                <span className="text-sm font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-3 py-1 rounded-full">
                  {results.length} Matches Found
                </span>
              )}
            </div>

            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
              {!results && !isSearching && (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 text-center py-20">
                  <Award className="w-16 h-16 opacity-30 mb-4" />
                  <p className="text-lg">Tell the AI about your background to discover hidden scholarships.</p>
                </div>
              )}

              {isSearching && (
                <div className="h-full flex flex-col items-center justify-center text-amber-500 py-20">
                  <Loader2 className="w-12 h-12 animate-spin mb-4" />
                  <p className="animate-pulse font-medium text-lg">Scanning global databases...</p>
                </div>
              )}

              {results && (
                <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                  {results.map((scholarship) => (
                    <div key={scholarship.id} className="group p-6 bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-700/50 rounded-2xl hover:border-amber-300 dark:hover:border-amber-500/50 transition-all hover:shadow-md relative overflow-hidden">
                      
                      {/* Match Badge */}
                      <div className="absolute top-0 right-0 bg-gradient-to-bl from-green-500 to-emerald-600 text-white font-black text-sm px-4 py-2 rounded-bl-2xl">
                        {scholarship.match}% Match
                      </div>

                      <div className="pr-24">
                        <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-1">{scholarship.provider}</p>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{scholarship.title}</h3>
                        
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 leading-relaxed">
                          {scholarship.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-5">
                          {scholarship.tags.map((tag, i) => (
                            <span key={i} className="text-xs font-semibold px-2 py-1 bg-gray-200 text-gray-700 dark:bg-zinc-700 dark:text-gray-300 rounded-md">
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between border-t border-gray-200 dark:border-zinc-700 pt-4 mt-2">
                          <div className="flex space-x-6">
                            <div className="flex items-center text-sm font-bold text-gray-800 dark:text-gray-200">
                              <DollarSign className="w-4 h-4 text-green-500 mr-1" /> {scholarship.amount}
                            </div>
                            <div className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-400">
                              <Calendar className="w-4 h-4 text-orange-500 mr-1" /> Due: {scholarship.deadline}
                            </div>
                          </div>
                          
                          <button className="text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 font-semibold text-sm flex items-center transition-colors">
                            Apply Now <ExternalLink className="w-4 h-4 ml-1" />
                          </button>
                        </div>
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
