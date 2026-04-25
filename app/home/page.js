'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'

const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

/* ──────────────────────────────────────────────────────────
   LOTTIE LOADER
────────────────────────────────────────────────────────── */
const _lc = new Map()

function ZoneLottie({ src, fallback, size = 200 }) {
  const [data, setData] = useState(() => _lc.get(src) ?? null)
  useEffect(() => {
    if (_lc.has(src)) { setData(_lc.get(src)); return }
    fetch(src).then(r => r.json()).then(d => { _lc.set(src, d); setData(d) }).catch(() => {})
  }, [src])
  if (!data) return (
    <div style={{ width: size, height: size, display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: size * 0.45 }}>{fallback}</div>
  )
  return <Lottie animationData={data} loop style={{ width: size, height: size }} />
}

/* ──────────────────────────────────────────────────────────
   FOREST BACKGROUND
   Ground = CSS div at bottom 30% of viewport (consistent on all screens).
   Trees = SVG overlay scaled to cover the screen.
   Characters are positioned at bottom: 30% so their feet touch the ground edge.
────────────────────────────────────────────────────────── */
const LEAVES = [
  { left: '4%',  delay: '0s',   dur: '7.8s', s: 16, c: '#E8643A' },
  { left: '17%', delay: '1.6s', dur: '9.5s', s: 11, c: '#F0A030' },
  { left: '33%', delay: '0.5s', dur: '8.2s', s: 14, c: '#E8643A' },
  { left: '49%', delay: '2.4s', dur: '6.8s', s: 10, c: '#F0A030' },
  { left: '64%', delay: '0.9s', dur: '9s',   s: 15, c: '#E8643A' },
  { left: '78%', delay: '3.6s', dur: '7.2s', s: 12, c: '#F0A030' },
  { left: '91%', delay: '0.3s', dur: '8.8s', s: 13, c: '#E8643A' },
  { left: '24%', delay: '4.2s', dur: '7.5s', s: 11, c: '#F0A030' },
]

/* Grass tuft x positions spread across full width */
const GRASS_X = [60,190,340,480,615,720,840,970,1100,1240,1380]

