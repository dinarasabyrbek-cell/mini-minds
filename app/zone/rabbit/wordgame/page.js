'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  DndContext, useDraggable, useDroppable,
  PointerSensor, TouchSensor, useSensors, useSensor,
} from '@dnd-kit/core'
import { WinterBg } from '@/components/WinterBg'
import { speak } from '@/lib/elevenlabs'

/* ══════════════════════════════════════════
   SVG ILLUSTRATIONS (flat, chunky, no gradients)
══════════════════════════════════════════ */

function CarSVG() {
  return (
    <svg viewBox="0 0 180 180" width="180" height="180" xmlns="http://www.w3.org/2000/svg">
      <rect x="15" y="75" width="150" height="65" rx="18" fill="#EF4444" />
      <rect x="35" y="48" width="100" height="48" rx="14" fill="#DC2626" />
      <rect x="42" y="55" width="86" height="34" rx="8" fill="#BAE6FD" />
      <circle cx="45" cy="148" r="20" fill="#1F2937" />
      <circle cx="45" cy="148" r="9"  fill="#6B7280" />
      <circle cx="135" cy="148" r="20" fill="#1F2937" />
      <circle cx="135" cy="148" r="9"  fill="#6B7280" />
    </svg>
  )
}

function CatSVG() {
  return (
    <svg viewBox="0 0 180 180" width="180" height="180" xmlns="http://www.w3.org/2000/svg">
      <polygon points="32,72 50,20 70,72" fill="#F97316" />
      <polygon points="38,68 50,28 65,68" fill="#FBBF24" />
      <polygon points="110,72 130,20 148,72" fill="#F97316" />
      <polygon points="115,68 130,28 143,68" fill="#FBBF24" />
      <circle cx="90" cy="110" r="62" fill="#F97316" />
      <ellipse cx="68" cy="98" rx="9" ry="11" fill="#1F2937" />
      <ellipse cx="112" cy="98" rx="9" ry="11" fill="#1F2937" />
      <ellipse cx="90" cy="118" rx="7" ry="5" fill="#FCA5A5" />
      <path d="M78,128 Q90,138 102,128" fill="none" stroke="#1F2937" strokeWidth="2.5" strokeLinecap="round" />
      {[-28,-12,12,28].map((x,i) => <line key={i} x1={90+x} y1="118" x2={90+(x>0?x+28:x-28)} y2="118"
        stroke="#1F2937" strokeWidth="2" strokeLinecap="round" />)}
    </svg>
  )
}

function DogSVG() {
  return (
    <svg viewBox="0 0 180 180" width="180" height="180" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="36" cy="108" rx="24" ry="40" fill="#78350F" />
      <ellipse cx="144" cy="108" rx="24" ry="40" fill="#78350F" />
      <circle cx="90" cy="100" r="60" fill="#92400E" />
      <ellipse cx="68" cy="88" rx="9" ry="11" fill="#1F2937" />
      <ellipse cx="112" cy="88" rx="9" ry="11" fill="#1F2937" />
      <ellipse cx="90" cy="114" rx="14" ry="10" fill="#7C2D12" />
      <rect x="82" y="122" width="16" height="12" rx="4" fill="#F87171" />
    </svg>
  )
}

function SunSVG() {
  return (
    <svg viewBox="0 0 180 180" width="180" height="180" xmlns="http://www.w3.org/2000/svg">
      <circle cx="90" cy="90" r="42" fill="#FCD34D" />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * 45 - 90) * Math.PI / 180
        const x1 = 90 + 50 * Math.cos(a), y1 = 90 + 50 * Math.sin(a)
        const x2 = 90 + 72 * Math.cos(a), y2 = 90 + 72 * Math.sin(a)
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="#F59E0B" strokeWidth="9" strokeLinecap="round" />
      })}
    </svg>
  )
}

function HatSVG() {
  return (
    <svg viewBox="0 0 180 180" width="180" height="180" xmlns="http://www.w3.org/2000/svg">
      <rect x="50" y="28" width="80" height="100" rx="8" fill="#1F2937" />
      <rect x="22" y="122" width="136" height="22" rx="8" fill="#1F2937" />
      <rect x="50" y="28" width="80" height="14" rx="6" fill="#374151" />
    </svg>
  )
}

