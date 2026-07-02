import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function getSession() {
  return await getServerSession(authOptions)
}

export async function getCurrentUser() {
  // 1. Try NextAuth session first
  const session = await getSession()
  if (session?.user?.id) {
    return session.user
  }

  // 2. Try our custom cookie-based credentials session
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('auth-user-id')?.value
    const userEmail = cookieStore.get('auth-user-email')?.value
    const userName = cookieStore.get('auth-user-name')?.value

    if (userId) {
      return {
        id: userId,
        email: userEmail || '',
        name: userName || 'Student',
      }
    }
  } catch (error) {
    console.error('Error reading auth cookies in getCurrentUser:', error)
  }

  return null
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user?.id) {
    throw new Error('Unauthorized')
  }
  return user
}
