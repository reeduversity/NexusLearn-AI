'use client'

import { useState, useRef, useCallback } from 'react'
import {
  Mic,
  MicOff,
  MessageSquare,
  Clock,
  BookOpen,
  Play,
  CheckCircle2,
  XCircle,
  Sparkles,
  HelpCircle,
  Loader2,
  Trophy,
  Volume2,
  VolumeX,
  Radio,
} from 'lucide-react'

interface Question {
  q: string
  user_answer?: string
  feedback?: string
  graded_score?: number
}

interface VivaSession {
  id: string
  topic: string
  questions: Question[]
  score: number | null
  status: string
  created_at: string
}

const SUGGESTED_TOPICS = [
  { name: 'Data Structures', category: 'Computer Science', color: 'bg-blue-500' },
  { name: 'Thermodynamics', category: 'Physics', color: 'bg-orange-500' },
  { name: 'Organic Chemistry', category: 'Chemistry', color: 'bg-green-500' },
  { name: 'Calculus', category: 'Mathematics', color: 'bg-purple-500' },
  { name: 'Cell Biology', category: 'Biology', color: 'bg-rose-500' },
  { name: 'Database Management', category: 'Computer Science', color: 'bg-cyan-500' },
]

// ── Voice helpers ─────────────────────────────────────────────────────────────

function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false)

  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.95
    utterance.pitch = 1
    utterance.lang = 'en-US'
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }, [])

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }, [])

  return { speak, stop, isSpeaking }
}

function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const startRecording = useCallback(async (): Promise<void> => {
    chunksRef.current = []
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' })
    mediaRecorderRef.current = recorder
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }
    recorder.start(250)
    setIsRecording(true)
  }, [])

  const stopRecording = useCallback((): Promise<string> => {
    return new Promise((resolve, reject) => {
      const recorder = mediaRecorderRef.current
      if (!recorder) return reject(new Error('No recorder'))

      recorder.onstop = async () => {
        setIsRecording(false)
        setIsTranscribing(true)
        try {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
          const formData = new FormData()
          formData.append('file', blob, 'recording.webm')

          // Use server-side proxy to keep GROQ_API_KEY secure
          const res = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData,
          })

          if (!res.ok) throw new Error('Transcription failed')
          const data = await res.json()
          resolve(data.text || '')
        } catch (err) {
          resolve('')
          reject(err)
        } finally {
          setIsTranscribing(false)
          recorder.stream?.getTracks().forEach((t) => t.stop())
        }
      }
      recorder.stop()
    })
  }, [])

  return { isRecording, isTranscribing, startRecording, stopRecording }
}

// ── Main Component ────────────────────────────────────────────────────────────