function CupSVG() {
  return (
    <svg viewBox="0 0 180 180" width="180" height="180" xmlns="http://www.w3.org/2000/svg">
      <path d="M32,52 L148,52 L134,152 L46,152 Z" fill="#3B82F6" />
      <path d="M148,78 Q178,78 178,115 Q178,152 148,152" fill="none" stroke="#2563EB" strokeWidth="14" strokeLinecap="round" />
      <path d="M60,30 Q65,18 70,30" fill="none" stroke="#93C5FD" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M85,22 Q90,10 95,22" fill="none" stroke="#93C5FD" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M110,30 Q115,18 120,30" fill="none" stroke="#93C5FD" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  )
}

function BeeSVG() {
  return (
    <svg viewBox="0 0 180 180" width="180" height="180" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="72" cy="65" rx="30" ry="18" fill="#BAE6FD" opacity="0.85" />
      <ellipse cx="108" cy="65" rx="30" ry="18" fill="#BAE6FD" opacity="0.85" />
      <ellipse cx="90" cy="112" rx="42" ry="56" fill="#FCD34D" />
      {[82,100,118].map((y,i) => <rect key={i} x="48" y={y} width="84" height="12" rx="5" fill="#1F2937" />)}
      <ellipse cx="74" cy="85" rx="7" ry="8" fill="#1F2937" />
      <ellipse cx="106" cy="85" rx="7" ry="8" fill="#1F2937" />
      <line x1="80" y1="60" x2="68" y2="42" stroke="#1F2937" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="65" cy="40" r="4" fill="#1F2937" />
      <line x1="100" y1="60" x2="112" y2="42" stroke="#1F2937" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="115" cy="40" r="4" fill="#1F2937" />
    </svg>
  )
}

function EggSVG() {
  return (
    <svg viewBox="0 0 180 180" width="180" height="180" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="90" cy="168" rx="42" ry="10" fill="#E5E7EB" />
      <ellipse cx="90" cy="88" rx="56" ry="72" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="4" />
    </svg>
  )
}

function JarSVG() {
  return (
    <svg viewBox="0 0 180 180" width="180" height="180" xmlns="http://www.w3.org/2000/svg">
      <rect x="42" y="52" width="96" height="110" rx="22" fill="#A7F3D0" />
      <rect x="48" y="38" width="84" height="20" rx="8" fill="#6EE7B7" />
      <rect x="55" y="30" width="70" height="12" rx="5" fill="#34D399" />
      <ellipse cx="90" cy="52" rx="38" ry="9" fill="#6EE7B7" opacity="0.7" />
    </svg>
  )
}

function AntSVG() {
  return (
    <svg viewBox="0 0 180 180" width="180" height="180" xmlns="http://www.w3.org/2000/svg">
      <circle cx="128" cy="90"  r="18" fill="#1F2937" />
      <circle cx="90"  cy="95"  r="16" fill="#1F2937" />
      <circle cx="52"  cy="95"  r="22" fill="#1F2937" />
      {[[-14,-18],[8,-22],[20,-10],[-14,18],[8,22],[20,10]].map(([dx,dy],i) => (
        <line key={i} x1={90} y1={95} x2={90+dx*3} y2={95+dy*2}
          stroke="#1F2937" strokeWidth="4" strokeLinecap="round" />
      ))}
      <line x1="128" y1="74" x2="118" y2="56" stroke="#1F2937" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="116" cy="53" r="4" fill="#1F2937" />
      <line x1="128" y1="74" x2="140" y2="56" stroke="#1F2937" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="142" cy="53" r="4" fill="#1F2937" />
    </svg>
  )
}

/* ══════════════════════════════════════════
   WORD DATA
══════════════════════════════════════════ */
const WORD_LIST = [
  { word: 'CAR', SVG: CarSVG },
  { word: 'CAT', SVG: CatSVG },
  { word: 'DOG', SVG: DogSVG },
  { word: 'SUN', SVG: SunSVG },
  { word: 'HAT', SVG: HatSVG },
  { word: 'CUP', SVG: CupSVG },
  { word: 'BEE', SVG: BeeSVG },
  { word: 'EGG', SVG: EggSVG },
  { word: 'JAR', SVG: JarSVG },
  { word: 'ANT', SVG: AntSVG },
]

const ALL_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildTray(correct) {
  const correctSet = new Set(correct)
  const pool = ALL_LETTERS.filter(l => !correctSet.has(l))
  const wrongs = shuffle(pool).slice(0, 2)
  return shuffle([...correct, ...wrongs]).map((l, i) => ({ id: `tile-${i}-${l}`, letter: l }))
}

/* ── Draggable tile ── */
function DragTile({ id, letter, disabled }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id, disabled })
  return (
    <div ref={setNodeRef} {...attributes} {...listeners}
      style={{
        width: 64, height: 64, borderRadius: 12,
        backgroundColor: isDragging ? '#E2EEF5' : '#FFFFFF',
        border: '2px solid #E0EAF4',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 28, fontWeight: 700, color: '#1B2E4A',
        fontFamily: "'Fredoka', sans-serif",
        boxShadow: isDragging ? '0 8px 24px rgba(0,0,0,0.18)' : '0 2px 8px rgba(0,0,0,0.08)',
        cursor: disabled ? 'default' : 'grab',
        transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
        zIndex: isDragging ? 50 : 1,
        opacity: disabled ? 0.35 : 1,
        touchAction: 'none',
        userSelect: 'none',
      }}>
      {letter}
    </div>
  )
}

