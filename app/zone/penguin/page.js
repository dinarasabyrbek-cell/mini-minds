'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import BackButton from '@/components/BackButton'
import { stories } from '@/lib/storyData'
import { speak, stopCurrent } from '@/lib/elevenlabs'

/* ─── Snowflakes ─── */
const FLAKES = [
  { left: '8%',  delay: '0s',    dur: '6s',   size: '1.4rem' },
  { left: '22%', delay: '1.2s',  dur: '8s',   size: '1rem'   },
  { left: '38%', delay: '0.6s',  dur: '7s',   size: '1.6rem' },
  { left: '55%', delay: '2s',    dur: '9s',   size: '0.9rem' },
  { left: '70%', delay: '0.3s',  dur: '6.5s', size: '1.2rem' },
  { left: '85%', delay: '1.8s',  dur: '8.5s', size: '1.1rem' },
]

function ArcticBg() {
  return (
    <>
      {/* Stars */}
      <div className="absolute inset-0 pointer-events-none">
        {[[5,8],[12,15],[25,5],[40,12],[55,7],[68,18],[78,4],[90,14],[15,30],[35,25],[62,28],[82,22]].map(([x,y],i) => (
          <div key={i} className="absolute rounded-full"
            style={{ left:`${x}%`, top:`${y}%`, width:3, height:3, backgroundColor:'white', opacity: 0.6+(i%3)*0.15 }}
          />
        ))}
      </div>
      {/* Moon */}
      <div className="absolute" style={{ right:'12%', top:'6%' }}>
        <div style={{ width:64, height:64, borderRadius:'50%', backgroundColor:'#FFFDE7', boxShadow:'0 0 30px rgba(255,253,231,0.4)' }}>
          <div style={{ width:52, height:52, borderRadius:'50%', backgroundColor:'#1B2E4A', marginLeft:14, marginTop:-4 }} />
        </div>
      </div>
      {/* Aurora */}
      <div className="absolute pointer-events-none" style={{ top:'18%', left:0, right:0 }}>
        <svg width="100%" height="60" viewBox="0 0 1440 60" preserveAspectRatio="none">
          <path d="M0 30 Q360 5 720 30 Q1080 55 1440 30" stroke="#7C3AED" strokeWidth="4" fill="none" opacity="0.35" />
          <path d="M0 40 Q360 15 720 40 Q1080 65 1440 40" stroke="#06B6D4" strokeWidth="3" fill="none" opacity="0.25" />
        </svg>
      </div>
      {/* Snowflakes */}
      {FLAKES.map((sf,i) => (
        <div key={i} className="snowflake"
          style={{ left:sf.left, fontSize:sf.size, animationDuration:sf.dur, animationDelay:sf.delay }}>
          ❄
        </div>
      ))}
      {/* Ice ground */}
      <div className="absolute bottom-0 left-0 right-0"
        style={{ height:90, background:'linear-gradient(180deg,transparent,#C8E6F5 80%,#E8F4FD 100%)' }} />
    </>
  )
}

/* ─── Story shelf ─── */
function StoryCard({ story, index, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity:0, y:30 }}
      animate={{ opacity:1, y:0 }}
      transition={{ delay: index * 0.1, type:'spring', stiffness:260, damping:22 }}
      whileHover={{ scale:1.06, y:-4 }}
      whileTap={{ scale:0.97 }}
      className="flex flex-col items-center gap-3 p-6 rounded-3xl w-full cursor-pointer"
      style={{
        backgroundColor: story.color,
        boxShadow: '0 6px 24px rgba(0,0,0,0.18)',
        border: '3px solid rgba(255,255,255,0.25)',
      }}
    >
      <span style={{ fontSize: '3.5rem', lineHeight:1 }}>{story.cover}</span>
      <span className="text-lg font-bold text-center leading-tight"
        style={{ color: story.textColor, fontFamily:'var(--font-fredoka), sans-serif' }}>
        {story.title}
      </span>
      <span className="text-sm font-semibold px-3 py-1 rounded-full"
        style={{ backgroundColor:'rgba(255,255,255,0.35)', color: story.textColor }}>
        {story.pages.length} pages ▶
      </span>
    </motion.button>
  )
}

