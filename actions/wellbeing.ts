'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { WellbeingService } from '@/services/wellbeing.service'

export async function logMood(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const reply = await WellbeingService.getWellbeingAdvice(user.id, message)
  return { reply }
}

export async function addBudgetEntry(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const amount = Number(formData.get('amount'))
  const category = formData.get('category') as string
  const type = formData.get('type') as 'income' | 'expense'
  const description = (formData.get('description') as string) || ''

  if (!amount || amount <= 0) return { error: 'Amount must be greater than 0' }
  if (!category) return { error: 'Category is required' }
  if (!['income', 'expense'].includes(type)) return { error: 'Invalid type' }

  const { error } = await supabase.from('budget_entries').insert({
    user_id: user.id,
    amount,
    category,
    type,
    description,
    created_at: new Date().toISOString(),
  })

  if (error) return { error: error.message }

  revalidatePath('/finance')
  return { success: true }
}

export async function saveFocusSession(durationMinutes: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('focus_sessions').insert({
    user_id: user.id,
    duration_minutes: durationMinutes,
    created_at: new Date().toISOString(),
  })

  if (error) return { error: error.message }

  revalidatePath('/focus')
  return { success: true }
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const fullName = formData.get('full_name') as string
  const university = formData.get('university') as string
  const course = formData.get('course') as string
  const theme = formData.get('theme') as string

  // Update auth user metadata
  const { error: authError } = await supabase.auth.updateUser({
    data: { full_name: fullName, university, course },
  })

  if (authError) return { error: authError.message }

  // Upsert profiles
  const { error: settingsError } = await supabase
    .from('profiles')
    .upsert(
      {
        id: user.id,
        full_name: fullName,
        university,
        course,
        theme_preference: theme || 'system',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    )

  if (settingsError) return { error: settingsError.message }

  revalidatePath('/profile')
  return { success: true }
}

export async function updateSettings(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const emailNotifications = formData.get('email_notifications') === 'on'
  const pushNotifications = formData.get('push_notifications') === 'on'
  const studyReminders = formData.get('study_reminders') === 'on'
  const weeklyDigest = formData.get('weekly_digest') === 'on'
  const aiModel = (formData.get('ai_model') as string) || 'llama-4-scout'

  const { error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: user.id,
        email_notifications: emailNotifications,
        push_notifications: pushNotifications,
        study_reminders: studyReminders,
        weekly_digest: weeklyDigest,
        ai_model: aiModel,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    )

  if (error) return { error: error.message }

  revalidatePath('/settings')
  return { success: true }
}
