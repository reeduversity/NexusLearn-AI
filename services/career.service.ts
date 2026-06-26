import { createClient } from '@/lib/supabase/server'

export class CareerService {
  /**
   * Analyzes a resume against ATS (Applicant Tracking System) standards using Groq AI.
   * Returns score, suggestions, and missing keywords. Saves report to ats_reports table.
   */
  static async analyzeResume(resumeText: string, userId: string) {
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
            content: `You are an expert ATS (Applicant Tracking System) Resume Analyzer. Analyze the provided resume and return a JSON object with the following structure:
{
  "score": <number 0-100>,
  "summary": "<brief overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "suggestions": ["<improvement 1>", "<improvement 2>", ...],
  "missing_keywords": ["<keyword 1>", "<keyword 2>", ...],
  "formatting_issues": ["<issue 1>", "<issue 2>", ...],
  "section_scores": {
    "contact_info": <number 0-100>,
    "experience": <number 0-100>,
    "education": <number 0-100>,
    "skills": <number 0-100>,
    "projects": <number 0-100>
  }
}
Be thorough and specific. Evaluate against common ATS parsing standards and industry best practices.`
          },
          { role: 'user', content: `Analyze this resume for ATS compatibility:\n\n${resumeText}` }
        ],
        response_format: { type: 'json_object' },
      }),
    })

    const data = await response.json()
    const analysis = JSON.parse(data.choices[0].message.content)

    // Save report to database
    const supabase = await createClient()
    const { data: report, error } = await supabase
      .from('ats_reports')
      .insert({
        user_id: userId,
        resume_text: resumeText,
        score: analysis.score,
        summary: analysis.summary,
        strengths: analysis.strengths,
        suggestions: analysis.suggestions,
        missing_keywords: analysis.missing_keywords,
        formatting_issues: analysis.formatting_issues,
        section_scores: analysis.section_scores,
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to save ATS report:', error)
      throw new Error('Failed to save ATS report')
    }

    return { ...analysis, id: report.id }
  }

  /**
   * Generates a tailored cover letter for a specific job and company using AI.
   */
  static async generateCoverLetter(jobTitle: string, company: string, resumeText: string) {
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
            content: `You are a professional Career Coach and Cover Letter Writer. Generate a polished, tailored cover letter based on the candidate's resume and the target position. The cover letter should:
- Be professionally formatted with proper salutation and closing
- Highlight relevant skills and experiences from the resume
- Show enthusiasm for the specific role and company
- Be concise (3-4 paragraphs)
- Use action verbs and quantifiable achievements where possible
Return the cover letter as plain text, ready to use.`
          },
          {
            role: 'user',
            content: `Generate a cover letter for:\nJob Title: ${jobTitle}\nCompany: ${company}\n\nCandidate Resume:\n${resumeText}`
          }
        ],
      }),
    })

    const data = await response.json()
    return data.choices[0].message.content
  }

  /**
   * Compares a resume against a job description to determine match percentage and gap analysis.
   */
  static async matchJD(resumeText: string, jobDescriptionText: string) {
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
            content: `You are an expert HR Tech Analyst specializing in resume-to-job-description matching. Compare the provided resume against the job description and return a JSON object:
{
  "match_percentage": <number 0-100>,
  "matched_skills": ["<skill 1>", "<skill 2>", ...],
  "missing_skills": ["<skill 1>", "<skill 2>", ...],
  "experience_match": "<assessment of experience alignment>",
  "education_match": "<assessment of education alignment>",
  "recommendations": ["<recommendation 1>", "<recommendation 2>", ...],
  "overall_assessment": "<brief summary of fit>"
}
Be precise and actionable in your analysis.`
          },
          {
            role: 'user',
            content: `Resume:\n${resumeText}\n\nJob Description:\n${jobDescriptionText}`
          }
        ],
        response_format: { type: 'json_object' },
      }),
    })

    const data = await response.json()
    return JSON.parse(data.choices[0].message.content)
  }

  /**
   * Conducts a mock interview. AI acts as an interviewer, generates contextual follow-up questions.
   */
  static async conductMockInterview(role: string, question: string) {
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
            content: `You are an expert interviewer conducting a mock interview for a ${role} position. Your role is to:
1. Evaluate the candidate's answer to the current question
2. Provide brief, constructive feedback
3. Ask a relevant follow-up question to dig deeper

Return a JSON object:
{
  "feedback": "<constructive feedback on the answer>",
  "score": <number 1-10>,
  "follow_up_question": "<next interview question>",
  "tips": ["<tip 1>", "<tip 2>"]
}
Be encouraging but honest. Simulate a real interview experience.`
          },
          {
            role: 'user',
            content: question
          }
        ],
        response_format: { type: 'json_object' },
      }),
    })

    const data = await response.json()
    return JSON.parse(data.choices[0].message.content)
  }
}