function ForestBg() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" style={{
      background: 'linear-gradient(180deg, #F5A05A 0%, #F5C040 52%, #F5D442 100%)',
    }}>
      <style>{`
        @keyframes homeLeaf {
          0%   { transform: translateY(-14px) translateX(0)   rotate(0deg);   opacity: 0.92; }
          40%  { transform: translateY(38vh)  translateX(18px)  rotate(145deg);  opacity: 0.65; }
          100% { transform: translateY(108vh) translateX(-8px) rotate(355deg);  opacity: 0; }
        }
        .hl { position: fixed; animation: homeLeaf linear infinite; pointer-events: none; z-index: 2; }
      `}</style>

      {/* ── Tree SVG layer ── */}
      {/* viewBox ground reference at y=630 (70% of 900) — approx matches CSS ground at bottom 30% */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Warm horizon haze */}
        <rect x="0" y="548" width="1440" height="88" fill="#F5D442" opacity="0.26" />

        {/* ── BACKGROUND trees (smaller, darker — depth) ── */}
        <polygon points="638,632 672,502 706,632" fill="#1A3D1A" opacity="0.85" />
        <rect x="754" y="575" width="11" height="58" rx="3" fill="#5C3A0E" opacity="0.7" />
        <circle cx="759" cy="562" r="34" fill="#1A3D1A" opacity="0.7" />

        {/* ── FOREGROUND trees ── */}
        {/* Far-left tall pine (2 layers) */}
        <polygon points="-8,632 58,295 124,632" fill="#1A3D1A" />
        <polygon points="4,632  58,342 112,632" fill="#2D6A2D" />

        {/* Left secondary pine */}
        <polygon points="110,632 148,462 186,632" fill="#2D6A2D" />
        <polygon points="116,632 148,492 180,632" fill="#3A8030" />

        {/* Left round tree — between Rabbit & Deer zones (x≈295) */}
        <rect x="284" y="550" width="15" height="84" rx="5" fill="#5C3A0E" />
        <circle cx="291" cy="530" r="52" fill="#1A3D1A" />
        <circle cx="291" cy="518" r="40" fill="#2D6A2D" />

        {/* Center-left slim pine — between Deer & Elephant zones (x≈630) */}
        <polygon points="598,632 630,498 662,632" fill="#1A3D1A" />
        <polygon points="605,632 630,528 655,632" fill="#2D6A2D" />

        {/* Center-right round tree — between Elephant & Giraffe (x≈970) */}
        <rect x="958" y="545" width="15" height="90" rx="5" fill="#5C3A0E" />
        <circle cx="965" cy="522" r="55" fill="#1A3D1A" />
        <circle cx="965" cy="510" r="42" fill="#2D6A2D" />

        {/* Right secondary pine */}
        <polygon points="1258,632 1292,474 1326,632" fill="#2D6A2D" />

        {/* Far-right tall pine */}
        <polygon points="1325,632 1390,302 1455,632" fill="#1A3D1A" />
        <polygon points="1334,632 1390,348 1446,632" fill="#2D6A2D" />
      </svg>

      {/* ── Ground CSS strip (always exactly 30% of viewport height) ── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: '30%',
        background: 'linear-gradient(180deg, #A07820 0%, #8B6914 18%, #7A5A10 100%)',
      }} />

      {/* ── Grass tufts along the ground edge ── */}
      <div style={{ position: 'absolute', bottom: '30%', left: 0, right: 0, overflow: 'hidden' }}>
        <svg width="100%" height="28" viewBox="0 0 1440 28" preserveAspectRatio="xMidYMax meet">
          {GRASS_X.map((x, i) => (
            <g key={i}>
              <path d={`M${x},28 Q${x-3},13 ${x-7},28`}
                stroke="#5A8A2A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d={`M${x},28 Q${x+2},11 ${x+7},28`}
                stroke="#5A8A2A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d={`M${x+10},28 Q${x+12},16 ${x+16},28`}
                stroke="#6A9A30" strokeWidth="2" fill="none" strokeLinecap="round" />
            </g>
          ))}
        </svg>
      </div>

      {/* Scattered leaves on ground */}
      <div style={{ position: 'absolute', bottom: '27%', left: '28%' }}>
        <svg width="20" height="12" viewBox="0 0 20 12">
          <ellipse cx="10" cy="6" rx="8" ry="5" fill="#E8643A" opacity="0.65" transform="rotate(-15,10,6)" />
        </svg>
      </div>
      <div style={{ position: 'absolute', bottom: '28%', left: '58%' }}>
        <svg width="18" height="11" viewBox="0 0 18 11">
          <ellipse cx="9" cy="5" rx="7" ry="4" fill="#F0A030" opacity="0.6" transform="rotate(12,9,5)" />
        </svg>
      </div>
      <div style={{ position: 'absolute', bottom: '26%', left: '78%' }}>
        <svg width="22" height="13" viewBox="0 0 22 13">
          <ellipse cx="11" cy="6" rx="9" ry="5.5" fill="#E8643A" opacity="0.6" transform="rotate(-8,11,6)" />
        </svg>
      </div>

      {/* Falling leaves */}
      {LEAVES.map((l, i) => (
        <div key={i} className="hl"
          style={{ left: l.left, top: -16, animationDuration: l.dur, animationDelay: l.delay }}>
          <svg width={l.s} height={Math.round(l.s * 1.3)} viewBox="0 0 20 26">
            <ellipse cx="10" cy="10" rx="8" ry="5" fill={l.c} transform="rotate(-30,10,10)" />
            <line x1="10" y1="14" x2="10" y2="26" stroke={l.c} strokeWidth="1.5" />
          </svg>
        </div>
      ))}
    </div>
  )
}

/* ──────────────────────────────────────────────────────────
   CHARACTERS & ZONES
────────────────────────────────────────────────────────── */
const CHARACTERS = [
  { id: 'rabbit',   href: '/zone/rabbit',  label: 'Learning', lottie: '/animations/rabbit.json',   emoji: '🐰' },
  { id: 'deer',     href: '/zone/cat',     label: 'Games',    lottie: '/animations/deer.json',     emoji: '🦌' },
  { id: 'elephant', href: '/zone/elephant', label: 'Stories',  lottie: '/animations/elephant.json', emoji: '🐘' },
  { id: 'giraffe',  href: '/zone/minitv',  label: 'Mini TV',  lottie: '/animations/giraffe.json',  emoji: '🦒' },
]

/* ──────────────────────────────────────────────────────────
   SETTINGS PANEL
────────────────────────────────────────────────────────── */
const AVATAR_META = {
  rabbit:   { color: '#7DC44E', emoji: '🐰', label: 'Rabbit'   },
  deer:     { color: '#E8643A', emoji: '🦌', label: 'Deer'     },
  elephant: { color: '#9B7FD4', emoji: '🐘', label: 'Elephant' },
  giraffe:  { color: '#F5C842', emoji: '🦒', label: 'Giraffe'  },
}

