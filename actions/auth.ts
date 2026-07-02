'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export async function login(formData: FormData) {
  try {
    const email = (formData.get('email') as string)?.toLowerCase()
    const password = formData.get('password') as string

    if (!email || !password) {
      return { error: 'Email and password are required' }
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    })

    if (!user || !user.passwordHash) {
      return { error: 'Invalid email or password' }
    }

    const isValid = await bcrypt.compare(password, user.passwordHash)
    if (!isValid) {
      return { error: 'Invalid email or password' }
    }

    // Set real user session cookies and auth-bypass so middleware lets us through
    // IMPORTANT: secure + sameSite flags are required for cookies to work on HTTPS (Amplify)
    const cookieStore = await cookies()
    const isProduction = process.env.NODE_ENV === 'production'
    const cookieOptions = {
      path: '/',
      httpOnly: true,
      secure: isProduction,         // Required for HTTPS on Amplify
      sameSite: 'lax' as const,     // Ensures cookies are sent with same-origin navigations
      maxAge: 60 * 60 * 24 * 30,    // 30 days
    }
    cookieStore.set('auth-bypass', 'true', cookieOptions)
    cookieStore.set('auth-user-id', user.id, cookieOptions)
    cookieStore.set('auth-user-email', user.email, cookieOptions)
    cookieStore.set('auth-user-name', user.profile?.fullName || 'Student', cookieOptions)
  } catch (error: any) {
    console.error('Login error:', error)
    return { error: 'Server database connection failed. Please ensure environment variables are configured in Amplify.' }
  }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const name = formData.get('name') as string
  const email = (formData.get('email') as string)?.toLowerCase()
  const password = formData.get('password') as string
  const university = formData.get('university') as string
  const course = formData.get('course') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return { error: 'An account with this email already exists' }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user and profile in a batch transaction
    const userId = crypto.randomUUID()
    await prisma.$transaction([
      prisma.user.create({
        data: {
          id: userId,
          email,
          passwordHash,
          rawUserMetaData: { full_name: name, university, course },
        },
      }),
      prisma.profile.create({
        data: {
          id: userId,
          fullName: name || '',
          university: university || null,
          course: course || null,
        },
      })
    ])
  } catch (error: any) {
    console.error('Signup error:', error)
    return { error: 'Server database connection failed. Please ensure environment variables are configured in Amplify.' }
  }

  revalidatePath('/login')
  redirect('/login?signup=success')
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('auth-bypass')
  cookieStore.delete('auth-user-id')
  cookieStore.delete('auth-user-email')
  cookieStore.delete('auth-user-name')
  redirect('/login')
}

export async function sendPasswordResetLink(formData: FormData) {
  const email = (formData.get('email') as string)?.toLowerCase()
  if (!email) return { error: 'Email is required' }

  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return { error: 'No account found with this email address.' }
    }

    const token = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60) // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    })

    // Send email (In production, ensure SMTP credentials are in .env)
    const nodemailer = await import('nodemailer')
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`

    const isSmtpConfigured = process.env.SMTP_USER && process.env.SMTP_USER !== 'your-email@gmail.com'

    if (isSmtpConfigured) {
      await transporter.sendMail({
        from: `"NexusLearn AI" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Reset Your NexusLearn AI Password',
        html: `
          <h2>Password Reset Request</h2>
          <p>Click the link below to reset your password. This link is valid for 1 hour.</p>
          <a href="${resetUrl}">Reset Password</a>
          <p>If you did not request this, please ignore this email.</p>
        `,
      })
    } else {
      console.log('--- DEVELOPMENT MODE: EMAIL NOT SENT ---')
      console.log('Reset URL:', resetUrl)
    }

    return { success: true, resetUrl }
  } catch (error: any) {
    console.error('Password reset link error:', error)
    return { error: 'Server database connection failed. Please ensure environment variables are configured in Amplify.' }
  }
}

export async function resetPassword(formData: FormData) {
  const token = formData.get('token') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!token || !password || password !== confirmPassword) {
    return { error: 'Passwords must match and token is required' }
  }

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!resetToken || resetToken.expiresAt < new Date()) {
    return { error: 'Invalid or expired reset token' }
  }

  const passwordHash = await bcrypt.hash(password, 12)

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    })
  ])

  redirect('/login?reset=success')
}
