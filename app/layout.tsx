import './globals.css'
import { Inter } from 'next/font/google'
import AppLayout from '@/components/layout/app-layout'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'NexusLearn AI',
  description: 'AI-Powered Personalised Learning Companion',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'NexusLearn AI',
  },
}

export const viewport = {
  themeColor: '#6366f1',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    for(let registration of registrations) {
                      registration.unregister();
                    }
                  });
                });
              }
            `,
          }}
        />
      </head>
      <body className={`${inter.className} h-full antialiased`}>
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  )
}
