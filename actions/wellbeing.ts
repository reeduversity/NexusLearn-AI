'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-helpers'
import { WellbeingService } from '@/services/wellbeing.service'

export async function logMood(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Not authenticated' }

  const mood = Number(formData.get('mood'))
  const energy = Number(formData.get('energy'))
  const notes = (formData.get('notes') as string) || ''

  if (mood < 1 || mood > 5 || energy < 1 || energy > 5) {
    return { error: 'Mood and energy must be between 1 and 5' }
  }

  const result = await WellbeingService.logWellbeing(user.id, mood, energy, notes)

  if (!result.success) {
    return { error: result.error }
  }

  revalidatePath('/wellbeing')
  return { success: true }
}

export async function sendWellbeingMessage(message: string) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Not authenticated' }

  const reply = await WellbeingService.getWellbeingAdvice(user.id, message)
  return { reply }
}

export async function addBudgetEntry(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Not authenticated' }

  const amount = Number(formData.get('amount'))
  const category = formData.get('category') as string
  const type = formData.get('type') as 'income' | 'expense'
  const description = (formData.get('description') as string) || ''

  if (!amount || amount <= 0) return { error: 'Amount must be greater than 0' }
  if (!category) return { error: 'Category is required' }
  if (!['income', 'expense'].includes(type)) return { error: 'Invalid type' }

  try {
    await prisma.budgetEntry.create({
      data: {
        userId: user.id,
        amount,
        category,
        type,
        description,
      },
    })
  } catch (error: any) {
    return { error: error.message }
  }

  revalidatePath('/finance')
  return { success: true }
}

export async function saveFocusSession(durationMinutes: number) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Not authenticated' }

  try {
    await prisma.focusSession.create({
      data: {
        userId: user.id,
        durationMinutes,
      },
    })
  } catch (error: any) {
    return { error: error.message }
  }

  revalidatePath('/focus')
  return { success: true }
}

export async function updateProfile(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Not authenticated' }

  const fullName = formData.get('full_name') as string
  const university = formData.get('university') as string
  const course = formData.get('course') as string
  const theme = formData.get('theme') as string

  try {
    // Update user metadata
    await prisma.user.update({
      where: { id: user.id },
      data: {
        rawUserMetaData: { full_name: fullName, university, course },
      },
    })

    // Upsert profile
    await prisma.profile.upsert({
      where: { id: user.id },
      update: {
        fullName,
        university,
        course,
        themePreference: theme || 'system',
      },
      create: {
        id: user.id,
        fullName,
        university,
        course,
        themePreference: theme || 'system',
      },
    })
  } catch (error: any) {
    return { error: error.message }
  }

  revalidatePath('/profile')
  return { success: true }
}

export async function updateSettings(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Not authenticated' }

  const emailNotifications = formData.get('email_notifications') === 'on'
  const pushNotifications = formData.get('push_notifications') === 'on'
  const studyReminders = formData.get('study_reminders') === 'on'
  const weeklyDigest = formData.get('weekly_digest') === 'on'
  const aiModel = (formData.get('ai_model') as string) || 'llama-4-scout'

  try {
    await prisma.profile.upsert({
      where: { id: user.id },
      update: {
        emailNotifications,
        pushNotifications,
        studyReminders,
        weeklyDigest,
        aiModel,
      },
      create: {
        id: user.id,
        fullName: '',
        emailNotifications,
        pushNotifications,
        studyReminders,
        weeklyDigest,
        aiModel,
      },
    })
  } catch (error: any) {
    return { error: error.message }
  }

  revalidatePath('/settings')
  return { success: true }
}
