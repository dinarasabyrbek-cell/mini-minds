'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { AfricanSunsetBg } from '@/components/AfricanSunsetBg'
import { BOOKS } from '@/lib/bookData'
import { getCachedImage, setCachedImage } from '@/lib/imageCache'

const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

/* ── Elephant loader ── */
const _ec = new Map()
function useElephantAnim() {
  const [data, setData] = useState(() => _ec.get('e') ?? null)
  useEffect(() => {
    if (_ec.has('e')) return
    fetch('/animations/elephant-clean.json')
      .then(r => r.json()).then(d => { _ec.set('e', d); setData(d) }).catch(() => {})
  }, [])
  return data
}

/* ── Covers: load cached, then generate once ── */
function useBookCovers(books) {
  const [covers, setCovers] = useState(() => ({})) // { [bookId]: url }

  useEffect(() => {
    let cancelled = false

    // 1) Load from local cache synchronously on mount
    try {
      const next = {}
      for (const b of books) {
        const cached = getCachedImage(b.id, 0)
        if (cached) next[b.id] = cached
      }
      setCovers(prev => ({ ...prev, ...next }))
    } catch {}

    // 2) Generate missing covers sequentially (polite to API)
    ;(async () => {
      for (const b of books) {
        if (cancelled) return
        if (getCachedImage(b.id, 0)) continue

        try {
          const res = await fetch('/api/generate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: b.coverPrompt }),
          })
          const data = await res.json()
          if (!res.ok || !data.imageUrl) continue

          setCachedImage(b.id, 0, data.imageUrl)
          if (!cancelled) setCovers(prev => ({ ...prev, [b.id]: data.imageUrl }))
        } catch {
          // keep placeholder
        }
      }
    })()

    return () => { cancelled = true }
  }, [books])

  return covers
}

/* ── Age badge ── */
function AgeBadge({ group }) {
  const isYoung = group === '3-5'
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600,
      backgroundColor: isYoung ? '#E8F5E2' : '#E2EEF5',
      color: isYoung ? '#2D6A2D' : '#185FA5',
      fontFamily: "'Fredoka', sans-serif",
    }}>
      Ages {group}
    </span>
  )
}

/* ── Personal story card ── */
function PersonalCard() {
  return (
    <Link href="/zone/elephant/personal" style={{ textDecoration: 'none' }}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        style={{
          borderRadius: 24, overflow: 'hidden', cursor: 'pointer',
          boxShadow: '0 6px 24px rgba(0,0,0,0.18)',
          backgroundColor: '#FFFFFF',
          border: '2px solid rgba(255,248,231,0.35)',
        }}
      >
        {/* Top — purple gradient */}
        <div style={{
          height: 180, position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(135deg, #4A1B7A 0%, #7B4FA0 100%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          {/* Star pattern overlay */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            {[[20,30],[80,20],[140,45],[60,80],[110,65],[170,25],[30,90],[150,85],[90,50]].map(([x,y],i) => (
              <circle key={i} cx={`${x}%`} cy={`${y}%`} r="2" fill="white" opacity="0.18" />
            ))}
          </svg>
          <p style={{ color: '#FFFFFF', fontSize: 20, fontWeight: 700, margin: 0, zIndex: 1,
            fontFamily: "'Fredoka', sans-serif", textShadow: '0 1px 6px rgba(0,0,0,0.3)' }}>
            My Own Story
          </p>
          <p style={{ color: '#DDB8F5', fontSize: 14, margin: '4px 0 0', zIndex: 1,
            fontFamily: "'Fredoka', sans-serif" }}>
            Made just for you
          </p>
        </div>

        {/* Bottom */}
        <div style={{ padding: 16 }}>
          <button style={{
            width: '100%', padding: '10px 0', borderRadius: 999, border: 'none',
            backgroundColor: '#7B4FA0', color: '#FFFFFF', fontWeight: 600, fontSize: 15,
            cursor: 'pointer', minHeight: 44, fontFamily: "'Fredoka', sans-serif",
          }}>
            Create Story
          </button>
        </div>
      </motion.div>
    </Link>
  )
}

