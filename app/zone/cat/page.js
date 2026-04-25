'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import BackButton from '@/components/BackButton'

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
        <rect x="120" y="80" width="220" height="145" fill="#7AC5F0" />
        <ellipse cx="175" cy="140" rx="50" ry="24" fill="white" opacity="0.8" />
        <path d="M110 70 Q88 170 110 380" fill="#E05C2A" opacity="0.35" />
        <path d="M350 70 Q372 170 350 380" fill="#E05C2A" opacity="0.35" />
        <ellipse cx="1050" cy="700" rx="280" ry="110" fill="#E05C2A" opacity="0.65" />
        <ellipse cx="1050" cy="700" rx="220" ry="82" fill="none" stroke="#FFFBF5" strokeWidth="5" opacity="0.35" />
        <rect x="600" y="80" width="160" height="120" rx="6" fill="#FFFBF5" stroke="#854D0E" strokeWidth="8" />
        <text x="680" y="152" textAnchor="middle" fontSize="48">🎨</text>
        <rect x="1200" y="100" width="140" height="100" rx="6" fill="#FFFBF5" stroke="#854D0E" strokeWidth="8" />
        <text x="1270" y="165" textAnchor="middle" fontSize="40">⭐</text>
      </svg>
    </div>
  )
}

const CARDS = [
  {
    href: '/zone/cat/match',
    icon: '🃏',
    label: 'Letter Match',
    sub: 'Flip cards & find pairs',
    accent: '#E05C2A',
    shadow: 'rgba(224,92,42,0.25)',
    textColor: '#7C2D12',
  },
  {
    href: '/zone/cat/coloring',
    icon: '🎨',
    label: 'Coloring Book',
    sub: 'Paint fun scenes',
    accent: '#8B5CF6',
    shadow: 'rgba(139,92,246,0.25)',
    textColor: '#4C1D95',
  },
  {
    href: '/zone/cat/oddoneout',
    icon: '🤔',
    label: 'Odd One Out',
    sub: "Find the one that doesn't fit",
    accent: '#22C55E',
    shadow: 'rgba(34,197,94,0.25)',
    textColor: '#14532D',
    wide: true,
  },
]

export default function CatHub() {
  return (
    <div className="min-h-screen relative flex flex-col" style={{ fontFamily: 'var(--font-fredoka), sans-serif' }}>
      <RoomBg />

      <div className="relative z-10 px-4 py-6 max-w-2xl mx-auto w-full flex flex-col items-center">
        <div className="self-start mb-6">
          <BackButton href="/home" color="#854D0E" />
        </div>

        {/* Cat character */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-2"
          style={{ width: 160, height: 160, position: 'relative' }}
        >
          <Image src="/characters/cat.png" alt="Cat" fill style={{ objectFit: 'contain' }} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-4xl font-bold text-center mb-10"
          style={{ color: '#2D2014' }}
        >
          What do you want to do?
        </motion.h1>

        <div className="grid grid-cols-2 gap-6 w-full">
          {CARDS.map((card, i) => (
            <Link
              key={card.href}
              href={card.href}
              className="block"
              style={card.wide ? { gridColumn: '1 / -1' } : {}}
            >
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1, type: 'spring', stiffness: 280, damping: 22 }}
                whileHover={{ scale: card.wide ? 1.03 : 1.06, y: -4 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center rounded-3xl cursor-pointer"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.88)',
                  border: `3px solid ${card.accent}`,
                  boxShadow: `0 8px 28px ${card.shadow}`,
                  flexDirection: card.wide ? 'row' : 'column',
                  justifyContent: card.wide ? 'center' : 'center',
                  gap: card.wide ? 20 : 12,
                  padding: card.wide ? '28px 40px' : '40px 24px',
                }}
              >
                <span style={{ fontSize: card.wide ? '2.8rem' : '3.2rem', lineHeight: 1 }}>{card.icon}</span>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: card.wide ? 'flex-start' : 'center', gap: 2 }}>
                  <span className="text-xl font-bold" style={{ color: card.textColor }}>{card.label}</span>
                  <span className="text-sm" style={{ color: card.textColor, opacity: 0.7 }}>{card.sub}</span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