/* ── Droppable slot ── */
function DropSlot({ id, filled, flashRed }) {
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <div ref={setNodeRef} style={{
      width: 70, height: 70, borderRadius: 12,
      backgroundColor: flashRed ? '#FFE2E2' : filled ? '#E8F5E2' : 'white',
      border: `2px ${filled ? 'solid' : 'dashed'} ${flashRed ? '#EF4444' : filled ? '#7DC44E' : '#C0C8D4'}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 28, fontWeight: 700, color: '#1B2E4A',
      fontFamily: "'Fredoka', sans-serif",
      transition: 'background-color 0.2s, border-color 0.2s',
      outline: isOver ? '2px solid #6BB8E8' : 'none',
    }}>
      {filled || ''}
    </div>
  )
}

/* ══════════════════════════════════════════
   GAME SCREEN
══════════════════════════════════════════ */
function WordGame({ words, name, onDone }) {
  const [wIdx, setWIdx]     = useState(0)
  const [tray, setTray]     = useState([])
  const [slots, setSlots]   = useState(['', '', ''])
  const [flash, setFlash]   = useState([false, false, false])
  const [allDone, setAllDone] = useState(false)

  const word = words[wIdx]
  const letters = word.word.split('')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 80, tolerance: 6 } }),
  )

  useEffect(() => {
    setTray(buildTray(letters))
    setSlots(['', '', ''])
    setFlash([false, false, false])
  }, [wIdx])

  function handleDragEnd({ active, over }) {
    if (!over) return
    const tileId = active.id
    const tile = tray.find(t => t.id === tileId)
    if (!tile) return
    const slotIdx = parseInt(over.id.replace('slot-', ''))

    const correct = tile.letter === letters[slotIdx]
    if (correct) {
      const newSlots = [...slots]
      newSlots[slotIdx] = tile.letter
      setSlots(newSlots)
      setTray(prev => prev.filter(t => t.id !== tileId))

      // Check win
      const newAll = newSlots.every((s, i) => s === letters[i])
      if (newAll) {
        speak(word.word.toLowerCase())
        import('canvas-confetti').then(m =>
          m.default({ particleCount: 80, spread: 60, origin: { y: 0.6 } })
        )
        setTimeout(() => {
          if (wIdx >= words.length - 1) setAllDone(true)
          else setWIdx(i => i + 1)
        }, 1500)
      }
    } else {
      // Flash red then return
      const newFlash = [...flash]
      newFlash[slotIdx] = true
      setFlash(newFlash)
      setTimeout(() => {
        setFlash(prev => { const n = [...prev]; n[slotIdx] = false; return n })
      }, 600)
    }
  }

  if (allDone) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 20, padding: '0 24px', textAlign: 'center' }}>
      <h2 style={{ fontSize: 30, fontWeight: 700, color: '#1B2E4A' }}>Well done, {name}!</h2>
      <p style={{ fontSize: 22, color: '#8898A8' }}>You built all {words.length} words!</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 320 }}>
        <button onClick={() => { setWIdx(0); setAllDone(false) }} style={{
          padding: '12px 28px', borderRadius: 999, backgroundColor: '#7DC44E',
          color: 'white', fontWeight: 600, fontSize: 16, border: 'none', cursor: 'pointer', minHeight: 48,
        }}>Play Again</button>
        <button onClick={onDone} style={{
          padding: '12px 28px', borderRadius: 999, backgroundColor: 'transparent',
          color: '#1B2E4A', fontWeight: 600, fontSize: 16,
          border: '2px solid #1B2E4A', cursor: 'pointer', minHeight: 48,
        }}>Back to Learning</button>
      </div>
    </div>
  )

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        {/* Progress */}
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%',
          maxWidth: 400, padding: '0 20px' }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: '#1B2E4A',
            fontFamily: "'Fredoka', sans-serif" }}>
            What word does this show?
          </span>
          <span style={{ fontSize: 14, color: '#8898A8', fontFamily: "'Fredoka', sans-serif" }}>
            Word {wIdx + 1} of {words.length}
          </span>
        </div>

        {/* Illustration */}
        <div style={{ width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <word.SVG />
        </div>

        {/* Letter slots */}
        <div style={{ display: 'flex', gap: 12 }}>
          {slots.map((s, i) => (
            <DropSlot key={i} id={`slot-${i}`} filled={s} flashRed={flash[i]} />
          ))}
        </div>

        {/* Letter tray */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center',
          maxWidth: 400, padding: '0 20px' }}>
          {tray.map(t => (
            <DragTile key={t.id} id={t.id} letter={t.letter} disabled={false} />
          ))}
        </div>
      </div>
    </DndContext>
  )
}

/* ══════════════════════════════════════════
   PAGE
══════════════════════════════════════════ */
export default function WordGamePage() {
  const router = useRouter()
  const [name, setName]   = useState('Friend')
  const [words, setWords] = useState(() => shuffle(WORD_LIST))

  useEffect(() => { setName(localStorage.getItem('miniMindsName') || 'Friend') }, [])

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

      <div style={{ paddingTop: 72, paddingBottom: 40 }}>
        <WordGame
          key={words.map(w => w.word).join()}
          words={words}
          name={name}
          onDone={() => router.push('/zone/rabbit')}
        />
      </div>
    </div>
  )
}
