import { createClient } from '@/lib/supabase/server'
import Tesseract from 'tesseract.js'

const CONFIDENCE_THRESHOLD = 70

export class OCRService {
  /**
   * Processes an image with Tesseract OCR first.
   * If confidence > 70%, uses extracted text to solve with Groq.
   * If confidence <= 70%, falls back to Groq Vision multimodal model.
   *
   * Flow: Image → OCR → confidence check → Groq solve → save ocr_jobs
   */
  static async processDoubtImage(imageUrl: string, userId: string): Promise<{
    confidence: number
    extractedText: string
    solution: string
    method: 'tesseract+groq' | 'groq-vision'
  }> {
    let confidence = 0
    let extractedText = ''
    let solution = ''
    let method: 'tesseract+groq' | 'groq-vision' = 'groq-vision'

    // Step 1: Try Tesseract OCR
    try {
      const { data } = await Tesseract.recognize(imageUrl, 'eng', {
        logger: (_m: Tesseract.LoggerMessage) => {} // suppress progress logs
      })
      confidence = data.confidence
      extractedText = data.text.trim()
    } catch (ocrErr) {
      console.warn('Tesseract OCR failed, falling back to Groq Vision:', ocrErr)
      confidence = 0
      extractedText = ''
    }

    // Step 2: Route based on confidence
    if (confidence > CONFIDENCE_THRESHOLD && extractedText.length > 10) {
      // High confidence — use extracted text with Groq text model
      method = 'tesseract+groq'
      solution = await OCRService.solveWithGroqText(extractedText)
    } else {
      // Low confidence — use Groq Vision multimodal
      method = 'groq-vision'
      const visionResult = await OCRService.solveWithGroqVision(imageUrl)
      solution = visionResult.solution
      if (!extractedText) extractedText = visionResult.extractedText
    }

    // Step 3: Save job to ocr_jobs table
    try {
      const supabase = await createClient()
      await supabase.from('ocr_jobs').insert({
        user_id: userId,
        image_url: imageUrl,
        extracted_text: extractedText,
        solved_output: solution
      })
    } catch (dbErr) {
      console.error('Failed to save OCR job to DB:', dbErr)
    }

    return { confidence, extractedText, solution, method }
  }

  private static async solveWithGroqText(text: string): Promise<string> {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are an expert academic tutor. Solve the following problem step-by-step with clear explanations.'
          },
          {
            role: 'user',
            content: `Solve this academic problem extracted from an image:\n\n${text}`
          }
        ],
        temperature: 0.2,
        max_tokens: 1024
      })
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`Groq text API error: ${err}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  }

  private static async solveWithGroqVision(imageUrl: string): Promise<{
    solution: string
    extractedText: string
  }> {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.2-11b-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'First extract the text from this image, then solve the academic problem or doubt shown. Provide the extracted text followed by the step-by-step solution.'
              },
              {
                type: 'image_url',
                image_url: { url: imageUrl }
              }
            ]
          }
        ],
        temperature: 0.2,
        max_tokens: 1024
      })
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`Groq Vision API error: ${err}`)
    }

    const data = await response.json()
    const fullContent: string = data.choices[0].message.content

    // Heuristically split extracted text from solution
    const solutionMarker = fullContent.indexOf('**Solution')
    const stepMarker = fullContent.indexOf('Step 1')
    const splitAt = solutionMarker !== -1 ? solutionMarker : stepMarker !== -1 ? stepMarker : Math.floor(fullContent.length / 3)

    return {
      extractedText: fullContent.slice(0, splitAt).trim(),
      solution: fullContent.slice(splitAt).trim() || fullContent
    }
  }
}