/* ── Book card ── */
function BookCard({ book, coverUrl }) {
  return (
    <Link href={`/zone/elephant/book/${book.id}`} style={{ textDecoration: 'none' }}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        style={{
          borderRadius: 24, overflow: 'hidden', cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(0,0,0,0.14)',
          backgroundColor: '#FFFFFF',
        }}
      >
        {/* Cover image / placeholder */}
        <div style={{
          height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: coverUrl ? '#FFFFFF' : 'linear-gradient(135deg, #E8763A 0%, #F5C842 100%)',
          padding: 16, textAlign: 'center',
          position: 'relative',
        }}>
          {coverUrl ? (
            <img
              src={coverUrl}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
            />
          ) : (
            <p style={{
              color: '#FFFFFF', fontSize: 17, fontWeight: 700,
              fontFamily: "'Fredoka', sans-serif",
              textShadow: '0 1px 6px rgba(0,0,0,0.25)', lineHeight: 1.3,
            }}>
              {book.title}
            </p>
          )}
        </div>

        {/* Bottom */}
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#3D1F0A',
            fontFamily: "'Fredoka', sans-serif" }}>{book.title}</p>
          <AgeBadge group={book.ageGroup} />
          <button style={{
            marginTop: 4, padding: '10px 0', borderRadius: 999, border: 'none',
            backgroundColor: '#E8763A', color: '#FFFFFF', fontWeight: 600, fontSize: 15,
            cursor: 'pointer', minHeight: 44, fontFamily: "'Fredoka', sans-serif",
          }}>
            Read Story
          </button>
        </div>
      </motion.div>
    </Link>
  )
}

/* ── Hub page ── */
export default function ElephantHub() {
  const router = useRouter()
  const [name, setName] = useState('Friend')
  const elephantAnim = useElephantAnim()
  const covers = useBookCovers(BOOKS)
  const [cols, setCols] = useState(1)

  useEffect(() => { setName(localStorage.getItem('miniMindsName') || 'Friend') }, [])

  useEffect(() => {
    function computeCols() {
      const w = window.innerWidth
      if (w >= 1024) return 3
      if (w >= 768) return 2
      return 1
    }
    const onResize = () => setCols(computeCols())
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <div style={{ minHeight: '100dvh', fontFamily: "'Fredoka', sans-serif" }}>
      <AfricanSunsetBg />

      {/* Back button */}
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
        <button onClick={() => router.push('/home')} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
          borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.2)',
          color: '#FFF8E7', fontWeight: 600, fontSize: 15, border: '1.5px solid rgba(255,255,255,0.4)',
          cursor: 'pointer', backdropFilter: 'blur(8px)', minHeight: 44,
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="#FFF8E7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>
      </div>

      <div style={{ padding: '64px 24px 48px', maxWidth: 1100, margin: '0 auto' }}>
        {/* Elephant Lottie */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <div style={{ width: 150, height: 150 }}>
            {elephantAnim
              ? <Lottie animationData={elephantAnim} loop style={{ width: 150, height: 150 }} />
              : <div style={{ width: 150, height: 150 }} />}
          </div>
        </div>

        {/* Heading */}
        <h1 style={{
          textAlign: 'center', color: '#FFF8E7', fontWeight: 700,
          fontSize: 'clamp(20px, 3vw, 30px)', marginBottom: 36,
          textShadow: '0 2px 12px rgba(0,0,0,0.3)',
        }}>
          What story shall we read, {name}?
        </h1>

        {/* Book grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gap: 20,
        }}>
          <PersonalCard />
          {BOOKS.map(book => <BookCard key={book.id} book={book} coverUrl={covers[book.id] || null} />)}
        </div>
      </div>
    </div>
  )
}
