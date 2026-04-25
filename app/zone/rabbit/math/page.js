'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { WinterBg } from '@/components/WinterBg'
import { speak } from '@/lib/elevenlabs'

const confetti = dynamic(() => import('canvas-confetti'), { ssr: false })

/* ── Star SVG ── */
function Star({ filled = true }) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M14 2L17.5 10.5L27 11.5L20.5 17.5L22.5 27L14 22.5L5.5 27L7.5 17.5L1 11.5L10.5 10.5Z"
        fill={filled ? '#F5C842' : '#E0EAF4'} stroke={filled ? '#E8A800' : '#C8D4E0'} strokeWidth="1.5" />
    </svg>
  )
}

/* ── Question generation ── */
function genQuestion(level) {
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
  let a, b, op, answer, display

  if (level === 'easy') {
    a = rand(1, 5); b = rand(1, 5)
    op = '+'
    answer = a + b
    display = `${a} + ${b} = ?`
  } else if (level === 'medium') {
    a = rand(1, 10); b = rand(1, 10)
    op = Math.random() < 0.5 ? '+' : '-'
    if (op === '-' && b > a) [a, b] = [b, a]
    answer = op === '+' ? a + b : a - b
    display = `${a} ${op} ${b} = ?`
  } else {
    a = rand(1, 20); b = rand(1, 20)
    const ops = ['+', '-', '×']
    op = ops[Math.floor(Math.random() * ops.length)]
    if (op === '-' && b > a) [a, b] = [b, a]
    if (op === '×') { a = rand(1, 10); b = rand(1, 10) }
    answer = op === '+' ? a + b : op === '-' ? a - b : a * b
    display = `${a} ${op} ${b} = ?`
  }

  /* Wrong answers: within ±5 of correct, ≥0, no duplicates, no equal to answer */
  const wrongs = new Set()
  while (wrongs.size < 3) {
    const w = answer + (Math.random() < 0.5 ? 1 : -1) * rand(1, 5)
    if (w >= 0 && w !== answer && !wrongs.has(w)) wrongs.add(w)
  }

  const choices = [answer, ...[...wrongs]]
  // Shuffle
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]]
  }

  return { display, answer, choices }
}

function genGame(level) {
  return Array.from({ length: 10 }, () => genQuestion(level))
}

/* ── Level selection ── */
const LEVELS = [
  { id: 'easy',   label: 'Easy',   color: '#7DC44E', stars: 1,
    desc: 'Numbers 1 to 5, addition only' },
  { id: 'medium', label: 'Medium', color: '#F5A030', stars: 2,
    desc: 'Numbers 1 to 10, addition and subtraction' },
  { id: 'hard',   label: 'Hard',   color: '#E05C2A', stars: 3,
    desc: 'Numbers 1 to 20, addition, subtraction and multiplication' },
]

function LevelSelect({ onSelect }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 20, padding: '0 20px', maxWidth: 480, margin: '0 auto' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1B2E4A',
        textAlign: 'center', marginBottom: 8 }}>Choose a level</h1>
      {LEVELS.map(lv => (
        <motion.button
          key={lv.id}
          onClick={() => onSelect(lv.id)}
          whileHover={{ scale: 1.04, y: -4 }}
          whileTap={{ scale: 0.97 }}
          style={{
            width: '100%', padding: '20px 24px', borderRadius: 24,
            backgroundColor: '#FFFFFF', border: 'none',
            borderBottom: `4px solid ${lv.color}`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8,
            fontFamily: "'Fredoka', sans-serif",
          }}
        >
          <div style={{ display: 'flex', gap: 4 }}>
            {Array.from({ length: lv.stars }).map((_, i) => <Star key={i} filled />)}
            {Array.from({ length: 3 - lv.stars }).map((_, i) => <Star key={i} filled={false} />)}
          </div>
          <span style={{ fontSize: 22, fontWeight: 700, color: lv.color }}>{lv.label}</span>
          <span style={{ fontSize: 14, color: '#8898A8' }}>{lv.desc}</span>
        </motion.button>
      ))}
    </div>
  )
}

/* ── Answer button colours ── */
const BTN_CLR = ['#E8F5E2', '#E2EEF5', '#E8F5E2', '#E2EEF5']
const BTN_TXT = ['#2D7A10', '#1B5E8A', '#2D7A10', '#1B5E8A']

/* ── Results screen ── */
function Results({ score, name, level, onReplay, onChangeLevel, onBack }) {
  const stars = score >= 9 ? 3 : score >= 6 ? 2 : 1

  useEffect(() => {
    if (stars === 3) {
      import('canvas-confetti').then(m => {
        m.default({ particleCount: 120, spread: 80, origin: { y: 0.55 } })
      })
    }
  }, [stars])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 20, padding: '0 24px', maxWidth: 400, margin: '0 auto', textAlign: 'center' }}>
      <h1 style={{ fontSize: 30, fontWeight: 700, color: '#1B2E4A' }}>
        Great job, {name}!
      </h1>
      <p style={{ fontSize: 48, fontWeight: 700, color: '#1B2E4A' }}>{score} out of 10</p>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        {Array.from({ length: 3 }).map((_, i) => <Star key={i} filled={i < stars} />)}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
        <button onClick={onReplay} style={{
          padding: '12px 28px', borderRadius: 999, backgroundColor: '#7DC44E',
          color: 'white', fontWeight: 600, fontSize: 16, border: 'none', cursor: 'pointer', minHeight: 48,
        }}>Play Again</button>
        <button onClick={onChangeLevel} style={{
          padding: '12px 28px', borderRadius: 999, backgroundColor: 'transparent',
          color: '#F5A030', fontWeight: 600, fontSize: 16,
          border: '2px solid #F5A030', cursor: 'pointer', minHeight: 48,
        }}>Change Level</button>
        <button onClick={onBack} style={{
          padding: '12px 28px', borderRadius: 999, backgroundColor: 'transparent',
          color: '#1B2E4A', fontWeight: 600, fontSize: 16,
          border: '2px solid #1B2E4A', cursor: 'pointer', minHeight: 48,
        }}>Back to Learning</button>
      </div>
    </div>
  )
}