/* ─── Story reader ─── */
function StoryReader({ story, onClose }) {
  const [page, setPage]         = useState(0)
  const [autoRead, setAutoRead] = useState(false)
  const [speaking, setSpeaking] = useState(false)

  const current = story.pages[page]
  const isLast  = page === story.pages.length - 1
  const isFirst = page === 0

  /* Auto-read via ElevenLabs when page changes (if autoRead is on) */
  useEffect(() => {
    if (!autoRead) return
    let alive = true
    setSpeaking(true)
    speak(current.text).finally(() => { if (alive) setSpeaking(false) })
    return () => { alive = false; stopCurrent() }
  }, [page, autoRead, current.text])

  async function handleReadAloud() {
    if (speaking) return
    setSpeaking(true)
    await speak(current.text)
    setSpeaking(false)
  }

  function next() {
    if (!isLast) setPage(p => p + 1)
  }
  function prev() {
    if (!isFirst) setPage(p => p - 1)
  }

  return (
    <motion.div
      initial={{ opacity:0 }}
      animate={{ opacity:1 }}
      exit={{ opacity:0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4"
      style={{ background:'linear-gradient(180deg,#1B2E4A 0%,#2A4A6B 60%,#E8F4FD 100%)' }}
    >
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 py-4 z-10">
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-base font-semibold"
          style={{ backgroundColor:'rgba(255,255,255,0.2)', color:'#C8E6F5', backdropFilter:'blur(4px)', minHeight:44 }}
        >
          ← Stories
        </button>
        <span className="text-base font-semibold" style={{ color:'#C8E6F5' }}>
          {story.title}
        </span>
        {/* Auto-read toggle */}
        <button
          onClick={() => setAutoRead(v => !v)}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-base font-semibold transition-all"
          style={{
            backgroundColor: autoRead ? '#7C3AED' : 'rgba(255,255,255,0.2)',
            color: '#FFFFFF',
            backdropFilter:'blur(4px)',
            minHeight:44,
          }}
        >
          {autoRead ? '🔊 On' : '🔇 Off'}
        </button>
      </div>

      {/* Page content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          initial={{ opacity:0, x:60 }}
          animate={{ opacity:1, x:0 }}
          exit={{ opacity:0, x:-60 }}
          transition={{ duration:0.3 }}
          className="flex flex-col items-center gap-6 w-full max-w-md text-center px-2"
        >
          {/* Big emoji illustration */}
          <div style={{ fontSize:'6rem', lineHeight:1, userSelect:'none' }}>{current.emoji}</div>

          {/* Story text */}
          <p
            className="text-2xl md:text-3xl font-semibold leading-relaxed"
            style={{ color:'#FFFFFF', fontFamily:'var(--font-fredoka), sans-serif' }}
          >
            {current.text}
          </p>

          {/* Read aloud button with loading state */}
          <button
            onClick={handleReadAloud}
            disabled={speaking}
            className="flex items-center gap-2 px-6 py-3 rounded-full text-lg font-semibold transition-all hover:scale-105 active:scale-95"
            style={{ backgroundColor:'rgba(255,255,255,0.18)', color:'#FFFFFF', backdropFilter:'blur(4px)', minHeight:48, opacity: speaking ? 0.75 : 1 }}
          >
            {speaking ? (
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                style={{ display: 'inline-block' }}
              >⏳</motion.span>
            ) : '🔊'}
            {speaking ? 'Loading...' : 'Read to me'}
          </button>
        </motion.div>
      </AnimatePresence>

      {/* Page dots */}
      <div className="flex gap-2 mt-8">
        {story.pages.map((_,i) => (
          <button
            key={i}
            onClick={() => setPage(i)}
            style={{
              width: i === page ? 24 : 10,
              height: 10,
              borderRadius: 99,
              backgroundColor: i === page ? '#FFFFFF' : 'rgba(255,255,255,0.35)',
              transition: 'all 0.3s',
            }}
          />
        ))}
      </div>

      {/* Prev / Next */}
      <div className="flex gap-4 mt-6">
        <button
          onClick={prev}
          disabled={isFirst}
          className="px-8 py-3 rounded-full text-xl font-bold transition-all"
          style={{
            backgroundColor: isFirst ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.25)',
            color: isFirst ? 'rgba(255,255,255,0.3)' : '#FFFFFF',
            backdropFilter:'blur(4px)',
            minWidth:100, minHeight:52,
            cursor: isFirst ? 'default' : 'pointer',
          }}
        >
          ← Prev
        </button>
        <button
          onClick={isLast ? onClose : next}
          className="px-8 py-3 rounded-full text-xl font-bold transition-all hover:scale-105 active:scale-95"
          style={{
            backgroundColor: isLast ? '#7C3AED' : 'rgba(255,255,255,0.25)',
            color:'#FFFFFF',
            backdropFilter:'blur(4px)',
            minWidth:100, minHeight:52,
            boxShadow: isLast ? '0 4px 20px rgba(124,58,237,0.5)' : 'none',
          }}
        >
          {isLast ? '🎉 Done!' : 'Next →'}
        </button>
      </div>
    </motion.div>
  )
}

/* ─── Main page ─── */
export default function PenguinZone() {
  const [reading, setReading] = useState(null)

  return (
    <div
      className="min-h-screen relative overflow-hidden flex flex-col"
      style={{ background:'linear-gradient(180deg,#1B2E4A 0%,#2A4A6B 60%,#E8F4FD 100%)', fontFamily:'var(--font-fredoka), sans-serif' }}
    >
      <ArcticBg />

      <div className="relative z-10 p-6">
        <BackButton href="/home" color="#C8E6F5" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center px-4 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity:0, y:-16 }}
          animate={{ opacity:1, y:0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold" style={{ color:'#FFFFFF' }}>
            Storytime 🐧
          </h1>
          <p className="text-lg mt-2" style={{ color:'#C8E6F5' }}>
            Pick a story and I&apos;ll read it to you!
          </p>
        </motion.div>

        {/* Story cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full max-w-2xl">
          {stories.map((story, i) => (
            <StoryCard
              key={story.id}
              story={story}
              index={i}
              onClick={() => setReading(story)}
            />
          ))}
        </div>
      </div>

      {/* Story reader overlay */}
      <AnimatePresence>
        {reading && (
          <StoryReader
            story={reading}
            onClose={() => {
              stopCurrent()
              setReading(null)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
