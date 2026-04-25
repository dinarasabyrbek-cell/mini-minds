'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { WinterBg } from '@/components/WinterBg'
import { letters } from '@/lib/letterData'
import { speak } from '@/lib/elevenlabs'

const C = 600 // canvas internal resolution

/* ── Number SVG paths (0-9) as SVG text in a clean path style ── */
const NUMBER_LABELS = ['zero','one','two','three','four','five','six','seven','eight','nine']

function getPos(e, canvas) {
  const rect = canvas.getBoundingClientRect()
  const src = e.touches ? e.touches[0] : e
  return {
    x: (src.clientX - rect.left)  * (C / rect.width),
    y: (src.clientY - rect.top)   * (C / rect.height),
  }
}

/* ── Letter tracing canvas ── */
function LetterCanvas({ letter, onClear, lastClear }) {
  const canvasRef = useRef(null)
  const drawing = useRef(false)
  const lastPos = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) canvas.getContext('2d').clearRect(0, 0, C, C)
    drawing.current = false; lastPos.current = null
  }, [letter, lastClear])

  const startDraw = useCallback(e => {
    e.preventDefault(); drawing.current = true
    const pos = getPos(e, canvasRef.current)
    lastPos.current = pos
    canvasRef.current.getContext('2d').beginPath()
    canvasRef.current.getContext('2d').moveTo(pos.x, pos.y)
  }, [])

  const draw = useCallback(e => {
    e.preventDefault()
    if (!drawing.current) return
    const canvas = canvasRef.current; const ctx = canvas.getContext('2d')
    const pos = getPos(e, canvas)
    ctx.strokeStyle = '#F97316'; ctx.lineWidth = 18
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'
    if (lastPos.current) {
      const mid = { x: (lastPos.current.x + pos.x) / 2, y: (lastPos.current.y + pos.y) / 2 }
      ctx.quadraticCurveTo(lastPos.current.x, lastPos.current.y, mid.x, mid.y)
      ctx.stroke(); ctx.beginPath(); ctx.moveTo(mid.x, mid.y)
    }
    lastPos.current = pos
  }, [])

  const stopDraw = useCallback(() => { drawing.current = false; lastPos.current = null }, [])

  return (
    <div style={{ position: 'relative', width: 'min(520px, calc(100vw - 160px))',
      aspectRatio: '1', borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.88)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.10)', overflow: 'hidden' }}>
      {/* Dotted letter guide */}
      <svg viewBox={`0 0 ${C} ${C}`} width="100%" height="100%"
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', userSelect: 'none' }}>
        <text x={C/2} y={C*0.82} textAnchor="middle" fontSize={C*0.86}
          fontFamily="Fredoka, 'Fredoka One', sans-serif" fontWeight="700"
          fill="none" stroke="#D1D5DB" strokeWidth="7"
          strokeDasharray="22 14" strokeLinecap="round">
          {letter}
        </text>
      </svg>
      <canvas ref={canvasRef} width={C} height={C}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%',
          touchAction: 'none', cursor: 'crosshair' }}
        onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
        onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
      />
    </div>
  )
}

/* ── Number tracing canvas (same canvas, different SVG guide) ── */
function NumberCanvas({ num, onClear, lastClear }) {
  const canvasRef = useRef(null)
  const drawing = useRef(false)
  const lastPos = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) canvas.getContext('2d').clearRect(0, 0, C, C)
    drawing.current = false; lastPos.current = null
  }, [num, lastClear])

  const startDraw = useCallback(e => {
    e.preventDefault(); drawing.current = true
    const pos = getPos(e, canvasRef.current)
    lastPos.current = pos
  }, [])

  const draw = useCallback(e => {
    e.preventDefault()
    if (!drawing.current) return
    const canvas = canvasRef.current; const ctx = canvas.getContext('2d')
    const pos = getPos(e, canvas)
    ctx.strokeStyle = '#F97316'; ctx.lineWidth = 18
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'
    if (lastPos.current) {
      const mid = { x: (lastPos.current.x + pos.x) / 2, y: (lastPos.current.y + pos.y) / 2 }
      ctx.quadraticCurveTo(lastPos.current.x, lastPos.current.y, mid.x, mid.y)
      ctx.stroke(); ctx.beginPath(); ctx.moveTo(mid.x, mid.y)
    }
    lastPos.current = pos
  }, [])

  const stopDraw = useCallback(() => { drawing.current = false; lastPos.current = null }, [])

  return (
    <div style={{ position: 'relative', width: 'min(520px, calc(100vw - 160px))',
      aspectRatio: '1', borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.88)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.10)', overflow: 'hidden' }}>
      <svg viewBox={`0 0 ${C} ${C}`} width="100%" height="100%"
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', userSelect: 'none' }}>
        <text x={C/2} y={C*0.82} textAnchor="middle" fontSize={C*0.86}
          fontFamily="Fredoka, 'Fredoka One', sans-serif" fontWeight="700"
          fill="none" stroke="#D1D5DB" strokeWidth="7"
          strokeDasharray="22 14" strokeLinecap="round">
          {num}
        </text>
      </svg>
      <canvas ref={canvasRef} width={C} height={C}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%',
          touchAction: 'none', cursor: 'crosshair' }}
        onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
        onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
      />
    </div>
  )
}

