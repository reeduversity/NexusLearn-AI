'use client'

import React, { useState } from 'react'
import { Map as MapIcon, Navigation, Coffee, AlertOctagon, BookOpen, Search, ArrowRight, X } from 'lucide-react'
import clsx from 'clsx'

const LOCATIONS = [
  { id: 1, name: "Main Library", type: "study", icon: BookOpen, status: "Moderate", coords: { x: 20, y: 30 } },
  { id: 2, name: "Student Union", type: "food", icon: Coffee, status: "Busy", coords: { x: 60, y: 40 } },
  { id: 3, name: "Science Block", type: "academic", icon: MapIcon, status: "Quiet", coords: { x: 40, y: 70 } },
  { id: 4, name: "Health Center", type: "emergency", icon: AlertOctagon, status: "Open", coords: { x: 80, y: 20 } },
  { id: 5, name: "Quiet Study Lounge", type: "study", icon: BookOpen, status: "Quiet", coords: { x: 70, y: 80 } }
]

export default function CampusMapPage() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState<any>(null)
  const [search, setSearch] = useState('')

  const filteredLocations = LOCATIONS.filter(loc => {
    const matchesFilter = activeFilter === 'all' || loc.type === activeFilter
    const matchesSearch = loc.name.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 space-y-8 animate-in fade-in zoom-in duration-500 h-[calc(100vh-100px)] flex flex-col">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm shrink-0">
        <div>
          <div className="inline-flex items-center justify-center p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl mb-2">
            <MapIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Campus Navigator</h1>
        </div>
        
        <div className="flex items-center space-x-2 overflow-x-auto custom-scrollbar pb-2 md:pb-0">
          <button onClick={() => setActiveFilter('all')} className={clsx("px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap", activeFilter === 'all' ? "bg-blue-500 text-white" : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200")}>All</button>
          <button onClick={() => setActiveFilter('study')} className={clsx("px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap flex items-center", activeFilter === 'study' ? "bg-blue-500 text-white" : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200")}><BookOpen className="w-4 h-4 mr-2"/> Study Spaces</button>
          <button onClick={() => setActiveFilter('food')} className={clsx("px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap flex items-center", activeFilter === 'food' ? "bg-blue-500 text-white" : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200")}><Coffee className="w-4 h-4 mr-2"/> Food</button>
          <button onClick={() => setActiveFilter('emergency')} className={clsx("px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap flex items-center", activeFilter === 'emergency' ? "bg-red-500 text-white" : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100")}><AlertOctagon className="w-4 h-4 mr-2"/> Emergency</button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* Sidebar */}
        <div className="w-full lg:w-1/3 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm p-4 flex flex-col min-h-[300px]">
          <div className="relative mb-4 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search buildings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2">
            {filteredLocations.map(loc => (
              <button 
                key={loc.id}
                onClick={() => setSelectedLocation(loc)}
                className={clsx(
                  "w-full text-left p-4 rounded-2xl border transition-all flex items-center group",
                  selectedLocation?.id === loc.id 
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                    : "border-gray-100 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-700 bg-gray-50 dark:bg-zinc-800/50"
                )}
              >
                <div className={clsx(
                  "p-2 rounded-xl mr-3 shrink-0",
                  loc.type === 'emergency' ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
                )}>
                  <loc.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 dark:text-white truncate">{loc.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{loc.type} • {loc.status}</p>
                </div>
                <Navigation className="w-4 h-4 text-gray-300 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>

        {/* Map Area */}
        <div className="w-full lg:w-2/3 bg-blue-50/50 dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-inner relative overflow-hidden flex-1 min-h-[400px]">
          {/* Simulated Map Background */}
          <div className="absolute inset-0 opacity-20 dark:opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          
          {filteredLocations.map(loc => (
            <button
              key={loc.id}
              onClick={() => setSelectedLocation(loc)}
              className={clsx(
                "absolute transform -translate-x-1/2 -translate-y-1/2 p-2 rounded-full shadow-lg transition-all z-10 hover:scale-110",
                selectedLocation?.id === loc.id ? "scale-125 z-20 ring-4 ring-blue-500/30" : "",
                loc.type === 'emergency' ? "bg-red-500 text-white" : "bg-blue-600 text-white"
              )}
              style={{ left: `${loc.coords.x}%`, top: `${loc.coords.y}%` }}
            >
              <loc.icon className="w-5 h-5" />
            </button>
          ))}

          {/* Floating Details Panel */}
          {selectedLocation && (
            <div className="absolute bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-80 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-zinc-800 p-5 animate-in slide-in-from-bottom-4 z-30">
              <button 
                onClick={() => setSelectedLocation(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className={clsx(
                "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                selectedLocation.type === 'emergency' ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
              )}>
                <selectedLocation.icon className="w-6 h-6" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{selectedLocation.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 capitalize">Status: <span className="font-semibold text-gray-700 dark:text-gray-300">{selectedLocation.status}</span></p>
              
              <button className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-3 rounded-xl flex items-center justify-center hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
                <Navigation className="w-4 h-4 mr-2" />
                Navigate Here
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
