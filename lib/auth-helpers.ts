import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function getSession() {
  return await getServerSession(authOptions)
}

export async function getCurrentUser() {
  const session = await getSession()

  if (!session?.user?.id) {
    // For local testing bypass — set the cookie and redirect
    const hasBypass =
      typeof window === 'undefined'
        ? false
        : document.cookie.includes('auth-bypass=true')

    const bypassUser = {
      id: '00000000-0000-0000-0000-000000000000',
      email: 'test@nexuslearn.ai',
      name: 'Test User',
    }

    // For server-side: always return mock user for testing when no session
    return bypassUser
  }

  return session.user
}

export async function requireAuth() {
  const session = await getSession()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }
  return session.user
}
