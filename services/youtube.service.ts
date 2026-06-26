import { createClient } from '@/lib/supabase/server'
import { SummarizerService } from './summarizer.service'
import { YoutubeTranscript } from 'youtube-transcript'

export class YouTubeService {
  /**
   * Fetches the transcript for a YouTube video and generates study materials.
   */
  static async processVideo(videoUrl: string, userId: string) {
    try {
      // 1. Fetch transcript using the youtube-transcript library
      let rawTranscript = ""
      try {
        const transcriptItems = await YoutubeTranscript.fetchTranscript(videoUrl)
        rawTranscript = transcriptItems.map(item => item.text).join(' ')
      } catch (err: any) {
        console.error('youtube-transcript fetch failed, using fallback:', err)
        throw new Error(`Failed to parse YouTube transcript: ${err.message || err}`)
      }

      // 2. Summarize the transcript
      const summary = await SummarizerService.generateSummary(rawTranscript, userId)

      // 3. Save to database
      const supabase = await createClient()
      const { data, error } = await supabase.from('youtube_sessions').insert({
        user_id: userId,
        video_url: videoUrl,
        transcript: rawTranscript,
        summary: summary,
        quiz_generated: false
      }).select().single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('YouTube processing failed:', error)
      throw new Error('Failed to process YouTube video')
    }
  }
}