function SettingsPanel({ isOpen, onClose, name, age, avatar, onNameSave, onAvatarChange }) {
  const [editName, setEditName] = useState(name)
  const [saved,    setSaved]    = useState(false)
  useEffect(() => { setEditName(name) }, [name])

  function handleSave() {
    const n = editName.trim()
    if (!n) return
    onNameSave(n)
    setSaved(true)
    setTimeout(() => setSaved(false), 2200)
  }

  const meta = AVATAR_META[avatar] ?? AVATAR_META.rabbit

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div key="ov"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
            style={{ backgroundColor: 'rgba(0,0,0,0.42)' }}
          />
          <motion.div key="pn"
            initial={{ x: 380 }} animate={{ x: 0 }} exit={{ x: 380 }}
            transition={{ type: 'spring', stiffness: 300, damping: 32 }}
            className="fixed top-0 right-0 bottom-0 z-50 overflow-y-auto flex flex-col"
            style={{ width: 360, backgroundColor: '#FFFFFF', borderRadius: '24px 0 0 24px',
              boxShadow: '-10px 0 50px rgba(0,0,0,0.18)', fontFamily: 'var(--font-fredoka), sans-serif' }}
          >
            <button onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-lg font-bold z-10"
              style={{ backgroundColor: '#F5EBE0', color: '#9C7C5A' }}>✕</button>

            <div className="flex flex-col gap-6 p-7 pt-12 flex-1">
              {/* Profile */}
              <div className="flex flex-col items-center gap-2 pb-4" style={{ borderBottom: '2px solid #F5EBE0' }}>
                <div style={{ width: 120, height: 120, borderRadius: '50%', overflow: 'hidden',
                  border: `4px solid ${meta.color}`, boxShadow: `0 4px 20px ${meta.color}44` }}>
                  <Image src={`/avatars/${avatar}-head.png`} alt={meta.label}
                    width={120} height={120} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                </div>
                <p className="text-2xl font-bold" style={{ color: '#2D2014' }}>{name}</p>
                {age && <p className="text-lg" style={{ color: '#9C7C5A' }}>Age {age}</p>}
              </div>

              {/* Edit name */}
              <div className="flex flex-col gap-2">
                <label className="text-base font-semibold" style={{ color: '#5C3A1A' }}>Change name</label>
                <div className="flex gap-2">
                  <input value={editName} onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSave()} maxLength={30}
                    className="flex-1 px-4 py-2 rounded-2xl text-lg outline-none"
                    style={{ border: '2px solid #E5D5C0', backgroundColor: '#FAFAFA', color: '#2D2014',
                      fontFamily: 'var(--font-fredoka), sans-serif' }} />
                  <button onClick={handleSave} disabled={!editName.trim()}
                    className="px-4 py-2 rounded-2xl text-base font-semibold text-white"
                    style={{ backgroundColor: saved ? '#22C55E' : editName.trim() ? '#F97316' : '#D4C4B0',
                      minWidth: 72, minHeight: 44, transition: 'background-color 0.3s' }}>
                    {saved ? '✓ Saved' : 'Save ✓'}
                  </button>
                </div>
              </div>

              {/* Avatar selector */}
              <div className="flex flex-col gap-3">
                <label className="text-base font-semibold" style={{ color: '#5C3A1A' }}>Choose your friend</label>
                <div className="flex gap-3 justify-center">
                  {Object.entries(AVATAR_META).map(([id, m]) => {
                    const sel = avatar === id
                    return (
                      <motion.button key={id} onClick={() => onAvatarChange(id)}
                        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
                        style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', padding: 0,
                          border: sel ? `3px solid ${m.color}` : '3px solid #E5D5C0',
                          boxShadow: sel ? `0 0 0 3px ${m.color}44` : 'none',
                          cursor: 'pointer', transition: 'border-color 0.2s, box-shadow 0.2s' }}>
                        <Image src={`/avatars/${id}-head.png`} alt={m.label}
                          width={72} height={72} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="py-5 text-center" style={{ borderTop: '1px solid #F0E8DE' }}>
              <p style={{ color: '#C8A87A', fontSize: 14, fontFamily: 'var(--font-fredoka), sans-serif' }}>
                Mini Minds ✨
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/* ──────────────────────────────────────────────────────────
   HOME PAGE
────────────────────────────────────────────────────────── */
export default function Home() {
  const router = useRouter()
  const [name,      setName]      = useState('')
  const [age,       setAge]       = useState('')
  const [avatar,    setAvatar]    = useState('rabbit')
  const [panelOpen, setPanelOpen] = useState(false)
  const [ready,     setReady]     = useState(false)

  useEffect(() => {
    const id = localStorage.getItem('miniMindsChildId')
    if (!id) { router.replace('/onboarding'); return }
    setName(localStorage.getItem('miniMindsName') || 'Friend')
    setAge(localStorage.getItem('miniMindsAge') || '')
    const av  = localStorage.getItem('miniMindsAvatar') || 'rabbit'
    const ok  = Object.keys(AVATAR_META)
    setAvatar(ok.includes(av) ? av : av === 'cat' ? 'deer' : av === 'penguin' ? 'elephant' : 'rabbit')
    setReady(true)
  }, [router])

  function handleNameSave(n)   { localStorage.setItem('miniMindsName', n); setName(n) }
  function handleAvatarChange(id) { localStorage.setItem('miniMindsAvatar', id); setAvatar(id) }

  if (!ready) return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: '#F5C040' }}>
      <p style={{ color: '#3D1F0A', fontSize: 24, fontFamily: 'var(--font-fredoka), sans-serif' }}>Loading...</p>
    </div>
  )

  const meta = AVATAR_META[avatar] ?? AVATAR_META.rabbit

  return (
    <div style={{ width: '100vw', height: '100dvh', position: 'relative', overflow: 'hidden',
      fontFamily: 'var(--font-fredoka), sans-serif' }}>

      {/* ── Forest background ── */}
      <ForestBg />

      {/* ── Top bar (transparent, floating) ── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 28px',
      }}>
        <h1 style={{
          color: '#FFFFFF', fontSize: 28, fontWeight: 700,
          textShadow: '0 2px 12px rgba(0,0,0,0.28)',
          fontFamily: 'var(--font-fredoka), sans-serif',
        }}>
          🌟 Mini Minds
        </h1>

        {/* Avatar chip */}
        <motion.button
          onClick={() => setPanelOpen(true)}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '6px 14px 6px 6px',
            borderRadius: 999,
            backgroundColor: 'rgba(0,0,0,0.22)',
            backdropFilter: 'blur(8px)',
            border: `2px solid rgba(255,255,255,0.35)`,
            cursor: 'pointer',
            minHeight: 44,
          }}
        >
          <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
            <Image src={`/avatars/${avatar}-head.png`} alt={meta.label}
              width={36} height={36} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
          </div>
          <span style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 600,
            textShadow: '0 1px 4px rgba(0,0,0,0.2)' }}>
            {name}
          </span>
        </motion.button>
      </div>

      {/* ── Greeting ── */}
      <div style={{
        position: 'absolute', top: '14%', left: 0, right: 0,
        textAlign: 'center', zIndex: 5,
      }}>
        <motion.h2
          initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ color: '#FFFFFF', fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 700,
            textShadow: '0 3px 18px rgba(0,0,0,0.32)',
            fontFamily: 'var(--font-fredoka), sans-serif', lineHeight: 1.1 }}
        >
          Hi, {name}! 👋
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.22 }}
          style={{ color: 'rgba(255,255,255,0.92)', fontSize: 'clamp(16px, 2.2vw, 22px)',
            marginTop: 8, textShadow: '0 2px 8px rgba(0,0,0,0.25)',
            fontFamily: 'var(--font-fredoka), sans-serif' }}
        >
          Where do you want to go today?
        </motion.p>
      </div>

      {/* ── Characters + labels (label above, character below) ── */}
      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: 0,
        right: 0,
        display: 'flex',
        alignItems: 'flex-end',
        zIndex: 6,
      }}>
        {CHARACTERS.map((char, i) => (
          <Link
            key={char.id}
            href={char.href}
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-end',
              width: '25%',
              textDecoration: 'none',
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08, type: 'spring', stiffness: 240, damping: 22 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 8, cursor: 'pointer',
              }}
            >
              {/* Label ABOVE the character — offset right to match animal's visual center in Lottie frame */}
              <div style={{
                transform: 'translateX(14px)',
                backgroundColor: 'rgba(255,255,255,0.88)',
                borderRadius: 999,
                padding: '5px 18px',
                fontSize: 'clamp(13px, 1.4vw, 17px)',
                fontWeight: 700,
                color: '#3D1F0A',
                boxShadow: '0 2px 12px rgba(0,0,0,0.14)',
                fontFamily: 'var(--font-fredoka), sans-serif',
                whiteSpace: 'nowrap',
                backdropFilter: 'blur(4px)',
              }}>
                {char.label}
              </div>

              {/* Lottie character */}
              <div style={{ width: 'clamp(110px, 14vw, 200px)', height: 'clamp(110px, 14vw, 200px)' }}>
                <ZoneLottie src={char.lottie} fallback={char.emoji} size={200} />
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* ── Settings panel ── */}
      <SettingsPanel
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        name={name} age={age} avatar={avatar}
        onNameSave={handleNameSave}
        onAvatarChange={handleAvatarChange}
      />
    </div>
  )
}
