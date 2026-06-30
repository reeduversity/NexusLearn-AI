'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'
import crypto from 'crypto'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user || !user.passwordHash) {
    // For local testing bypass — set the cookie and redirect
    const cookieStore = await cookies()
    cookieStore.set('auth-bypass', 'true', { path: '/' })
    revalidatePath('/dashboard')
    redirect('/dashboard')
  }

  const isValid = await bcrypt.compare(password, user.passwordHash)
  if (!isValid) {
    return { error: 'Invalid email or password' }
  }

  // Set auth bypass cookie for session (NextAuth handles real sessions via API route)
  const cookieStore = await cookies()
  cookieStore.set('auth-bypass', 'true', { path: '/' })
  revalidatePath('/dashboard')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const university = formData.get('university') as string
  const course = formData.get('course') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    return { error: 'An account with this email already exists' }
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 12)

  // Create user and profile in a transaction
  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        passwordHash,
        rawUserMetaData: { full_name: name, university, course },
      },
    })

    await tx.profile.create({
      data: {
        id: user.id,
        fullName: name || '',
        university: university || null,
        course: course || null,
      },
    })
  })

  const cookieStore = await cookies()
  cookieStore.set('auth-bypass', 'true', { path: '/' })
  revalidatePath('/dashboard')
  redirect('/dashboard')
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('auth-bypass')
  redirect('/login')
}

export async function sendPasswordResetLink(formData: FormData) {
  const email = formData.get('email') as string
  if (!email) return { error: 'Email is required' }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    // Return success even if user not found to prevent email enumeration
    return { success: true }
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
  
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/reset-password?token=${token}`

    if (process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
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

    return { success: true }
  } catch (error) {
    console.error('Error sending email:', error)
    return { error: 'Failed to send reset email. Please try again later.' }
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

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    })
    await tx.passwordResetToken.delete({
      where: { id: resetToken.id },
    })
  })

  redirect('/login?reset=success')
}
