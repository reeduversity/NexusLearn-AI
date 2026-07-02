import { prisma } from '@/lib/prisma'
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
      let cleanUrl = videoUrl
      try {
        const urlObj = new URL(videoUrl)
        if (urlObj.pathname.includes('/live/')) {
          const videoId = urlObj.pathname.split('/live/')[1].split('?')[0].split('/')[0]
          cleanUrl = `https://www.youtube.com/watch?v=${videoId}`
        } else if (urlObj.pathname.includes('/shorts/')) {
          const videoId = urlObj.pathname.split('/shorts/')[1].split('?')[0].split('/')[0]
          cleanUrl = `https://www.youtube.com/watch?v=${videoId}`
        } else if (urlObj.hostname === 'youtu.be') {
          const videoId = urlObj.pathname.replace('/', '').split('?')[0]
          cleanUrl = `https://www.youtube.com/watch?v=${videoId}`
        }
      } catch (e) {
        // ignore parsing errors and fallback to original url
      }

      try {
        const transcriptItems = await YoutubeTranscript.fetchTranscript(cleanUrl)
        rawTranscript = transcriptItems.map(item => item.text).join(' ')
      } catch (err: any) {
        console.error('youtube-transcript fetch failed:', err)
        throw new Error(`Failed to parse YouTube transcript. Please make sure that captions/subtitles are enabled for this video. Details: ${err.message || err}`)
      }

      // 2. Summarize the transcript
      const summary = await SummarizerService.generateSummary(rawTranscript, userId)

      // 3. Save to database
      const data = await prisma.youtubeSession.create({
        data: {
          userId,
          videoUrl,
          transcript: rawTranscript,
          summary: typeof summary === 'string' ? summary : JSON.stringify(summary),
          quizGenerated: false,
        },
      })

      return data
    } catch (error: any) {
      console.error('YouTube processing failed:', error)
      throw new Error(error.message || 'Failed to process YouTube video')
    }
  }
}