/* ── Back button ── */
function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{
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
  )
}

/* ── Nav arrow button ── */
function NavBtn({ direction, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: 52, height: 52, borderRadius: '50%', border: 'none',
      backgroundColor: 'rgba(255,255,255,0.85)', color: '#1B2E4A',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', flexShrink: 0,
    }}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        {direction === 'left'
          ? <path d="M13 4L7 10L13 16" stroke="#1B2E4A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          : <path d="M7 4L13 10L7 16" stroke="#1B2E4A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        }
      </svg>
    </button>
  )
}

/* ── Main page ── */
export default function TracingPage() {
  const router = useRouter()
  const [mode, setMode]       = useState('letters') // 'letters' | 'numbers'
  const [letterIdx, setLetterIdx] = useState(0)
  const [numIdx, setNumIdx]   = useState(0)
  const [clearKey, setClearKey] = useState(0)

  const currentLetter = letters[letterIdx].letter
  const currentNum    = numIdx

  useEffect(() => {
    if (mode === 'letters') {
      speak(`${currentLetter}... ${currentLetter} is for ${letters[letterIdx].word}`)
    } else {
      speak(`${currentNum}... ${NUMBER_LABELS[currentNum]}`)
    }
  }, [mode, letterIdx, numIdx])

  function clear() { setClearKey(k => k + 1) }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      fontFamily: "'Fredoka', sans-serif" }}>
      <WinterBg />

      {/* Top bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px' }}>
        <BackBtn onClick={() => router.push('/zone/rabbit')} />

        {/* Mode toggle */}
        <div style={{ display: 'flex', borderRadius: 999, overflow: 'hidden',
          border: '2px solid #1B2E4A', backgroundColor: 'rgba(255,255,255,0.85)' }}>
          {['letters','numbers'].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              padding: '8px 18px', border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 600,
              fontFamily: "'Fredoka', sans-serif",
              backgroundColor: mode === m ? '#1B2E4A' : 'transparent',
              color: mode === m ? 'white' : '#1B2E4A',
              transition: 'background-color 0.2s',
              minHeight: 40,
            }}>
              {m === 'letters' ? 'Letters' : 'Numbers'}
            </button>
          ))}
        </div>

        <span style={{ color: '#1B2E4A', fontWeight: 700, fontSize: 18 }}>
          {mode === 'letters' ? `${letterIdx + 1} / 26` : `${numIdx + 1} / 10`}
        </span>
      </div>

      {/* Label */}
      <div style={{ position: 'absolute', top: 78, left: 0, right: 0,
        display: 'flex', justifyContent: 'center', zIndex: 5 }}>
        <motion.span key={mode === 'letters' ? currentLetter : currentNum}
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          style={{ fontSize: 22, fontWeight: 700, color: '#1B2E4A',
            fontFamily: "'Fredoka', sans-serif" }}>
          {mode === 'letters'
            ? `${currentLetter} is for ${letters[letterIdx].word}`
            : `${currentNum} — ${NUMBER_LABELS[currentNum]}`
          }
        </motion.span>
      </div>

      {/* Drawing area */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 16, padding: '110px 16px 8px' }}>
        {mode === 'letters'
          ? <NavBtn direction="left" onClick={() => setLetterIdx(i => (i - 1 + 26) % 26)} />
          : <NavBtn direction="left" onClick={() => setNumIdx(i => (i - 1 + 10) % 10)} />
        }

        {mode === 'letters'
          ? <LetterCanvas letter={currentLetter} lastClear={clearKey} />
          : <NumberCanvas num={currentNum} lastClear={clearKey} />
        }

        {mode === 'letters'
          ? <NavBtn direction="right" onClick={() => setLetterIdx(i => (i + 1) % 26)} />
          : <NavBtn direction="right" onClick={() => setNumIdx(i => (i + 1) % 10)} />
        }
      </div>

      {/* Bottom buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, padding: '12px 16px 24px' }}>
        <button onClick={clear} style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px',
          borderRadius: 999, border: 'none', cursor: 'pointer', minHeight: 48, minWidth: 120,
          backgroundColor: '#FFE2E2', color: '#B91C1C', fontWeight: 600, fontSize: 16,
          fontFamily: "'Fredoka', sans-serif",
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 2L14 14M14 2L2 14" stroke="#B91C1C" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          Clear
        </button>
        <button
          onClick={() => {
            if (mode === 'letters') setLetterIdx(i => (i + 1) % 26)
            else setNumIdx(i => (i + 1) % 10)
          }}
          style={{
            padding: '10px 28px', borderRadius: 999, border: 'none', cursor: 'pointer',
            minHeight: 48, minWidth: 160,
            backgroundColor: '#7DC44E', color: 'white', fontWeight: 600, fontSize: 16,
            boxShadow: '0 4px 14px rgba(125,196,78,0.4)',
            fontFamily: "'Fredoka', sans-serif",
          }}>
          Next
        </button>
      </div>
    </div>
  )
}