/* ── Game screen ── */
function Game({ level, name, onDone, onChangeLevel }) {
  const [questions]          = useState(() => genGame(level))
  const [qIdx, setQIdx]      = useState(0)
  const [score, setScore]    = useState(0)
  const [answered, setAnswered] = useState(null) // { idx, correct }
  const [done, setDone]      = useState(false)

  const q = questions[qIdx]

  function handleAnswer(choice, idx) {
    if (answered) return
    const correct = choice === q.answer
    setAnswered({ idx, correct })
    if (correct) {
      setScore(s => s + 1)
      speak(`Correct! Well done ${name}!`)
    }
    const delay = correct ? 1000 : 1500
    setTimeout(() => {
      if (qIdx >= 9) setDone(true)
      else { setQIdx(i => i + 1); setAnswered(null) }
    }, delay)
  }

  if (done) return (
    <Results score={score} name={name} level={level}
      onReplay={() => { setQIdx(0); setScore(0); setAnswered(null); setDone(false) }}
      onChangeLevel={onChangeLevel}
      onBack={onDone}
    />
  )

  function btnBg(idx) {
    if (!answered) return BTN_CLR[idx]
    const isThis = answered.idx === idx
    const isCorrectBtn = q.choices[idx] === q.answer
    if (isThis && answered.correct) return '#7DC44E'
    if (isThis && !answered.correct) return '#FFCCCC'
    if (isCorrectBtn && !answered.correct) return '#7DC44E'
    return BTN_CLR[idx]
  }
  function btnTxt(idx) {
    if (!answered) return BTN_TXT[idx]
    const isThis = answered.idx === idx
    const isCorrectBtn = q.choices[idx] === q.answer
    if ((isThis && answered.correct) || (isCorrectBtn && !answered.correct)) return 'white'
    if (isThis && !answered.correct) return '#B91C1C'
    return BTN_TXT[idx]
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 20px',
      display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Progress */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14,
          color: '#8898A8', marginBottom: 6, fontFamily: "'Fredoka', sans-serif" }}>
          <span>Question {qIdx + 1} of 10</span>
          <span style={{ color: '#1B2E4A', fontWeight: 600 }}>Score: {score}</span>
        </div>
        <div style={{ height: 8, borderRadius: 99, backgroundColor: '#E0EAF4', overflow: 'hidden' }}>
          <motion.div animate={{ width: `${((qIdx + (answered ? 1 : 0)) / 10) * 100}%` }}
            transition={{ duration: 0.4 }}
            style={{ height: '100%', borderRadius: 99, backgroundColor: '#1B2E4A' }} />
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div key={qIdx}
          initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.22 }}
          style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 56, fontWeight: 700, color: '#1B2E4A',
            fontFamily: "'Fredoka', sans-serif", margin: 0 }}>
            {q.display}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Answer buttons 2x2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {q.choices.map((choice, idx) => (
          <motion.button
            key={`${qIdx}-${idx}`}
            onClick={() => handleAnswer(choice, idx)}
            disabled={!!answered}
            whileHover={!answered ? { scale: 1.05 } : {}}
            whileTap={!answered ? { scale: 0.97 } : {}}
            style={{
              minHeight: 90, borderRadius: 16, border: 'none',
              backgroundColor: btnBg(idx), color: btnTxt(idx),
              fontSize: 28, fontWeight: 700, cursor: answered ? 'default' : 'pointer',
              transition: 'background-color 0.25s, color 0.25s',
              fontFamily: "'Fredoka', sans-serif",
            }}>
            {choice}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

/* ── Page ── */
export default function MathPage() {
  const router = useRouter()
  const [name, setName] = useState('Friend')
  const [level, setLevel] = useState(null)

  useEffect(() => { setName(localStorage.getItem('miniMindsName') || 'Friend') }, [])

  return (
    <div style={{ minHeight: '100dvh', fontFamily: "'Fredoka', sans-serif" }}>
      <WinterBg />

      {/* Back button */}
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
        <button onClick={() => level ? setLevel(null) : router.push('/zone/rabbit')}
          style={{
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

      <div style={{ paddingTop: 80, paddingBottom: 40 }}>
        <AnimatePresence mode="wait">
          {!level
            ? <motion.div key="levels" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <LevelSelect onSelect={setLevel} />
              </motion.div>
            : <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Game key={level} level={level} name={name}
                  onDone={() => router.push('/zone/rabbit')}
                  onChangeLevel={() => setLevel(null)} />
              </motion.div>
          }
        </AnimatePresence>
      </div>
    </div>
  )
}
