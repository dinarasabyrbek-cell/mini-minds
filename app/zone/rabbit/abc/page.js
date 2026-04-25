'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WinterBg } from '@/components/WinterBg'
import { letters, speakLetter } from '@/lib/letterData'
import { stopCurrent } from '@/lib/elevenlabs'
import { markLetterComplete, getCompletedLetters } from '@/lib/progress'
import { useRouter } from 'next/navigation'


function LetterModal({ data, onClose, onComplete, isCompleted }) {
  const [speaking, setSpeaking] = useState(false)

  /* Auto-speak when the modal opens; stop when it closes */
  useEffect(() => {
    let alive = true
    setSpeaking(true)
    speakLetter(data.letter, data.word).finally(() => { if (alive) setSpeaking(false) })
    return () => { alive = false; stopCurrent() }
  }, [data.letter, data.word])

  async function handleSpeak() {
    if (speaking) return
    setSpeaking(true)
    await speakLetter(data.letter, data.word)
    setSpeaking(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.7, y: 60, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.7, y: 60, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={e => e.stopPropagation()}
        className="rounded-3xl p-8 flex flex-col items-center gap-4 w-full max-w-sm relative"
        style={{ backgroundColor: '#FFFFFF', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', fontFamily: 'var(--font-fredoka), sans-serif' }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-lg font-bold"
          style={{ backgroundColor: '#F5EBE0', color: '#9C7C5A' }}
        >✕</button>

        <div className="flex gap-4 items-end">
          <span className="text-8xl font-bold leading-none" style={{ color: '#7DC44E' }}>{data.letter}</span>
          <span className="text-6xl font-bold leading-none" style={{ color: '#A8D880', marginBottom: 4 }}>{data.letter.toLowerCase()}</span>
        </div>

        <div className="text-7xl">{data.emoji}</div>

        <p className="text-2xl font-semibold text-center" style={{ color: '#2D2014' }}>
          <span style={{ color: '#7DC44E' }}>{data.letter}</span> is for <span style={{ color: '#2D2014' }}>{data.word}</span>
        </p>

        {/* Speaker button with loading state */}
        <button
          onClick={handleSpeak}
          disabled={speaking}
          className="flex items-center gap-2 px-6 py-3 rounded-full text-lg font-semibold transition-all hover:scale-105 active:scale-95"
          style={{ backgroundColor: '#B8E0F7', color: '#1B2E4A', minHeight: 48, opacity: speaking ? 0.75 : 1 }}
        >
          {speaking ? (
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              style={{ display: 'inline-block' }}
            >⏳</motion.span>
          ) : '🔊'}
          {speaking ? 'Loading...' : 'Hear the sound'}
        </button>

        {isCompleted ? (
          <div className="flex items-center gap-2 px-8 py-3 rounded-full text-lg font-semibold" style={{ backgroundColor: '#7DC44E', color: 'white' }}>
            ✓ Completed!
          </div>
        ) : (
          <button
            onClick={onComplete}
            className="px-8 py-3 rounded-full text-lg font-semibold transition-all hover:scale-105 active:scale-95"
            style={{ backgroundColor: '#7DC44E', color: 'white', minHeight: 48, boxShadow: '0 4px 16px rgba(125,196,78,0.4)' }}
          >
            Got it! ✓
          </button>
        )}
      </motion.div>
    </motion.div>
  )
}

export default function ABCPage() {
  const router = useRouter()
  const [completed, setCompleted] = useState(new Set())
  const [selected, setSelected]   = useState(null)
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    getCompletedLetters().then(list => {
      setCompleted(new Set(list))
      setLoading(false)
    })
  }, [])

  async function handleComplete(letter) {
    await markLetterComplete(letter)
    setCompleted(prev => new Set([...prev, letter]))
    setSelected(null)
  }

  const completedCount = completed.size

  return (
    <div className="min-h-screen relative" style={{ fontFamily: 'var(--font-fredoka), sans-serif' }}>
      <WinterBg />

      <div className="relative z-10 px-4 py-6 max-w-5xl mx-auto">
        <div className="mb-4">
          <button onClick={() => router.push('/zone/rabbit')} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
            borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.85)', color: '#1B2E4A',
            fontWeight: 600, fontSize: 15, border: 'none', cursor: 'pointer',
            backdropFilter: 'blur(6px)', minHeight: 44, boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8L10 13" stroke="#1B2E4A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </button>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold" style={{ color: '#1B2E4A' }}>Alphabet</h1>
          <div className="mt-4 max-w-sm mx-auto">
            <div className="flex justify-between text-sm font-semibold mb-1" style={{ color: '#1A5C00' }}>
              <span>{completedCount} / 26 letters</span>
              <span>{Math.round((completedCount / 26) * 100)}%</span>
            </div>
            <div className="h-4 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.6)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: '#7DC44E' }}
                animate={{ width: `${(completedCount / 26) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-xl" style={{ color: '#1A5C00' }}>Loading...</p>
        ) : (
          <div className="grid grid-cols-4 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {letters.map((item, i) => {
              const done = completed.has(item.letter)
              return (
                <motion.button
                  key={item.letter}
                  onClick={() => setSelected(item)}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.02, type: 'spring', stiffness: 300 }}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative flex flex-col items-center justify-center rounded-2xl aspect-square text-4xl font-bold transition-all"
                  style={{
                    backgroundColor: done ? '#7DC44E' : 'rgba(255,255,255,0.85)',
                    border: `3px solid ${done ? '#5DAD30' : 'rgba(125,196,78,0.5)'}`,
                    color: done ? '#FFFFFF' : '#2D7A10',
                    boxShadow: done ? '0 4px 12px rgba(125,196,78,0.4)' : '0 2px 8px rgba(0,0,0,0.08)',
                    fontFamily: 'var(--font-fredoka), sans-serif',
                    minHeight: 72, minWidth: 44,
                  }}
                >
                  {item.letter}
                  {done && <span className="absolute top-1 right-1 text-sm">✓</span>}
                </motion.button>
              )
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <LetterModal
            data={selected}
            onClose={() => setSelected(null)}
            onComplete={() => handleComplete(selected.letter)}
            isCompleted={completed.has(selected.letter)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
