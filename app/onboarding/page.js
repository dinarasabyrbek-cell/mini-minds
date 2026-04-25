'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import { supabase } from '@/lib/supabase'

const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

/* ══════════════════════════════════════════
   LOTTIE LOADER — fetch from /public, emoji fallback
══════════════════════════════════════════ */
function LottieAnimal({ src, fallback, size = 150, loop = true }) {
  const [data, setData]  = useState(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!src) { setFailed(true); return }
    fetch(src)
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(setData)
      .catch(() => setFailed(true))
  }, [src])

  if (failed) {
    return (
      <div style={{ width: size, height: size, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: size * 0.55, lineHeight: 1 }}>
        {fallback}
      </div>
    )
  }
  if (!data) {
    return (
      <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          style={{ width: 32, height: 32, borderRadius: '50%',
            border: '3px solid #C8D96B', borderTopColor: '#7DC44E' }}
        />
      </div>
    )
  }
  return <Lottie animationData={data} loop={loop} style={{ width: size, height: size }} />
}

/* ══════════════════════════════════════════
   GARDEN BACKGROUND — fixed, shared across all steps
══════════════════════════════════════════ */
const LEAVES = [
  { left: '7%',  delay: '0s',   dur: '7s',   size: 16, color: '#E8643A' },
  { left: '23%', delay: '1.4s', dur: '9s',   size: 12, color: '#F0A030' },
  { left: '41%', delay: '0.7s', dur: '8s',   size: 14, color: '#E8643A' },
  { left: '58%', delay: '2.1s', dur: '6.5s', size: 10, color: '#F0A030' },
  { left: '72%', delay: '0.3s', dur: '8.5s', size: 15, color: '#E8643A' },
  { left: '87%', delay: '3.2s', dur: '7.5s', size: 11, color: '#F0A030' },
  { left: '33%', delay: '4s',   dur: '9.5s', size: 13, color: '#E8643A' },
  { left: '52%', delay: '2.8s', dur: '7s',   size: 12, color: '#F0A030' },
]

function GardenBg() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" style={{ backgroundColor: '#FFF8E7' }}>
      <style>{`
        @keyframes leafDrift {
          0%   { transform: translateY(-20px) translateX(0px)   rotate(0deg);   opacity: 1; }
          30%  { transform: translateY(30vh)  translateX(18px)  rotate(110deg);  opacity: 0.85; }
          60%  { transform: translateY(60vh)  translateX(-10px) rotate(240deg);  opacity: 0.55; }
          100% { transform: translateY(110vh) translateX(6px)   rotate(380deg);  opacity: 0; }
        }
        .gl { position: fixed; animation: leafDrift linear infinite; pointer-events: none; z-index: 1; }
      `}</style>

      {/* SVG scene */}
      <svg width="100%" height="100%" viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        {/* Ground */}
        <rect x="0" y="628" width="1440" height="272" fill="#C8D96B" />
        <ellipse cx="720" cy="630" rx="860" ry="42" fill="#D4E070" />

        {/* Background trees */}
        <rect x="225" y="553" width="14" height="82" rx="5" fill="#92400E" />
        <circle cx="232" cy="535" r="44" fill="#7DC44E" />

        <rect x="700" y="562" width="14" height="72" rx="5" fill="#92400E" />
        <circle cx="707" cy="546" r="40" fill="#E8C84A" />

        <rect x="1195" y="568" width="13" height="66" rx="5" fill="#92400E" />
        <circle cx="1201" cy="554" r="36" fill="#7DC44E" />

        {/* Bushes — left */}
        <ellipse cx="62"  cy="646" rx="78" ry="50" fill="#E8C84A" />
        <ellipse cx="188" cy="654" rx="60" ry="40" fill="#7DC44E" />
        <ellipse cx="358" cy="649" rx="70" ry="46" fill="#E8C84A" />
        {/* Bushes — right */}
        <ellipse cx="1090" cy="650" rx="74" ry="48" fill="#7DC44E" />
        <ellipse cx="1262" cy="645" rx="64" ry="43" fill="#E8C84A" />
        <ellipse cx="1418" cy="654" rx="56" ry="38" fill="#7DC44E" />
        {/* Centre bush */}
        <ellipse cx="720" cy="652" rx="50" ry="34" fill="#E8C84A" />
      </svg>

      {/* Falling leaves */}
      {LEAVES.map((l, i) => (
        <div key={i} className="gl"
          style={{ left: l.left, top: -20, animationDuration: l.dur, animationDelay: l.delay }}>
          <svg width={l.size} height={Math.round(l.size * 1.3)} viewBox="0 0 20 26">
            <ellipse cx="10" cy="10" rx="8" ry="5" fill={l.color} transform="rotate(-30,10,10)" />
            <line x1="10" y1="14" x2="10" y2="26" stroke={l.color} strokeWidth="1.5" />
          </svg>
        </div>
      ))}
    </div>
  )
}

