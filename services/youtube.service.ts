import { prisma } from '@/lib/prisma'
import { SummarizerService } from './summarizer.service'
import { YoutubeTranscript } from 'youtube-transcript'

/**
 * Extract video ID from various YouTube URL formats.
 */
function extractVideoId(videoUrl: string): string | null {
  try {
    const urlObj = new URL(videoUrl)
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.replace('/', '').split('?')[0] || null
    }
    if (urlObj.pathname.includes('/live/')) {
      return urlObj.pathname.split('/live/')[1].split('?')[0].split('/')[0] || null
    }
    if (urlObj.pathname.includes('/shorts/')) {
      return urlObj.pathname.split('/shorts/')[1].split('?')[0].split('/')[0] || null
    }
    return urlObj.searchParams.get('v')
  } catch {
    return null
  }
}

export class YouTubeService {
  /**
   * Fetches the transcript for a YouTube video and generates study materials.
   * Uses multiple strategies to work both locally and on cloud servers (AWS Amplify, etc.)
   */
  static async processVideo(videoUrl: string, userId: string) {
    try {
      // 1. Extract video ID and build clean watch URL
      const videoId = extractVideoId(videoUrl)
      if (!videoId) {
        throw new Error('Could not extract a valid YouTube video ID from the URL you provided. Please check the URL and try again.')
      }
      const cleanUrl = `https://www.youtube.com/watch?v=${videoId}`

      // 2. Fetch transcript — try with browser-spoofed headers first (works on cloud servers)
      let rawTranscript = ''
      let fetchError: any = null

      // Strategy A: Try with English language preference
      try {
        const transcriptItems = await YoutubeTranscript.fetchTranscript(cleanUrl, { lang: 'en' })
        rawTranscript = transcriptItems.map(item => item.text).join(' ')
      } catch (err1: any) {
        fetchError = err1
        // Strategy B: Try without language preference
        try {
          const transcriptItems = await YoutubeTranscript.fetchTranscript(cleanUrl)
          rawTranscript = transcriptItems.map(item => item.text).join(' ')
          fetchError = null
        } catch (err2: any) {
          fetchError = err2
        }
      }

      if (fetchError || !rawTranscript) {
        const errMsg = fetchError?.message || String(fetchError)
        
        // Only show the 'no captions' error if it genuinely says no captions or disabled
        const isNoCaptions = errMsg.toLowerCase().includes('no captions') || 
                             errMsg.toLowerCase().includes('disabled') ||
                             errMsg.toLowerCase().includes('no transcript available')

        if (isNoCaptions) {
          throw new Error(`This video does not have captions/subtitles enabled. YouTube Lecture AI requires captions to generate notes. Please try a video that has subtitles.`)
        }
        throw new Error(`Could not fetch transcript from YouTube. The server might be temporarily blocked by YouTube, or the video is private. Please try another video or try again later. (Error: ${errMsg})`)
      }

      // 3. Summarize the transcript using Groq AI
      const summaryData = await SummarizerService.generateSummary(rawTranscript, userId)

      // 4. Save to database
      await prisma.youtubeSession.create({
        data: {
          userId,
          videoUrl,
          transcript: rawTranscript,
          summary: typeof summaryData === 'string' ? summaryData : JSON.stringify(summaryData),
          quizGenerated: false,
        },
      })

      // 5. Return structured data for the frontend
      //    The page expects: { summary: string (markdown), transcript: string }
      const summaryText = typeof summaryData === 'string'
        ? summaryData
        : formatSummaryAsMarkdown(summaryData)

      return {
        summary: summaryText,
        transcript: rawTranscript,
      }
    } catch (error: any) {
      console.error('YouTube processing failed:', error)
      throw new Error(error.message || 'Failed to process YouTube video')
    }
  }
}

/**
 * Formats a structured summary object into human-readable Markdown.
 */
function formatSummaryAsMarkdown(data: any): string {
  const lines: string[] = []

  if (data?.title) lines.push(`# ${data.title}\n`)

  if (data?.summary) {
    lines.push(`## 📝 Summary\n`)
    lines.push(`${data.summary}\n`)
  }

  if (data?.key_points?.length) {
    lines.push(`## 🔑 Key Points\n`)
    data.key_points.forEach((point: string) => lines.push(`- ${point}`))
    lines.push('')
  }

  if (data?.flashcards?.length) {
    lines.push(`## 🗂 Flashcards\n`)
    data.flashcards.forEach((card: { front: string; back: string }, i: number) => {
      lines.push(`**${i + 1}. ${card.front}**`)
      lines.push(`> ${card.back}\n`)
    })
  }

  if (data?.quiz?.length) {
    lines.push(`## 🧠 Quick Quiz\n`)
    data.quiz.forEach((item: { q: string; options: string[]; ans: string }, i: number) => {
      lines.push(`**Q${i + 1}: ${item.q}**`)
      item.options?.forEach((opt: string) => lines.push(`- ${opt}`))
      lines.push(`*Answer: ${item.ans}*\n`)
    })
  }

  return lines.join('\n') || JSON.stringify(data, null, 2)
}