export function VivaClient({
  initialSessions,
  userId,
}: {
  initialSessions: VivaSession[]
  userId: string
}) {
  const [sessions, setSessions] = useState<VivaSession[]>(initialSessions)
  const [activeSession, setActiveSession] = useState<VivaSession | null>(null)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answerInput, setAnswerInput] = useState('')
  const [customTopic, setCustomTopic] = useState('')
  const [isStarting, setIsStarting] = useState(false)
  const [isGrading, setIsGrading] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)
  const [voiceMode, setVoiceMode] = useState(false)
  const [ttsEnabled, setTtsEnabled] = useState(true)
  const [voiceTranscript, setVoiceTranscript] = useState('')
  const [roundtripLog, setRoundtripLog] = useState<{ transcript: string; reply: string } | null>(null)

  const { speak, stop: stopSpeak, isSpeaking } = useSpeechSynthesis()
  const { isRecording, isTranscribing, startRecording, stopRecording } = useVoiceRecorder()

  // Stats
  const totalSessions = sessions.length
  const completedSessions = sessions.filter((s) => s.status === 'completed').length
  const totalQuestions = sessions.reduce((acc, s) => acc + (s.questions?.length || 0), 0)

  // Read question aloud when voice mode is on
  const readQuestion = useCallback(
    (q: string) => {
      if (ttsEnabled && voiceMode) speak(q)
    },
    [ttsEnabled, voiceMode, speak]
  )

  async function handleStartSession(topic: string) {
    if (!topic.trim()) return
    setIsStarting(true)
    try {
      const res = await fetch('/api/viva', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim() }),
      })
      const data = await res.json()
      if (data.success && data.data) {
        setSessions((prev) => [data.data, ...prev])
        setActiveSession(data.data)
        setCurrentIdx(0)
        setAnswerInput('')
        setFeedbackMessage(null)
        const firstQ = data.data.questions?.[0]?.q
        if (firstQ) readQuestion(firstQ)
      } else {
        alert(data.error || 'Failed to start viva session')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsStarting(false)
    }
  }

  async function handleSubmitAnswer(overrideAnswer?: string) {
    const answer = overrideAnswer ?? answerInput
    if (!activeSession || !answer.trim()) return
    setIsGrading(true)
    try {
      const res = await fetch('/api/viva', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: activeSession.id,
          question_index: currentIdx,
          answer: answer.trim(),
        }),
      })
      const data = await res.json()
      if (data.success && data.data) {
        const feedback: string = data.feedback || ''
        setFeedbackMessage(feedback)
        setActiveSession(data.data.session)
        setSessions((prev) => prev.map((s) => (s.id === activeSession.id ? data.data.session : s)))
        setRoundtripLog({ transcript: answer, reply: feedback })
        if (ttsEnabled && voiceMode) speak(feedback)
      } else {
        alert(data.error || 'Failed to grade answer')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsGrading(false)
    }
  }

  // Voice roundtrip: record → transcribe → submit as answer
  async function handleVoiceAnswer() {
    if (isRecording) {
      try {
        stopSpeak()
        const transcript = await stopRecording()
        if (transcript) {
          setVoiceTranscript(transcript)
          setAnswerInput(transcript)
          await handleSubmitAnswer(transcript)
        } else {
          // STT failed — let user type manually
          setVoiceMode(false)
        }
      } catch (err) {
        console.error('Voice answer failed:', err)
        setVoiceMode(false)
      }
    } else {
      await startRecording()
    }
  }

  function handleNextQuestion() {
    setFeedbackMessage(null)
    setAnswerInput('')
    setVoiceTranscript('')
    setRoundtripLog(null)
    const nextIdx = currentIdx + 1
    setCurrentIdx(nextIdx)
    const nextQ = activeSession?.questions?.[nextIdx]?.q
    if (nextQ) readQuestion(nextQ)
  }

  // ── Active session view ────────────────────────────────────────────────────
  if (activeSession) {
    const isCompleted = activeSession.status === 'completed'
    const qList = activeSession.questions || []
    const currentQuestion = qList[currentIdx]

    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-md dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex justify-between items-center border-b border-gray-200 dark:border-zinc-800 pb-4 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <Mic className="mr-2 h-5 w-5 text-rose-500 animate-pulse" />
              Viva: {activeSession.topic}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTtsEnabled((v) => !v)}
                title={ttsEnabled ? 'Mute AI voice' : 'Unmute AI voice'}
                className={`p-1.5 rounded-lg ${ttsEnabled ? 'text-indigo-600 bg-indigo-50' : 'text-gray-400'}`}
              >
                {ttsEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>
              <button
                onClick={() => setVoiceMode((v) => !v)}
                title={voiceMode ? 'Switch to text mode' : 'Switch to voice mode'}
                className={`p-1.5 rounded-lg ${voiceMode ? 'text-rose-600 bg-rose-50' : 'text-gray-400'}`}
              >
                <Radio className="h-4 w-4" />
              </button>
              <button onClick={() => { stopSpeak(); setActiveSession(null) }} className="text-sm text-gray-500 hover:text-gray-700">
                Exit
              </button>
            </div>
          </div>

          {isCompleted ? (
            <div className="text-center space-y-6 py-8">
              <Trophy className="mx-auto h-16 w-16 text-amber-500" />
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Viva Completed!</h3>
                <p className="text-sm text-gray-500 mt-1">Your score:</p>
              </div>
              <p className="text-5xl font-extrabold text-indigo-600">{activeSession.score}%</p>
              <button
                onClick={() => { stopSpeak(); setActiveSession(null) }}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
              >
                Close Session
              </button>
            </div>
          ) : (
            currentQuestion && (
              <div className="space-y-6">
                <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-lg">
                  <p className="text-xs text-gray-400 font-semibold mb-1">
                    Question {currentIdx + 1} of {qList.length}
                  </p>
                  <p className="text-base text-gray-800 dark:text-gray-200 font-medium">
                    {currentQuestion.q}
                  </p>
                  {ttsEnabled && (
                    <button
                      onClick={() => speak(currentQuestion.q)}
                      className="mt-2 text-xs text-indigo-500 flex items-center gap-1 hover:underline"
                    >
                      <Volume2 className="h-3 w-3" /> Read aloud
                    </button>
                  )}
                </div>

                {feedbackMessage ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-lg dark:bg-rose-950/20 dark:border-rose-900/30">
                      <p className="text-xs text-rose-700 font-bold mb-1">AI Evaluation Feedback</p>
                      <p className="text-sm text-rose-800 dark:text-rose-400">{feedbackMessage}</p>
                      {isSpeaking && <p className="text-xs text-indigo-400 mt-1 animate-pulse">🔊 Reading feedback…</p>}
                    </div>
                    {roundtripLog && (
                      <div className="text-xs text-gray-400 bg-gray-50 dark:bg-zinc-800/40 rounded p-3 space-y-1">
                        <p><span className="font-medium text-gray-500">Your answer:</span> {roundtripLog.transcript}</p>
                        <p><span className="font-medium text-gray-500">AI reply:</span> {roundtripLog.reply.slice(0, 120)}…</p>
                      </div>
                    )}
                    <button
                      onClick={currentIdx < qList.length - 1 ? handleNextQuestion : () => {}}
                      className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
                    >
                      {currentIdx < qList.length - 1 ? 'Next Question' : 'Finish Viva'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Voice mode */}
                    {voiceMode ? (
                      <div className="space-y-3">
                        <button
                          onClick={handleVoiceAnswer}
                          disabled={isTranscribing || isGrading}
                          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${
                            isRecording
                              ? 'bg-red-500 text-white animate-pulse'
                              : 'bg-rose-600 text-white hover:bg-rose-700'
                          } disabled:opacity-50`}
                          id="voice-record-btn"
                        >
                          {isTranscribing ? (
                            <><Loader2 className="h-4 w-4 animate-spin" /> Transcribing…</>
                          ) : isRecording ? (
                            <><MicOff className="h-4 w-4" /> Stop Recording</>
                          ) : (
                            <><Mic className="h-4 w-4" /> Hold to Answer</>
                          )}
                        </button>
                        {voiceTranscript && (
                          <p className="text-xs text-gray-500 italic p-2 bg-gray-50 dark:bg-zinc-800 rounded">
                            🎤 &quot;{voiceTranscript}&quot;
                          </p>
                        )}
                        <button
                          onClick={() => setVoiceMode(false)}
                          className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 dark:border-zinc-700 rounded-lg"
                        >
                          Switch to Text Mode
                        </button>
                      </div>
                    ) : (
                      /* Text mode */
                      <div className="space-y-3">
                        <textarea
                          rows={4}
                          placeholder="Type your answer here…"
                          value={answerInput}
                          onChange={(e) => setAnswerInput(e.target.value)}
                          className="w-full rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                          id="viva-text-answer"
                        />
                        <div className="flex gap-2">
                          <button
                            disabled={!answerInput.trim() || isGrading}
                            onClick={() => handleSubmitAnswer()}
                            className="flex-1 py-2.5 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-700 flex items-center justify-center gap-1.5 disabled:opacity-50"
                          >
                            {isGrading && <Loader2 className="h-4 w-4 animate-spin" />}
                            Submit Response
                          </button>
                          <button
                            onClick={() => setVoiceMode(true)}
                            className="px-3 py-2.5 border border-rose-200 text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                            title="Switch to voice mode"
                          >
                            <Mic className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </div>
    )
  }

  // ── Lobby view ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center">
            <MessageSquare className="h-5 w-5 text-rose-500" />
            <div className="ml-3">
              <p className="text-sm text-gray-500">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalSessions}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <div className="ml-3">
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{completedSessions}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center">
            <HelpCircle className="h-5 w-5 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm text-gray-500">Questions Faced</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalQuestions}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-6 space-y-6">
            <div className="border-b border-gray-200 dark:border-zinc-800 pb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                <Sparkles className="mr-2 h-5 w-5 text-amber-500" />
                Launch New Viva Practice
              </h2>
              <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ttsEnabled}
                  onChange={(e) => setTtsEnabled(e.target.checked)}
                  className="rounded"
                />
                <Volume2 className="h-3.5 w-3.5" /> AI Voice
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Custom Topic
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="e.g. Memory Layouts, Quantum Physics…"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleStartSession(customTopic)}
                  className="flex-1 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 px-3 py-2.5 text-sm"
                  id="viva-topic-input"
                />
                <button
                  disabled={isStarting || !customTopic.trim()}
                  onClick={() => handleStartSession(customTopic)}
                  className="rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-rose-700 flex items-center gap-1.5 disabled:opacity-50"
                  id="start-viva-btn"
                >
                  {isStarting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Start Viva
                </button>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 mb-3">Or choose a topic:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SUGGESTED_TOPICS.map((topic) => (
                  <button
                    key={topic.name}
                    onClick={() => handleStartSession(topic.name)}
                    disabled={isStarting}
                    className="group flex items-center rounded-lg border border-gray-100 p-3.5 hover:border-rose-300 hover:bg-rose-50/50 dark:border-zinc-800 dark:hover:border-rose-800 transition-all text-left disabled:opacity-50"
                  >
                    <div className={`h-2.5 w-2.5 rounded-full ${topic.color}`} />
                    <div className="ml-3">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{topic.name}</p>
                      <p className="text-xs text-gray-400">{topic.category}</p>
                    </div>
                    <Play className="ml-auto h-4 w-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-xl border border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
              <Clock className="mr-2 h-5 w-5 text-gray-500" />
              Past Sessions
            </h2>
            <div className="space-y-3 divide-y divide-gray-100 dark:divide-zinc-800">
              {sessions.length > 0 ? (
                sessions.map((session) => (
                  <div key={session.id} className="pt-3 first:pt-0">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-semibold text-gray-800 dark:text-white truncate max-w-[120px]">
                        {session.topic}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${session.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                        {session.status === 'completed' ? `${session.score}%` : 'Pending'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(session.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-500 text-center py-6">No sessions yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
