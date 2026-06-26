'use client'

import { Bell, Search, Menu, Plus } from 'lucide-react'
import { logout } from '@/actions/auth'

export default function TopNavbar() {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/20 bg-white/60 backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-950/60 shadow-[0_4px_30px_rgb(0,0,0,0.02)] transition-all duration-300">
      <div className="px-4 py-3 lg:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-start rtl:justify-end">
            <button type="button" className="inline-flex items-center rounded-xl p-2 text-sm text-gray-500 hover:bg-gray-100/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:text-gray-400 dark:hover:bg-zinc-800/80 sm:hidden transition-all duration-300">
              <span className="sr-only">Open sidebar</span>
              <Menu className="h-6 w-6" />
            </button>
            <a href="/dashboard" className="ms-2 flex md:me-24 items-center gap-2 group">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-300 group-hover:scale-105">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <span className="self-center whitespace-nowrap text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                Nexus<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Learn</span> <span className="text-sm font-semibold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full ml-1">AI</span>
              </span>
            </a>
          </div>

          <div className="flex items-center gap-5">
            <div className="hidden md:block">
              <div className="relative group">
                <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4">
                  <Search className="h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input type="text" className="block w-72 rounded-full border border-gray-200/80 bg-gray-50/50 p-2.5 ps-11 text-sm text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:border-zinc-800/80 dark:bg-zinc-900/50 dark:text-white dark:placeholder-gray-500 dark:focus:bg-zinc-900 transition-all duration-300 hover:border-gray-300 dark:hover:border-zinc-700" placeholder="Search everywhere (Cmd+K)..." />
                <div className="absolute inset-y-0 end-0 flex items-center pe-3 pointer-events-none">
                  <kbd className="hidden sm:inline-block border border-gray-200 dark:border-zinc-700 rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-gray-400">⌘K</kbd>
                </div>
              </div>
            </div>

            <button type="button" className="relative rounded-full p-2.5 text-gray-500 hover:bg-gray-100/80 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-zinc-800/80 dark:hover:text-white transition-all duration-300 hover:scale-105">
              <Plus className="h-5 w-5" />
            </button>

            <button type="button" className="relative rounded-full p-2.5 text-gray-500 hover:bg-gray-100/80 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-zinc-800/80 dark:hover:text-white transition-all duration-300 hover:scale-105">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2.5 flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white dark:border-zinc-950"></span>
              </span>
            </button>
            
            <div className="flex items-center ms-2 pl-4 border-l border-gray-200 dark:border-zinc-800">
              <form action={logout}>
                <button type="submit" className="flex rounded-full bg-gray-800 text-sm focus:ring-4 focus:ring-indigo-500/30 transition-all duration-300 hover:scale-105 hover:ring-2 hover:ring-indigo-500/50 shadow-md">
                  <span className="sr-only">Logout</span>
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                    U
                  </div>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
