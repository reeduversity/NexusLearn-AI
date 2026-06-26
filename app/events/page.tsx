'use client'

import React, { useState } from 'react'
import { Calendar as CalendarIcon, MapPin, Users, Search, Loader2, PartyPopper, CheckCircle2, Ticket, Sparkles } from 'lucide-react'
import clsx from 'clsx'

const MOCK_EVENTS = [
  {
    id: 1,
    title: "Intro to React & Next.js Workshop",
    club: "Computer Science Society",
    date: "Oct 25, 2026 • 5:00 PM",
    location: "Tech Building, Room 402",
    tags: ["Coding", "Free Pizza", "Web Dev"],
    description: "Learn the basics of React and Next.js. Free pizza and drinks provided for all attendees!",
    isRsvped: false
  },
  {
    id: 2,
    title: "Startup Pitch Night",
    club: "Entrepreneurship Club",
    date: "Oct 28, 2026 • 7:00 PM",
    location: "Main Auditorium",
    tags: ["Business", "Networking", "Startups"],
    description: "Watch 5 student startups pitch their ideas to local investors. Networking session afterwards.",
    isRsvped: true
  },
  {
    id: 3,
    title: "Mental Health & Mindfulness Seminar",
    club: "Wellness Center",
    date: "Nov 2, 2026 • 1:00 PM",
    location: "Student Union, Hall B",
    tags: ["Wellness", "Mental Health", "Yoga"],
    description: "Take a break from midterms. Join us for a guided meditation and stress-relief workshop.",
    isRsvped: false
  },
  {
    id: 4,
    title: "Hackathon Info Session",
    club: "Dev Club",
    date: "Nov 5, 2026 • 6:30 PM",
    location: "Library Basement",
    tags: ["Hackathon", "Coding", "Team Building"],
    description: "Find a team and learn about the upcoming 48-hour winter hackathon.",
    isRsvped: false
  }
]

export default function EventsPage() {
  const [events, setEvents] = useState(MOCK_EVENTS)
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'saved'>('all')

  const toggleRsvp = (id: number) => {
    setEvents(events.map(e => e.id === id ? { ...e, isRsvped: !e.isRsvped } : e))
  }

  const handleAISearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) {
      setEvents(MOCK_EVENTS)
      return
    }

    setIsSearching(true)

    try {
      const response = await fetch('/api/events/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, events: MOCK_EVENTS })
      })

      const json = await response.json()

      if (!response.ok) {
        throw new Error(json.error || 'Failed to search events')
      }

      const matchedIds = json.data as number[]
      
      if (matchedIds.length === 0) {
        alert("No exact matches found. Showing all.")
        setEvents(MOCK_EVENTS)
      } else {
        setEvents(MOCK_EVENTS.filter(ev => matchedIds.includes(ev.id)))
      }
    } catch (err: any) {
      console.error(err)
      alert(err.message || 'An error occurred.')
    } finally {
      setIsSearching(false)
    }
  }

  const displayedEvents = activeTab === 'all' ? events : events.filter(e => e.isRsvped)

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 space-y-8 animate-in fade-in zoom-in duration-500">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm">
        <div>
          <div className="inline-flex items-center justify-center p-3 bg-fuchsia-100 dark:bg-fuchsia-900/30 rounded-2xl mb-4">
            <PartyPopper className="w-6 h-6 text-fuchsia-600 dark:text-fuchsia-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Campus Events</h1>
          <p className="mt-2 text-lg text-gray-500 dark:text-gray-400 max-w-2xl">
            Discover clubs, seminars, and networking events. Use AI to find exactly what you're looking for.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Side: Search & Tabs */}
        <div className="w-full lg:w-1/3 space-y-6">
          <form onSubmit={handleAISearch} className="bg-white dark:bg-zinc-900 p-2 rounded-2xl border border-gray-200 dark:border-zinc-800 flex items-center shadow-sm">
            <div className="pl-4">
              <Sparkles className="w-5 h-5 text-fuchsia-500" />
            </div>
            <input
              type="text"
              placeholder="e.g. 'Coding events with free food'"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent px-4 py-3 outline-none text-gray-800 dark:text-gray-100 placeholder-gray-400 text-sm"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="bg-fuchsia-500 hover:bg-fuchsia-600 text-white p-3 rounded-xl transition-colors disabled:opacity-50"
            >
              {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            </button>
          </form>

          <div className="flex bg-gray-100 dark:bg-zinc-800 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab('all')}
              className={clsx(
                "flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all",
                activeTab === 'all' ? "bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              )}
            >
              All Events
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={clsx(
                "flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all",
                activeTab === 'saved' ? "bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              )}
            >
              RSVP'd
            </button>
          </div>
        </div>

        {/* Right Side: Event Cards */}
        <div className="w-full lg:w-2/3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayedEvents.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-500">
                <PartyPopper className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No events found for this category.</p>
              </div>
            )}
            
            {displayedEvents.map((ev) => (
              <div key={ev.id} className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col hover:border-fuchsia-300 dark:hover:border-fuchsia-700 transition-colors group">
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold text-fuchsia-600 dark:text-fuchsia-400 bg-fuchsia-100 dark:bg-fuchsia-900/30 px-3 py-1 rounded-full uppercase tracking-wider">
                      {ev.club}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{ev.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">{ev.description}</p>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 font-medium">
                      <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
                      {ev.date}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 font-medium">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      {ev.location}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {ev.tags.map(tag => (
                      <span key={tag} className="text-xs font-semibold px-2 py-1 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 rounded-md">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                  <button
                    onClick={() => toggleRsvp(ev.id)}
                    className={clsx(
                      "w-full py-3 rounded-xl font-bold flex items-center justify-center transition-all",
                      ev.isRsvped 
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200"
                        : "bg-fuchsia-500 text-white hover:bg-fuchsia-600"
                    )}
                  >
                    {ev.isRsvped ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        RSVP Confirmed
                      </>
                    ) : (
                      <>
                        <Ticket className="w-5 h-5 mr-2" />
                        RSVP Now
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
