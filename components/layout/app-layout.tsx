'use client'

import { usePathname } from 'next/navigation'
import Sidebar from '@/components/layout/sidebar'
import TopNavbar from '@/components/layout/top-navbar'
import { ThemeProvider } from '@/components/providers/theme-provider'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = ['/login', '/signup', '/forgot-password'].includes(pathname)

  if (isAuthPage) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] text-gray-900 dark:text-gray-100 selection:bg-indigo-500/30">
        <TopNavbar />
        <Sidebar />
        <div className="p-4 sm:ml-64 pt-24 min-h-screen relative overflow-hidden">
          {/* Subtle background glow effects */}
          <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl opacity-50 transform translate-x-1/3 -translate-y-1/4"></div>
          <div className="absolute bottom-0 left-0 -z-10 w-[500px] h-[500px] bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl opacity-50 transform -translate-x-1/4 translate-y-1/3"></div>
          
          <main className="mx-auto max-w-7xl animate-in-up">
            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  )
}
