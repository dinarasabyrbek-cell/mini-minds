'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import BackButton from '@/components/BackButton'

/* ─── Question data ─── */
const QUESTIONS = [
  { id: 1,  emojis: ['🐶','🐱','🐭','🍎'], odd: '🍎', difficulty: 'Easy'   },
  { id: 2,  emojis: ['🍎','🍊','🍋','🚗'], odd: '🚗', difficulty: 'Easy'   },
  { id: 3,  emojis: ['🔴','🔴','🔴','🔵'], odd: '🔵', difficulty: 'Easy'   },
  { id: 4,  emojis: ['🐘','🦒','🦁','🐟'], odd: '🐟', difficulty: 'Medium' },
  { id: 5,  emojis: ['✈️','🚀','🐦','🚂'], odd: '🚂', difficulty: 'Medium' },
  { id: 6,  emojis: ['🌹','🌻','🌸','🌵'], odd: '🌵', difficulty: 'Medium' },
  { id: 7,  emojis: ['🎸','🎹','🎺','👟'], odd: '👟', difficulty: 'Medium' },
  { id: 8,  emojis: ['🍎','🐜','✈️','🍊'], odd: '🍊', difficulty: 'Hard'   },
  { id: 9,  emojis: ['🐱','🚗','🎂','🌙'], odd: '🌙', difficulty: 'Hard'   },
  { id: 10, emojis: ['🔴','🍎','❤️','🍋'], odd: '🍋', difficulty: 'Hard'   },
]

const DIFF = {
  Easy:   { bg: '#DCFCE7', text: '#15803D' },
  Medium: { bg: '#FEF3C7', text: '#B45309' },
  Hard:   { bg: '#FEE2E2', text: '#B91C1C' },
}

/* ─── Helpers ─── */
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function playBeep(correct) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = correct ? 'sine' : 'triangle'
    osc.frequency.value = correct ? 880 : 200
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
    osc.start()
    osc.stop(ctx.currentTime + 0.4)
  } catch {}
}

/* ─── Room background ─── */
function RoomBg() {
  return (
    <div className="fixed inset-0 -z-10" style={{ pointerEvents: 'none' }}>
      <svg width="100%" height="100%" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <rect width="1440" height="580" fill="#FDE8C8" />
        <rect y="580" width="1440" height="320" fill="#C8956B" />
        <rect y="574" width="1440" height="12" fill="#854D0E" opacity="0.3" />
        {Array.from({ length: 20 }, (_, i) => i * 80).map((x, i) => (
          <line key={i} x1={x} y1="580" x2={x + 60} y2="900" stroke="#854D0E" strokeWidth="1.5" opacity="0.15" />
        ))}
        <rect x="120" y="80" width="220" height="290" rx="10" fill="#BAE6FD" />
        <rect x="110" y="70" width="240" height="310" rx="12" fill="none" stroke="#854D0E" strokeWidth="12" />
        <line x1="230" y1="70" x2="230" y2="380" stroke="#854D0E" strokeWidth="8" />
        <line x1="110" y1="225" x2="350" y2="225" stroke="#854D0E" strokeWidth="8" />
        <ellipse cx="1050" cy="700" rx="280" ry="110" fill="#E05C2A" opacity="0.65" />
        <rect x="600" y="80" width="160" height="120" rx="6" fill="#FFFBF5" stroke="#854D0E" strokeWidth="8" />
        <text x="680" y="152" textAnchor="middle" fontSize="48">🎨</text>
      </svg>
    </div>
  )
}

