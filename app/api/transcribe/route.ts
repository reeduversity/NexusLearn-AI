import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const maxDuration = 30

/**
 * POST /api/transcribe
 * Accepts a multipart/form-data body with an audio file,
 * proxies it to Groq Whisper, returns the transcript.
 * Keeps the GROQ_API_KEY server-side only.
 */
export async function POST(req: NextRequest) {
  try {
    // Verify user is authenticated
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    // Forward to Groq Whisper
    const groqForm = new FormData()
    groqForm.append('file', file, file.name || 'recording.webm')
    groqForm.append('model', 'whisper-large-v3')
    groqForm.append('language', 'en')
    groqForm.append('response_format', 'json')

    const groqRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
      body: groqForm,
    })

    if (!groqRes.ok) {
      const err = await groqRes.text()
      console.error('Groq Whisper error:', err)
      return NextResponse.json({ error: 'Transcription failed', detail: err }, { status: 502 })
    }

    const result = await groqRes.json()
    return NextResponse.json({ success: true, text: result.text || '' })
  } catch (err) {
    console.error('Transcribe route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