/* ══════════════════════════════════════════
   SLIDE VARIANTS — shared across all steps
══════════════════════════════════════════ */
const slide = {
  enter:  (dir) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:   (dir) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
}
const slideTx = { duration: 0.4, ease: 'easeInOut' }

/* ══════════════════════════════════════════
   STEP 1 — Child's name
══════════════════════════════════════════ */
function Step1({ name, setName, onNext, dir }) {
  return (
    <motion.div
      custom={dir} variants={slide} initial="enter" animate="center" exit="exit"
      transition={slideTx}
      className="absolute inset-0 flex flex-col items-center justify-center px-6 pb-20"
      style={{ fontFamily: 'var(--font-fredoka), sans-serif' }}
    >
      <motion.h1
        initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="text-4xl md:text-5xl font-bold text-center mb-3"
        style={{ color: '#2D2014' }}
      >
        What&apos;s your child&apos;s name? 🌟
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
        className="text-xl text-center mb-10"
        style={{ color: '#9C7C5A' }}
      >
        We&apos;ll make everything just for them!
      </motion.p>

      <motion.input
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Type their name..."
        onKeyDown={e => e.key === 'Enter' && name.trim() && onNext()}
        maxLength={30}
        className="w-full max-w-md text-center outline-none rounded-3xl mb-8"
        style={{
          height: 56, fontSize: 24, fontFamily: 'var(--font-fredoka), sans-serif',
          border: `3px solid ${name.trim() ? '#F97316' : '#E5D5C0'}`,
          backgroundColor: '#FFFFFF', color: '#2D2014',
          boxShadow: name.trim() ? '0 0 0 4px rgba(249,115,22,0.15)' : '0 2px 10px rgba(0,0,0,0.06)',
          paddingLeft: 20, paddingRight: 20,
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
      />

      <motion.button
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        onClick={onNext}
        disabled={!name.trim()}
        whileHover={name.trim() ? { scale: 1.05 } : {}}
        whileTap={name.trim() ? { scale: 0.97 } : {}}
        className="px-12 py-4 rounded-full text-xl font-semibold text-white"
        style={{
          backgroundColor: name.trim() ? '#F97316' : '#D4C4B0',
          cursor: name.trim() ? 'pointer' : 'not-allowed',
          boxShadow: name.trim() ? '0 6px 20px rgba(249,115,22,0.4)' : 'none',
          fontFamily: 'var(--font-fredoka), sans-serif',
          minWidth: 200, minHeight: 56, transition: 'background-color 0.2s',
        }}
      >
        Next →
      </motion.button>

      {/* Decorative Lottie — bottom-right corner */}
      <div className="fixed bottom-6 right-6 pointer-events-none" style={{ zIndex: 2 }}>
        <LottieAnimal src="/animations/rabbit.json" fallback="🐰" size={120} />
      </div>
    </motion.div>
  )
}

/* ══════════════════════════════════════════
   STEP 2 — Age selection
══════════════════════════════════════════ */
const AGES = ['1','2','3','4','5','6','7','8','8+']
const AGE_CLR = ['#F5C842','#7DC44E','#F5C842','#7DC44E','#F5C842','#7DC44E','#F5C842','#7DC44E','#F5C842']

function Step2({ name, age, setAge, onNext, onBack, dir }) {
  return (
    <motion.div
      custom={dir} variants={slide} initial="enter" animate="center" exit="exit"
      transition={slideTx}
      className="absolute inset-0 flex flex-col items-center justify-center px-6 pb-16"
      style={{ fontFamily: 'var(--font-fredoka), sans-serif' }}
    >
      {/* Back */}
      <button
        onClick={onBack}
        className="absolute top-6 left-6 px-4 py-2 rounded-full text-base font-semibold"
        style={{ backgroundColor: 'rgba(255,255,255,0.7)', color: '#9C7C5A', backdropFilter: 'blur(4px)', minHeight: 40 }}
      >
        ← Back
      </button>

      <motion.h1
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="text-4xl md:text-5xl font-bold text-center mb-10"
        style={{ color: '#2D2014' }}
      >
        How old is {name}? 🎂
      </motion.h1>

      {/* 3×3 age grid */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
        className="grid grid-cols-3 gap-3 mb-10"
      >
        {AGES.map((a, i) => {
          const selected = age === a
          return (
            <motion.button
              key={a}
              onClick={() => setAge(a)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{ scale: selected ? 1.1 : 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              style={{
                width: 90, height: 90,
                borderRadius: 16,
                backgroundColor: AGE_CLR[i],
                border: selected ? '3px solid #2D2014' : '3px solid transparent',
                boxShadow: selected ? '0 4px 18px rgba(0,0,0,0.18)' : '0 2px 8px rgba(0,0,0,0.1)',
                color: '#FFFFFF',
                fontSize: 28,
                fontWeight: 700,
                fontFamily: 'var(--font-fredoka), sans-serif',
                cursor: 'pointer',
              }}
            >
              {a}
            </motion.button>
          )
        })}
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        onClick={onNext}
        disabled={!age}
        whileHover={age ? { scale: 1.05 } : {}}
        whileTap={age ? { scale: 0.97 } : {}}
        className="px-12 py-4 rounded-full text-xl font-semibold text-white"
        style={{
          backgroundColor: age ? '#F97316' : '#D4C4B0',
          cursor: age ? 'pointer' : 'not-allowed',
          boxShadow: age ? '0 6px 20px rgba(249,115,22,0.4)' : 'none',
          fontFamily: 'var(--font-fredoka), sans-serif',
          minWidth: 200, minHeight: 56, transition: 'background-color 0.2s',
        }}
      >
        Next →
      </motion.button>
    </motion.div>
  )
}

/* ══════════════════════════════════════════
   STEP 3 — Avatar
══════════════════════════════════════════ */
const AVATARS = [
  { id: 'rabbit',   label: 'Rabbit',   src: '/animations/rabbit.json',   fallback: '🐰', ring: '#7DC44E' },
  { id: 'deer',     label: 'Deer',     src: '/animations/deer.json',     fallback: '🦌', ring: '#E8643A' },
  { id: 'elephant', label: 'Elephant', src: '/animations/elephant.json', fallback: '🐘', ring: '#9B7FD4' },
  { id: 'giraffe',  label: 'Giraffe',  src: '/animations/giraffe.json',  fallback: '🦒', ring: '#F5C842' },
]

function Step3({ name, avatar, setAvatar, onFinish, onBack, dir }) {
  return (
    <motion.div
      custom={dir} variants={slide} initial="enter" animate="center" exit="exit"
      transition={slideTx}
      className="absolute inset-0 flex flex-col items-center justify-center px-4 pb-16"
      style={{ fontFamily: 'var(--font-fredoka), sans-serif' }}
    >
      {/* Back */}
      <button
        onClick={onBack}
        className="absolute top-6 left-6 px-4 py-2 rounded-full text-base font-semibold"
        style={{ backgroundColor: 'rgba(255,255,255,0.7)', color: '#9C7C5A', backdropFilter: 'blur(4px)', minHeight: 40 }}
      >
        ← Back
      </button>

      <motion.h1
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="text-4xl md:text-5xl font-bold text-center mb-2"
        style={{ color: '#2D2014' }}
      >
        Who is {name}&apos;s friend? 🐾
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18 }}
        className="text-xl text-center mb-8"
        style={{ color: '#9C7C5A' }}
      >
        Pick your favourite!
      </motion.p>

      {/* 2×2 avatar grid */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
        className="grid grid-cols-2 gap-4 mb-8"
      >
        {AVATARS.map((av, i) => {
          const selected = avatar === av.id
          return (
            <motion.button
              key={av.id}
              onClick={() => setAvatar(av.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: selected ? 1 : 0.75, y: 0, scale: selected ? 1.08 : 1 }}
              transition={{ delay: 0.1 + i * 0.06, type: 'spring', stiffness: 280, damping: 22 }}
              whileHover={{ scale: selected ? 1.08 : 1.04, opacity: 1 }}
              whileTap={{ scale: 0.97 }}
              className="flex flex-col items-center gap-2 p-4 rounded-3xl"
              style={{
                backgroundColor: '#FFFFFF',
                border: selected ? `3px solid ${av.ring}` : '3px solid transparent',
                boxShadow: selected
                  ? `0 6px 24px ${av.ring}55`
                  : '0 4px 14px rgba(0,0,0,0.08)',
                cursor: 'pointer',
                minWidth: 140,
              }}
            >
              <LottieAnimal src={av.src} fallback={av.fallback} size={150} />
              <span className="text-lg font-semibold" style={{ color: '#92400E' }}>{av.label}</span>
            </motion.button>
          )
        })}
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}
        onClick={onFinish}
        disabled={!avatar}
        whileHover={avatar ? { scale: 1.05 } : {}}
        whileTap={avatar ? { scale: 0.97 } : {}}
        className="px-12 py-4 rounded-full text-xl font-bold text-white"
        style={{
          backgroundColor: avatar ? '#F97316' : '#D4C4B0',
          cursor: avatar ? 'pointer' : 'not-allowed',
          boxShadow: avatar ? '0 6px 20px rgba(249,115,22,0.4)' : 'none',
          fontFamily: 'var(--font-fredoka), sans-serif',
          minWidth: 220, minHeight: 56, transition: 'background-color 0.2s',
        }}
      >
        Let&apos;s Go! 🚀
      </motion.button>
    </motion.div>
  )
}

/* ══════════════════════════════════════════
   CELEBRATION SCREEN
══════════════════════════════════════════ */
const CELEBRATION_ANIMALS = [
  { id: 'rabbit',   src: '/animations/rabbit.json',   fallback: '🐰', initial: { x: -280, y: 0 },   pos: { left: '4%',  top: '42%' } },
  { id: 'deer',     src: '/animations/deer.json',     fallback: '🦌', initial: { x: 280,  y: 0 },   pos: { right: '4%', top: '42%' } },
  { id: 'elephant', src: '/animations/elephant.json', fallback: '🐘', initial: { x: -200, y: 220 }, pos: { left: '18%', bottom: '8%' } },
  { id: 'giraffe',  src: '/animations/giraffe.json',  fallback: '🦒', initial: { x: 200,  y: 220 }, pos: { right: '18%', bottom: '8%' } },
]

function CelebrationScreen({ name }) {
  const [showText, setShowText] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShowText(true), 900)
    return () => clearTimeout(t)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #1B2E4A 0%, #2D5A3D 100%)', zIndex: 50 }}
    >
      {/* Welcome text */}
      <AnimatePresence>
        {showText && (
          <motion.div
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute top-0 left-0 right-0 flex justify-center"
            style={{ paddingTop: '12%', zIndex: 10 }}
          >
            <h1
              className="text-5xl md:text-6xl font-bold text-center text-white"
              style={{ fontFamily: 'var(--font-fredoka), sans-serif', textShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
            >
              Welcome, {name}! 🌟
            </h1>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animals */}
      {CELEBRATION_ANIMALS.map(a => (
        <motion.div
          key={a.id}
          initial={{ ...a.initial, opacity: 0 }}
          animate={{ x: 0, y: 0, opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.9, type: 'spring', stiffness: 110, damping: 14 }}
          className="absolute"
          style={a.pos}
        >
          <LottieAnimal src={a.src} fallback={a.fallback} size={140} />
        </motion.div>
      ))}
    </motion.div>
  )
}

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
export default function Onboarding() {
  const router = useRouter()
  const [step,       setStep]       = useState(1)
  const [dir,        setDir]        = useState(1)
  const [name,       setName]       = useState('')
  const [age,        setAge]        = useState(null)
  const [avatar,     setAvatar]     = useState(null)
  const [celebrating, setCelebrating] = useState(false)

  /* Skip onboarding if already done */
  useEffect(() => {
    if (localStorage.getItem('miniMindsName')) router.replace('/home')
  }, [router])

  function goNext() { setDir(1);  setStep(s => s + 1) }
  function goBack() { setDir(-1); setStep(s => s - 1) }

  async function handleFinish() {
    /* Save immediately so /home works even if celebration is cut short */
    const localId = crypto.randomUUID()
    localStorage.setItem('miniMindsChildId', localId)
    localStorage.setItem('miniMindsName',    name.trim())
    localStorage.setItem('miniMindsAge',     age)
    localStorage.setItem('miniMindsAvatar',  avatar)

    /* Try Supabase — silent failure */
    try {
      const { data, error } = await supabase
        .from('child_profiles')
        .insert({ name: name.trim(), avatar })
        .select('id').single()
      if (!error && data?.id) localStorage.setItem('miniMindsChildId', data.id)
    } catch {}

    setCelebrating(true)
    setTimeout(() => router.push('/home'), 3000)
  }

  if (celebrating) {
    return (
      <>
        <GardenBg />
        <AnimatePresence>
          <CelebrationScreen name={name.trim()} />
        </AnimatePresence>
      </>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ fontFamily: 'var(--font-fredoka), sans-serif' }}>
      <GardenBg />

      <div className="relative" style={{ minHeight: '100dvh' }}>
        <AnimatePresence mode="wait" custom={dir}>
          {step === 1 && (
            <Step1
              key="s1"
              name={name} setName={setName}
              onNext={() => { if (name.trim()) goNext() }}
              dir={dir}
            />
          )}
          {step === 2 && (
            <Step2
              key="s2"
              name={name.trim()} age={age} setAge={setAge}
              onNext={() => { if (age) goNext() }}
              onBack={goBack}
              dir={dir}
            />
          )}
          {step === 3 && (
            <Step3
              key="s3"
              name={name.trim()} avatar={avatar} setAvatar={setAvatar}
              onFinish={handleFinish}
              onBack={goBack}
              dir={dir}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
