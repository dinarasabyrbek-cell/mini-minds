'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { WinterBg } from '@/components/WinterBg'

const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

/* ── Pencil SVG ── */
function PencilIcon({ color }) {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
      <rect x="12" y="4" width="16" height="36" rx="4" fill={color} opacity="0.9" />
      <polygon points="12,40 28,40 20,52" fill="#F5C542" />
      <rect x="12" y="4" width="16" height="8" rx="4" fill="#9B7FD4" opacity="0.5" />
      <line x1="20" y1="12" x2="20" y2="40" stroke="white" strokeWidth="2" opacity="0.4" />
    </svg>
  )
}

/* ── Single letter block SVG ── */
function BlocksIcon({ color }) {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
      <rect width="52" height="52" rx="12" fill={color} opacity="0.9" />
      <rect x="3" y="3" width="46" height="46" rx="10" fill="white" opacity="0.15" />
      <text x="26" y="38" textAnchor="middle" fontSize="32" fontWeight="700" fill="white"
        fontFamily="'Fredoka', sans-serif">W</text>
    </svg>
  )
}

/* ── Plus SVG ── */
function PlusIcon({ color }) {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
      <rect x="20" y="4"  width="12" height="44" rx="6" fill={color} />
      <rect x="4"  y="20" width="44" height="12" rx="6" fill={color} />
    </svg>
  )
}

/* ── Activity cards data ── */
const ACTIVITIES = [
  {
    href: '/zone/rabbit/abc',
    name: 'Alphabet',
    desc: 'Learn all 26 letters',
    topBg: '#E8F5E2', accent: '#7DC44E',
    icon: (
      <span style={{ fontSize: 64, fontWeight: 700, color: '#7DC44E',
        fontFamily: "'Fredoka', sans-serif", lineHeight: 1 }}>A</span>
    ),
  },
  {
    href: '/zone/rabbit/numbers',
    name: 'Numbers',
    desc: 'Count from 0 to 20',
    topBg: '#E2EEF5', accent: '#6BB8E8',
    icon: (
      <span style={{ fontSize: 64, fontWeight: 700, color: '#6BB8E8',
        fontFamily: "'Fredoka', sans-serif", lineHeight: 1 }}>1</span>
    ),
  },
  {
    href: '/zone/rabbit/tracing',
    name: 'Tracing',
    desc: 'Practice writing',
    topBg: '#EEE2F5', accent: '#9B7FD4',
    icon: <PencilIcon color="#9B7FD4" />,
  },
  {
    href: '/zone/rabbit/wordgame',
    name: 'Word Game',
    desc: 'Build simple words',
    topBg: '#F5EEE2', accent: '#F97316',
    icon: <BlocksIcon color="#F97316" />,
  },
  {
    href: '/zone/rabbit/math',
    name: 'Math',
    desc: 'Addition and more',
    topBg: '#F5F5E2', accent: '#D4A017',
    icon: <PlusIcon color="#D4A017" />,
  },
]

/* ── Rabbit loader ── */
const _rc = new Map()
function useRabbitAnim() {
  const [data, setData] = useState(() => _rc.get('r') ?? null)
  useEffect(() => {
    if (_rc.has('r')) return
    fetch('/animations/rabbit-clean.json')
      .then(r => r.json()).then(d => { _rc.set('r', d); setData(d) }).catch(() => {})
  }, [])
  return data
}

export default function RabbitHub() {
  const router = useRouter()
  const [name, setName] = useState('Friend')
  const rabbitAnim = useRabbitAnim()

  useEffect(() => {
    setName(localStorage.getItem('miniMindsName') || 'Friend')
  }, [])

  return (
    <div style={{ minHeight: '100dvh', fontFamily: "'Fredoka', sans-serif" }}>
      <WinterBg />

      {/* Back button */}
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
        <button
          onClick={() => router.push('/home')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
            borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.85)',
            color: '#1B2E4A', fontWeight: 600, fontSize: 15, border: 'none',
            cursor: 'pointer', backdropFilter: 'blur(6px)', minHeight: 44,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="#1B2E4A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>
      </div>

      {/* Content */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
        paddingTop: 60, paddingBottom: 40 }}>

        {/* Rabbit Lottie */}
        <div style={{ width: 150, height: 150 }}>
          {rabbitAnim
            ? <Lottie animationData={rabbitAnim} loop style={{ width: 150, height: 150 }} />
            : <div style={{ width: 150, height: 150 }} />}
        </div>

        {/* Heading */}
        <h1 style={{ color: '#1B2E4A', fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 700,
          textAlign: 'center', margin: '12px 24px 32px', maxWidth: 600 }}>
          What do you want to learn today, {name}?
        </h1>

        {/* Card row — centered, wraps on small screens */}
        <div style={{
          display: 'flex', gap: 16, flexWrap: 'wrap',
          justifyContent: 'center', alignItems: 'flex-start',
          width: '100%', padding: '0 24px 12px',
        }}>
          {ACTIVITIES.map((act, i) => (
            <Link key={act.href} href={act.href} style={{ textDecoration: 'none', flexShrink: 0 }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, type: 'spring', stiffness: 260, damping: 22 }}
                whileHover={{ scale: 1.04, y: -4 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: 200, height: 240, borderRadius: 24,
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
                  overflow: 'hidden',
                  display: 'flex', flexDirection: 'column',
                  borderBottom: `4px solid ${act.accent}`,
                  cursor: 'pointer',
                }}
              >
                {/* Top half — colored */}
                <div style={{
                  flex: '0 0 50%', backgroundColor: act.topBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {act.icon}
                </div>

                {/* Bottom half — white */}
                <div style={{
                  flex: '0 0 50%', padding: '12px 16px',
                  display: 'flex', flexDirection: 'column', justifyContent: 'center',
                }}>
                  <p style={{ fontSize: 18, fontWeight: 700, color: '#1B2E4A', margin: 0, lineHeight: 1.2 }}>
                    {act.name}
                  </p>
                  <p style={{ fontSize: 13, color: '#8898A8', margin: '4px 0 0', lineHeight: 1.3 }}>
                    {act.desc}
                  </p>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
