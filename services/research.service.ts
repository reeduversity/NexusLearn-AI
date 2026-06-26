import { createClient } from '@/lib/supabase/server'

export class ResearchService {
  /**
   * Synthesizes multiple source texts into a coherent research summary using Groq AI.
   * Saves the result to the research_projects table in Supabase.
   */
  static async synthesizeResearch(topic: string, sources: string[], userId: string) {
    const sourcesText = sources
      .map((src, i) => `[Source ${i + 1}]:\n${src}`)
      .join('\n\n---\n\n')

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `You are an expert academic research assistant. Your task is to synthesize multiple source texts into a single, coherent, well-structured research summary on the given topic. Follow these rules:
1. Combine insights from all sources into a unified narrative.
2. Identify common themes, agreements, and contradictions between sources.
3. Use proper academic tone and structure (introduction, key findings, analysis, conclusion).
4. Cite source numbers inline, e.g. [Source 1], [Source 2].
5. Highlight any gaps in the research that need further investigation.
6. Do NOT fabricate information not present in the sources.`
          },
          {
            role: 'user',
            content: `Topic: ${topic}\n\nSources:\n${sourcesText}`
          }
        ],
        temperature: 0.3,
        max_tokens: 4096,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Groq API error: ${response.status} - ${errorData?.error?.message || 'Unknown error'}`)
    }

    const data = await response.json()
    const synthesis = data.choices[0].message.content

    // Save to research_projects table
    const supabase = await createClient()
    const { data: project, error } = await supabase
      .from('research_projects')
      .insert({
        user_id: userId,
        title: topic,
        synthesis,
        sources_count: sources.length,
        status: 'completed',
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to save research project: ${error.message}`)
    }

    return { synthesis, project }
  }

  /**
   * Checks text for plagiarism patterns and academic integrity issues using AI.
   * Returns an integrity score, issues found, and actionable suggestions.
   */
  static async checkAcademicIntegrity(text: string) {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `You are an expert academic integrity advisor. Analyze the provided text and evaluate it for potential academic integrity concerns. Respond in valid JSON format with this exact structure:
{
  "integrity_score": <number 0-100, where 100 is fully original/properly attributed>,
  "overall_assessment": "<brief overall assessment>",
  "issues": [
    {
      "type": "<issue type: 'unattributed_claim' | 'missing_citation' | 'potential_paraphrase' | 'writing_inconsistency' | 'factual_claim_without_source'>",
      "text_excerpt": "<the problematic portion of text>",
      "explanation": "<why this is a concern>",
      "suggestion": "<how to fix it>"
    }
  ],
  "strengths": ["<list of things done well>"],
  "recommendations": ["<list of general improvement recommendations>"]
}
Do NOT include any text outside the JSON object.`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.2,
        max_tokens: 3000,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Groq API error: ${response.status} - ${errorData?.error?.message || 'Unknown error'}`)
    }

    const data = await response.json()
    const content = data.choices[0].message.content

    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content]
      const parsed = JSON.parse(jsonMatch[1].trim())
      return parsed
    } catch {
      return {
        integrity_score: 0,
        overall_assessment: 'Unable to parse integrity analysis. Please try again.',
        issues: [],
        strengths: [],
        recommendations: [content],
      }
    }
  }

  /**
   * Generates a properly formatted citation in APA, MLA, or IEEE format using AI.
   */
  static async generateCitation(
    source: { title: string; author: string; year: string; url?: string },
    format: 'APA' | 'MLA' | 'IEEE'
  ) {
    const sourceInfo = `Title: ${source.title}\nAuthor(s): ${source.author}\nYear: ${source.year}${source.url ? `\nURL: ${source.url}` : ''}`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `You are a citation formatting expert. Generate a properly formatted citation in ${format} format based on the provided source information. Follow the latest ${format} citation guidelines precisely.

Rules:
- Return ONLY the formatted citation string, nothing else.
- Use proper punctuation, italicization markers, and formatting for ${format} style.
- For italics, use *asterisks* around the text that should be italicized.
- If the URL is provided, include it in the citation as per ${format} guidelines.
- Use "Retrieved from" for APA URLs, or the appropriate accessor phrase for the format.
- Handle multiple authors correctly according to ${format} rules.`
          },
          {
            role: 'user',
            content: sourceInfo
          }
        ],
        temperature: 0.1,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Groq API error: ${response.status} - ${errorData?.error?.message || 'Unknown error'}`)
    }

    const data = await response.json()
    return data.choices[0].message.content.trim()
  }

  /**
   * Queries Semantic Scholar for research publications on a given query.
   */
  static async searchSemanticScholar(query: string, limit: number = 5) {
    try {
      const headers: Record<string, string> = {}
      if (process.env.SEMANTIC_SCHOLAR_API_KEY) {
        headers['x-api-key'] = process.env.SEMANTIC_SCHOLAR_API_KEY
      }

      const res = await fetch(`https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=${limit}&fields=title,authors,year,url,abstract`, {
        headers
      })

      if (!res.ok) throw new Error(`Semantic Scholar error: ${res.statusText}`)
      const data = await res.json()
      const papers = (data.data || []).map((paper: any) => ({
        title: paper.title,
        authors: (paper.authors || []).map((a: any) => a.name).join(', '),
        year: String(paper.year || ''),
        url: paper.url || '',
        source: 'Semantic Scholar' as const,
        abstract: paper.abstract || ''
      }))
      return papers
    } catch (error) {
      console.error('Semantic Scholar search failed:', error)
      return []
    }
  }

  /**
   * Queries arXiv for preprints on a given query.
   */
  static async searchArxiv(query: string, limit: number = 5) {
    try {
      const res = await fetch(`http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&max_results=${limit}`)
      if (!res.ok) throw new Error(`arXiv error: ${res.statusText}`)
      const text = await res.text()

      const entries = text.split('<entry>')
      entries.shift() // Remove header metadata block

      const papers = entries.map(entry => {
        const titleMatch = entry.match(/<title>([\s\S]*?)<\/title>/)
        const summaryMatch = entry.match(/<summary>([\s\S]*?)<\/summary>/)
        const idMatch = entry.match(/<id>([\s\S]*?)<\/id>/)
        const authorMatches = [...entry.matchAll(/<name>([\s\S]*?)<\/name>/g)]

        const title = titleMatch ? titleMatch[1].trim().replace(/\s+/g, ' ') : 'Untitled'
        const abstract = summaryMatch ? summaryMatch[1].trim().replace(/\s+/g, ' ') : ''
        const url = idMatch ? idMatch[1].trim() : ''
        const authors = authorMatches.map(m => m[1].trim()).join(', ')
        
        const publishedMatch = entry.match(/<published>(\d{4})/)
        const year = publishedMatch ? publishedMatch[1] : ''

        return {
          title,
          authors,
          year,
          url,
          source: 'arXiv' as const,
          abstract
        }
      })

      return papers
    } catch (error) {
      console.error('arXiv search failed:', error)
      return []
    }
  }

  /**
   * Parallel queries both repositories to retrieve literature matches.
   */
  static async searchLiterature(query: string, limit: number = 6) {
    const halfLimit = Math.ceil(limit / 2)
    const [scholarPapers, arxivPapers] = await Promise.all([
      this.searchSemanticScholar(query, halfLimit),
      this.searchArxiv(query, halfLimit)
    ])
    return [...scholarPapers, ...arxivPapers].slice(0, limit)
  }
}
