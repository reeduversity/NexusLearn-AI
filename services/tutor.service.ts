import { VectorSearchService } from './vector-search.service'

export class TutorService {
  /**
   * Concept Tutor: Answers questions using RAG (Retrieval-Augmented Generation) from user notes.
   */
  static async askConceptQuestion(question: string, userId: string) {
    // 1. Retrieve context
    const contextNodes = await VectorSearchService.searchNotes(question, userId, 3)
    const contextText = contextNodes?.map((n: any) => n.content).join('\n') || ''

    // 2. Query LLM
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: `You are an expert AI Concept Tutor. 
Your goal is to explain complex topics using the Socratic method and relatable analogies.
Do not just give the direct answer immediately. Instead:
1. Provide a clear, simple analogy to ground the concept.
2. Explain the core idea concisely based strictly on the provided context.
3. Ask a probing Socratic question at the end to check the student's understanding.

Context:\n\n${contextText}` },
          { role: 'user', content: question }
        ],
      }),
    })

    const data = await response.json()
    return data.choices[0].message.content
  }

  /**
   * Code Tutor: Dedicated debugger and code explainer for CS students.
   */
  static async debugCode(code: string, errorMsg: string, language: string) {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: `You are an expert Senior Software Engineer and Code Tutor. Debug the provided ${language} code based on the error message. Provide the corrected code and explain the fix clearly.` },
          { role: 'user', content: `Code:\n${code}\n\nError Message:\n${errorMsg}` }
        ],
      }),
    })

    const data = await response.json()
    return data.choices[0].message.content
  }
}
