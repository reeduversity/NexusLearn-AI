'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export async function login(formData: FormData) {
  cookies().set('auth-bypass', 'true', { path: '/' })
  revalidatePath('/dashboard')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  cookies().set('auth-bypass', 'true', { path: '/' })
  revalidatePath('/dashboard')
  redirect('/dashboard')
}

export async function logout() {
  cookies().delete('auth-bypass')
  redirect('/login')
}
