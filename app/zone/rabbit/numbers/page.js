'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { WinterBg } from '@/components/WinterBg'
import { speak } from '@/lib/elevenlabs'

const TOTAL = 21 // 0–20
const WORDS = ['zero','one','two','three','four','five','six','seven','eight','nine','ten',
  'eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty']

const LS_KEY = 'miniMindsCompletedNumbers'

function loadCompleted() {
  try { return new Set(JSON.parse(localStorage.getItem(LS_KEY) || '[]')) } catch { return new Set() }
}
function saveCompleted(set) {
  localStorage.setItem(LS_KEY, JSON.stringify([...set]))
}

/* ── Dot visualisation ── */
function DotGrid({ n }) {
  if (n === 0) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{
        width: 48, height: 48, borderRadius: '50%',
        border: '3px dashed #6BB8E8', opacity: 0.5,
      }} />
      <span style={{ fontSize: 13, color: '#8898A8', fontFamily: "'Fredoka', sans-serif" }}>nothing</span>
    </div>
  )
  const rows = []
  for (let i = 0; i < n; i += 5) rows.push(Math.min(5, n - i))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      {rows.map((count, ri) => (
        <div key={ri} style={{ display: 'flex', gap: 6 }}>
          {Array.from({ length: count }).map((_, di) => (
            <motion.div key={di}
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ delay: (ri * 5 + di) * 0.04, type: 'spring', stiffness: 400 }}
              style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#6BB8E8' }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

/* ── Number modal ── */
function NumberModal({ n, isCompleted, onComplete, onClose }) {
  const [speaking, setSpeaking] = useState(false)

  useEffect(() => {
    let alive = true
    setSpeaking(true)
    speak(`${n}... ${WORDS[n]}`).finally(() => { if (alive) setSpeaking(false) })
    return () => { alive = false }
  }, [n])

  async function handleSpeak() {
    if (speaking) return
    setSpeaking(true)
    await speak(`${n}... ${WORDS[n]}`)
    setSpeaking(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex',
        alignItems: 'center', justifyContent: 'center', padding: 16,
        backgroundColor: 'rgba(27,46,74,0.35)', backdropFilter: 'blur(4px)' }}
    >
      <motion.div
        initial={{ scale: 0.75, y: 40 }} animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.75, y: 40 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: '#FFFFFF', borderRadius: 28, padding: '32px 28px',
          width: '100%', maxWidth: 360,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
          fontFamily: "'Fredoka', sans-serif",
        }}
      >
        {/* Close */}
        <button onClick={onClose} style={{
          position: 'absolute' /* via wrapper */, alignSelf: 'flex-end',
          width: 36, height: 36, borderRadius: '50%', border: 'none',
          backgroundColor: '#F0F4F8', color: '#8898A8',
          fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1L13 13M13 1L1 13" stroke="#8898A8" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </button>

        {/* Large number */}
        <span style={{ fontSize: 96, fontWeight: 700, color: '#1B2E4A', lineHeight: 1 }}>{n}</span>

        {/* Word */}
        <span style={{ fontSize: 24, fontWeight: 500, color: '#8898A8', textTransform: 'capitalize' }}>
          {WORDS[n]}
        </span>

        {/* Dot visualisation */}
        <DotGrid n={n} />

        {/* Speaker */}
        <button onClick={handleSpeak} disabled={speaking}
          style={{
            width: 52, height: 52, borderRadius: '50%',
            backgroundColor: '#6BB8E8', border: 'none', cursor: speaking ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: speaking ? 0.65 : 1, transition: 'opacity 0.2s',
          }}>
          {speaking
            ? <motion.div animate={{ opacity: [1,0.3,1] }} transition={{ repeat: Infinity, duration: 0.8 }}
                style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid white', borderTopColor: 'transparent' }} />
            : <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M4 8H8L13 4V18L8 14H4V8Z" fill="white" />
                <path d="M16 7C17.5 8.5 17.5 13.5 16 15" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <path d="M18.5 5C21 7.5 21 14.5 18.5 17" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
          }
        </button>

        {/* Got it */}
        {isCompleted
          ? <div style={{
              padding: '10px 28px', borderRadius: 999, backgroundColor: '#7DC44E',
              color: 'white', fontWeight: 600, fontSize: 16,
            }}>Completed</div>
          : <button onClick={onComplete} style={{
              padding: '10px 28px', borderRadius: 999, backgroundColor: '#7DC44E',
              color: 'white', fontWeight: 600, fontSize: 16, border: 'none',
              cursor: 'pointer', minWidth: 120, minHeight: 44,
              boxShadow: '0 4px 14px rgba(125,196,78,0.4)',
            }}>Got it</button>
        }
      </motion.div>
    </motion.div>
  )
}

/* ── Checkmark SVG ── */
function Check() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
      style={{ position: 'absolute', bottom: 6, right: 6 }}>
      <circle cx="8" cy="8" r="7" fill="#6BB8E8" />
      <path d="M4.5 8L7 10.5L11.5 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ── Main page ── */
export default function NumbersPage() {
  const router = useRouter()
  const [completed, setCompleted] = useState(new Set())
  const [selected, setSelected] = useState(null)

  useEffect(() => { setCompleted(loadCompleted()) }, [])

  function handleComplete() {
    const next = new Set([...completed, selected])
    saveCompleted(next)
    setCompleted(next)
    setSelected(null)
  }

  const count = completed.size

  return (
    <div style={{ minHeight: '100dvh', fontFamily: "'Fredoka', sans-serif" }}>
      <WinterBg />

      {/* Back button */}
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
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

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '70px 20px 40px' }}>
        {/* Header */}
        <h1 style={{ textAlign: 'center', fontSize: 28, fontWeight: 700, color: '#1B2E4A', marginBottom: 8 }}>
          Numbers
        </h1>

        {/* Progress bar */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14,
            color: '#8898A8', marginBottom: 6 }}>
            <span>{count} of {TOTAL} numbers learned</span>
            <span>{Math.round((count / TOTAL) * 100)}%</span>
          </div>
          <div style={{ height: 10, borderRadius: 99, backgroundColor: '#E2EEF5', overflow: 'hidden' }}>
            <motion.div
              animate={{ width: `${(count / TOTAL) * 100}%` }}
              transition={{ duration: 0.5 }}
              style={{ height: '100%', borderRadius: 99, backgroundColor: '#6BB8E8' }}
            />
          </div>
        </div>

        {/* Number grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
          gap: 12,
        }}>
          {Array.from({ length: TOTAL }, (_, i) => {
            const done = completed.has(i)
            return (
              <motion.button
                key={i}
                onClick={() => setSelected(i)}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.025, type: 'spring', stiffness: 300 }}
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  position: 'relative',
                  minHeight: 80, borderRadius: 14,
                  backgroundColor: done ? '#E2EEF5' : '#FFFFFF',
                  border: `2px solid ${done ? '#6BB8E8' : '#E0EAF4'}`,
                  boxShadow: done ? '0 3px 12px rgba(107,184,232,0.25)' : '0 2px 8px rgba(0,0,0,0.06)',
                  fontSize: 28, fontWeight: 700,
                  color: done ? '#6BB8E8' : '#1B2E4A',
                  cursor: 'pointer', fontFamily: "'Fredoka', sans-serif",
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {i}
                {done && <Check />}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selected !== null && (
          <NumberModal
            key={selected}
            n={selected}
            isCompleted={completed.has(selected)}
            onComplete={handleComplete}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