/* ─── Results screen ─── */
function ResultsScreen({ score, onReplay }) {
  const stars   = score >= 8 ? 3 : score >= 5 ? 2 : 1
  const message = score >= 8 ? 'Amazing! 🎉' : score >= 5 ? 'Good job! 👏' : 'Keep trying! 💪'

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4"
      style={{ fontFamily: 'var(--font-fredoka), sans-serif' }}>
      <RoomBg />
      <motion.div
        initial={{ opacity: 0, scale: 0.82 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        className="relative z-10 flex flex-col items-center gap-5 p-8 rounded-3xl text-center w-full max-w-sm"
        style={{ backgroundColor: 'rgba(255,255,255,0.94)', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
      >
        {/* Cat character */}
        <div style={{ width: 130, height: 130, position: 'relative' }}>
          <Image src="/characters/cat.png" alt="Cat" fill style={{ objectFit: 'contain' }} />
        </div>

        <h2 className="text-4xl font-bold" style={{ color: '#2D2014' }}>{message}</h2>
        <p className="text-2xl font-semibold" style={{ color: '#854D0E' }}>{score} / 10 correct</p>

        {/* Stars */}
        <div className="flex gap-3">
          {[1, 2, 3].map(n => (
            <motion.span
              key={n}
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: n <= stars ? 1 : 0.4, rotate: 0, opacity: n <= stars ? 1 : 0.2 }}
              transition={{ delay: 0.3 + n * 0.18, type: 'spring', stiffness: 320 }}
              style={{ fontSize: '3rem', display: 'inline-block' }}
            >⭐</motion.span>
          ))}
        </div>

        <button
          onClick={onReplay}
          className="px-10 py-4 rounded-full text-xl font-semibold text-white transition-all hover:scale-105 active:scale-95"
          style={{ backgroundColor: '#E05C2A', boxShadow: '0 4px 16px rgba(224,92,42,0.4)', minHeight: 56, minWidth: 200 }}
        >
          Play Again 🎮
        </button>
      </motion.div>
    </div>
  )
}

/* ─── Main game ─── */
export default function OddOneOut() {
  const [qIdx,     setQIdx]     = useState(0)
  const [score,    setScore]    = useState(0)
  const [answered, setAnswered] = useState(null)  // { idx, correct }
  const [done,     setDone]     = useState(false)
  const [shuffled, setShuffled] = useState([])

  const question = QUESTIONS[qIdx]

  /* reshuffle emojis each new question */
  useEffect(() => {
    setShuffled(shuffle(question.emojis))
  }, [qIdx, question.emojis])

  function handleTap(idx) {
    if (answered !== null) return
    const isCorrect = shuffled[idx] === question.odd
    playBeep(isCorrect)
    if (isCorrect) setScore(s => s + 1)
    setAnswered({ idx, correct: isCorrect })
    setTimeout(() => {
      if (qIdx >= QUESTIONS.length - 1) {
        setDone(true)
      } else {
        setQIdx(q => q + 1)
        setAnswered(null)
      }
    }, 1200)
  }

  function restart() {
    setQIdx(0)
    setScore(0)
    setAnswered(null)
    setDone(false)
    setShuffled([])
  }

  /* ── card colour logic ── */
  function cardStyle(i) {
    if (!answered) return { bg: '#FFFFFF', border: '3px solid #E5E7EB', shadow: '0 4px 16px rgba(0,0,0,0.08)' }
    const isAnsweredCard = answered.idx === i
    const isCorrectCard  = shuffled[i] === question.odd

    if (isAnsweredCard && answered.correct)
      return { bg: '#DCFCE7', border: '3px solid #22C55E', shadow: '0 4px 20px rgba(34,197,94,0.35)' }
    if (isAnsweredCard && !answered.correct)
      return { bg: '#FEE2E2', border: '3px solid #EF4444', shadow: '0 4px 20px rgba(239,68,68,0.35)' }
    if (isCorrectCard && !answered.correct)
      return { bg: '#DCFCE7', border: '3px solid #22C55E', shadow: '0 4px 20px rgba(34,197,94,0.35)' }
    return { bg: '#FFFFFF', border: '3px solid #E5E7EB', shadow: '0 4px 16px rgba(0,0,0,0.08)' }
  }

  if (done) return <ResultsScreen score={score} onReplay={restart} />
  if (!shuffled.length) return null

  const progressPct = ((qIdx + (answered ? 1 : 0)) / QUESTIONS.length) * 100

  return (
    <div className="min-h-screen relative flex flex-col" style={{ fontFamily: 'var(--font-fredoka), sans-serif' }}>
      <RoomBg />

      <div className="relative z-10 flex flex-col px-4 py-5 w-full max-w-lg mx-auto" style={{ minHeight: '100dvh' }}>

        {/* Top bar */}
        <div className="flex items-center justify-between mb-3">
          <BackButton href="/zone/cat" color="#854D0E" />
          <div className="flex items-center gap-2 px-4 py-2 rounded-full text-xl font-bold"
            style={{ backgroundColor: 'rgba(255,255,255,0.82)', color: '#2D2014' }}>
            ⭐ {score}
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-3 rounded-full mb-4 overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: '#E05C2A' }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        {/* Question meta */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-semibold" style={{ color: '#854D0E' }}>
            Question {qIdx + 1} of {QUESTIONS.length}
          </span>
          <span
            className="px-3 py-1 rounded-full text-sm font-bold"
            style={{ backgroundColor: DIFF[question.difficulty].bg, color: DIFF[question.difficulty].text }}
          >
            {question.difficulty}
          </span>
        </div>

        {/* Question text */}
        <h2 className="text-3xl font-bold text-center mb-6" style={{ color: '#2D2014' }}>
          Which one doesn&apos;t belong?
        </h2>

        {/* 2×2 card grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={qIdx}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.22 }}
            className="grid grid-cols-2 gap-4 flex-1"
          >
            {shuffled.map((emoji, i) => {
              const cs = cardStyle(i)
              return (
                <motion.button
                  key={i}
                  onClick={() => handleTap(i)}
                  whileTap={!answered ? { scale: 0.91 } : {}}
                  animate={answered?.idx === i
                    ? { scale: [1, 0.88, 1.08, 1] }
                    : { scale: 1 }
                  }
                  transition={{ duration: 0.35, type: 'spring', stiffness: 380 }}
                  className="flex items-center justify-center rounded-3xl"
                  style={{
                    backgroundColor: cs.bg,
                    border: cs.border,
                    boxShadow: cs.shadow,
                    minHeight: 130,
                    cursor: answered ? 'default' : 'pointer',
                    transition: 'background-color 0.2s, border-color 0.2s, box-shadow 0.2s',
                  }}
                >
                  <span style={{ fontSize: 64, lineHeight: 1, userSelect: 'none' }}>{emoji}</span>
                </motion.button>
              )
            })}
          </motion.div>
        </AnimatePresence>

        {/* Spacer so grid doesn't crowd the bottom edge */}
        <div style={{ height: 24 }} />
      </div>
    </div>
  )
}
