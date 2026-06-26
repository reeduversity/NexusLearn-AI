'use client'

import React, { useState } from 'react'
import { Globe2, MessageCircle, Send, CheckCircle2, Languages, Loader2, RefreshCw } from 'lucide-react'
import clsx from 'clsx'

const LANGUAGES = [
  { id: 'Spanish', label: 'Spanish 🇪🇸' },
  { id: 'French', label: 'French 🇫🇷' },
  { id: 'German', label: 'German 🇩🇪' },
  { id: 'Hindi', label: 'Hindi 🇮🇳' },
  { id: 'Japanese', label: 'Japanese 🇯🇵' }
]

export default function LanguageCompanionPage() {
  const [targetLang, setTargetLang] = useState('Spanish')
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userText = input.trim()
    setInput('')
    
    // Add user message optimistically
    const newMsg = { id: Date.now(), role: 'user', text: userText, analysis: null }
    setMessages(prev => [...prev, newMsg])
    setIsTyping(true)

    try {
      const response = await fetch('/api/language', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: userText, targetLanguage: targetLang })
      })

      const json = await response.json()
      if (!response.ok) throw new Error(json.error)

      setMessages(prev => prev.map(m => m.id === newMsg.id ? { ...m, analysis: json.data } : m))
      
      // Add Bot reply
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'bot', text: json.data.reply }])

    } catch (error: any) {
      console.error(error)
      alert("Failed to get response")
    } finally {
      setIsTyping(false)
    }
  }

  const resetChat = () => {
    setMessages([])
    setInput('')
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 space-y-8 animate-in fade-in zoom-in duration-500 h-[calc(100vh-100px)] flex flex-col">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm shrink-0">
        <div className="flex items-center">
          <div className="inline-flex items-center justify-center p-3 bg-orange-100 dark:bg-orange-900/30 rounded-2xl mr-4 shadow-sm">
            <Globe2 className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">AI Language Tutor</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Practice your speaking and grammar with AI</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select 
            value={targetLang}
            onChange={(e) => { setTargetLang(e.target.value); resetChat(); }}
            className="bg-gray-100 dark:bg-zinc-800 border-transparent focus:border-orange-500 focus:bg-white dark:focus:bg-zinc-900 rounded-xl px-4 py-2 font-bold text-gray-700 dark:text-gray-300 outline-none"
          >
            {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
          </select>
          <button onClick={resetChat} className="p-2 text-gray-400 hover:text-orange-500 transition-colors">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-xl overflow-hidden flex flex-col min-h-0">
        
        {/* Chat Area */}
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-6">
          
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 dark:text-gray-500">
              <Languages className="w-16 h-16 opacity-30 mb-4" />
              <h3 className="text-xl font-bold mb-2 text-gray-600 dark:text-gray-300">Start a conversation</h3>
              <p className="max-w-sm text-sm">Type in English to get a translation, or practice typing in {targetLang} to get grammar corrections!</p>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={clsx("flex flex-col max-w-[85%]", msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start")}>
              <div className={clsx(
                "p-4 rounded-2xl",
                msg.role === 'user' 
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-tr-sm" 
                  : "bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 rounded-tl-sm"
              )}>
                {msg.text}
              </div>
              
              {/* Analysis Block (Only for user messages after they are processed) */}
              {msg.role === 'user' && msg.analysis && (
                <div className="mt-2 mr-2 p-3 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-100 dark:border-orange-900/30 text-sm w-[90%] md:w-[70%]">
                  <div className="flex items-center text-orange-800 dark:text-orange-300 font-bold mb-1">
                    <CheckCircle2 className="w-4 h-4 mr-1" /> Grammar Check
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-2 italic">"{msg.analysis.correction}"</p>
                  
                  <div className="flex items-center text-orange-800 dark:text-orange-300 font-bold mb-1">
                    <Globe2 className="w-4 h-4 mr-1" /> Translation
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">{msg.analysis.translation}</p>
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="bg-gray-100 dark:bg-zinc-800 text-gray-500 max-w-[85%] rounded-2xl p-4 mr-auto rounded-tl-sm flex items-center">
              <Loader2 className="w-4 h-4 animate-spin mr-2" /> Typing...
            </div>
          )}
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="p-4 bg-gray-50 dark:bg-zinc-800/50 border-t border-gray-100 dark:border-zinc-800">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={`Say something in English or ${targetLang}...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 focus:border-orange-500 focus:ring-0 px-5 py-4 outline-none text-gray-800 dark:text-gray-100 shadow-sm"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-2xl transition-colors disabled:opacity-50 flex items-center justify-center shadow-lg shadow-orange-500/30 hover:-translate-y-0.5"
            >
              <Send className="w-6 h-6 ml-1" />
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}
