'use client'

import { useRouter } from 'next/navigation'
import { AfricanSunsetBg } from '@/components/AfricanSunsetBg'

export default function PersonalStory() {
  const router = useRouter()
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', fontFamily: "'Fredoka', sans-serif" }}>
      <AfricanSunsetBg />

      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
        <button onClick={() => router.push('/zone/elephant')} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
          borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.2)',
          color: '#FFF8E7', fontWeight: 600, fontSize: 15,
          border: '1.5px solid rgba(255,255,255,0.4)',
          cursor: 'pointer', backdropFilter: 'blur(8px)', minHeight: 44,
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="#FFF8E7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>
      </div>

      <div style={{ textAlign: 'center', padding: '0 24px' }}>
        <h1 style={{ color: '#FFF8E7', fontSize: 28, fontWeight: 700,
          textShadow: '0 2px 12px rgba(0,0,0,0.3)', marginBottom: 12 }}>
          My Own Story
        </h1>
        <p style={{ color: 'rgba(255,248,231,0.8)', fontSize: 18, marginBottom: 28 }}>
          Coming soon — your personal story is on its way!
        </p>
        <button onClick={() => router.push('/zone/elephant')} style={{
          padding: '14px 32px', borderRadius: 999, border: 'none',
          backgroundColor: '#E8763A', color: '#FFF8E7', fontWeight: 600, fontSize: 17,
          cursor: 'pointer', minHeight: 52,
          boxShadow: '0 4px 16px rgba(232,118,58,0.4)',
        }}>
          Back to Stories
        </button>
      </div>
    </div>
  )
}
