'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import { AfricanSunsetBg } from '@/components/AfricanSunsetBg'
import { getBook } from '@/lib/bookData'
import {
  getCachedImage, setCachedImage,
  getCachedStoryText, setCachedStoryText,
} from '@/lib/imageCache'
import { speak, stopCurrent } from '@/lib/elevenlabs'

const Lottie = dynamic(() => import('lottie-react'), { ssr: false })
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

/* ── Loading messages cycle ── */
const LOAD_MSGS = [
  'Elephant is getting your book ready...',
  'Painting the pictures...',
  'Almost there...',
]

/* ── Speaker button ── */
function SpeakerBtn({ text }) {
  const [playing, setPlaying] = useState(false)

  async function toggle() {
    if (playing) { stopCurrent(); setPlaying(false); return }
    setPlaying(true)
    await speak(text)
    setPlaying(false)
  }

  return (
    <motion.button
      onClick={toggle}
      animate={playing ? { opacity: [1, 0.6, 1] } : { opacity: 1 }}
      transition={playing ? { repeat: Infinity, duration: 1.2 } : {}}
      style={{
        width: 56, height: 56, borderRadius: '50%', border: 'none',
        backgroundColor: '#E8763A', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 14px rgba(232,118,58,0.4)',
      }}
    >
      {playing
        ? <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <rect x="3" y="3" width="6" height="16" rx="2" fill="white" />
            <rect x="13" y="3" width="6" height="16" rx="2" fill="white" />
          </svg>
        : <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M4 8H8L13 4V18L8 14H4V8Z" fill="white" />
            <path d="M16 7C17.5 8.5 17.5 13.5 16 15" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <path d="M19 5C21.5 7.5 21.5 14.5 19 17" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
      }
    </motion.button>
  )
}

/* ── Page dots ── */
function PageDots({ total, current }) {
  if (total > 12) return (
    <p style={{ color: 'rgba(255,248,231,0.8)', fontSize: 14,
      fontFamily: "'Fredoka', sans-serif", textAlign: 'center' }}>
      {current + 1} of {total}
    </p>
  )
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: 10, height: 10, borderRadius: '50%',
          backgroundColor: i === current ? '#E8763A' : 'transparent',
          border: `2px solid ${i === current ? '#E8763A' : 'rgba(255,248,231,0.5)'}`,
          transition: 'all 0.2s',
        }} />
      ))}
    </div>
  )
}

/* ── Celebration screen ── */
function Celebration({ name, onReadAgain, onChoose }) {
  const elephantAnim = useElephantAnim()

  useEffect(() => {
    import('canvas-confetti').then(m =>
      m.default({ particleCount: 130, spread: 80, origin: { y: 0.55 } })
    )
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 24, padding: '0 24px', textAlign: 'center' }}>
      <div style={{ width: 160, height: 160 }}>
        {elephantAnim && <Lottie animationData={elephantAnim} loop style={{ width: 160, height: 160 }} />}
      </div>
      <h1 style={{ color: '#FFF8E7', fontSize: 32, fontWeight: 700, margin: 0,
        textShadow: '0 2px 12px rgba(0,0,0,0.3)', fontFamily: "'Fredoka', sans-serif" }}>
        You finished the story!
      </h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 320 }}>
        <button onClick={onReadAgain} style={{
          padding: '14px 0', borderRadius: 999, border: 'none',
          backgroundColor: '#E8763A', color: '#FFF8E7', fontWeight: 600, fontSize: 17,
          cursor: 'pointer', minHeight: 52, fontFamily: "'Fredoka', sans-serif",
          boxShadow: '0 4px 16px rgba(232,118,58,0.4)',
        }}>Read Again</button>
        <button onClick={onChoose} style={{
          padding: '14px 0', borderRadius: 999, border: '2px solid rgba(255,248,231,0.6)',
          backgroundColor: 'transparent', color: '#FFF8E7', fontWeight: 600, fontSize: 17,
          cursor: 'pointer', minHeight: 52, fontFamily: "'Fredoka', sans-serif",
        }}>Choose Another Story</button>
      </div>
    </div>
  )
}

/* ── Main reader page ── */
export default function BookReader() {
  const { bookId }     = useParams()
  const router         = useRouter()
  const book           = getBook(bookId)

  const [phase,      setPhase]      = useState('loading') // loading | reading | done
  const [loadMsg,    setLoadMsg]    = useState(0)
  const [error,      setError]      = useState(null)
  const [pages,      setPages]      = useState([])   // [{page, text}]
  const [images,     setImages]     = useState([])   // string[]
  const [pageIdx,    setPageIdx]    = useState(0)
  const [name,       setName]       = useState('Friend')
  const elephantAnim = useElephantAnim()

  useEffect(() => { setName(localStorage.getItem('miniMindsName') || 'Friend') }, [])

  /* Cycle loading messages */
  useEffect(() => {
    if (phase !== 'loading') return
    const id = setInterval(() => setLoadMsg(m => (m + 1) % LOAD_MSGS.length), 2200)
    return () => clearInterval(id)
  }, [phase])

  /* Generate / load content */
  useEffect(() => {
    if (!book) return
    generate()
  }, [book])

  async function generate() {
    try {
      setError(null)
      setPhase('loading')

      /* ── Story text ── */
      let storyPages = getCachedStoryText(book.id)
      if (!storyPages) {
        const res = await fetch('/api/generate-story-text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookId: book.id, title: book.title,
            ageGroup: book.ageGroup, pageCount: book.pageCount,
          }),
        })
        const data = await res.json()
        if (!res.ok || !data.pages) throw new Error(data.error || 'Story generation failed')
        storyPages = data.pages
        setCachedStoryText(book.id, storyPages)
      }
      setPages(storyPages)

      /* ── Images ── */
      const imgs = []
      for (let i = 0; i < book.pageCount; i++) {
        const cached = getCachedImage(book.id, i)
        if (cached) { imgs.push(cached); continue }

        const prompt = i === 0 ? book.coverPrompt : (book.pagePrompts[i] ?? book.coverPrompt)
        const res = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        })
        const data = await res.json()
        if (!res.ok || !data.imageUrl) {
          imgs.push(null) // allow null — show placeholder
          continue
        }
        setCachedImage(book.id, i, data.imageUrl)
        imgs.push(data.imageUrl)
      }

      setImages(imgs)
      setPageIdx(0)
      setPhase('reading')
    } catch (err) {
      console.error('Book generation error:', err)
      setError(err.message || 'Something went wrong')
    }
  }

  if (!book) return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <AfricanSunsetBg />
      <p style={{ color: '#FFF8E7', fontSize: 20, fontFamily: "'Fredoka', sans-serif" }}>
        Book not found.
      </p>
    </div>
  )

  /* ── Nav arrow ── */
  function NavArrow({ dir, onClick, disabled }) {
    return (
      <button onClick={onClick} disabled={disabled} style={{
        width: 56, height: 56, borderRadius: '50%', border: 'none',
        backgroundColor: 'rgba(255,255,255,0.88)',
        opacity: disabled ? 0.3 : 1, cursor: disabled ? 'default' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 3px 12px rgba(0,0,0,0.15)', flexShrink: 0,
      }}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          {dir === 'left'
            ? <path d="M14 4L8 11L14 18" stroke="#3D1F0A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            : <path d="M8 4L14 11L8 18" stroke="#3D1F0A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          }
        </svg>
      </button>
    )
  }

  return (
    <div style={{ minHeight: '100dvh', fontFamily: "'Fredoka', sans-serif", display: 'flex', flexDirection: 'column' }}>
      <AfricanSunsetBg />

      {/* Back button */}
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
        <button onClick={() => { stopCurrent(); router.push('/zone/elephant') }} style={{
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

      {/* Book title top center */}
      {phase === 'reading' && (
        <div style={{ position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)',
          zIndex: 5, pointerEvents: 'none' }}>
          <p style={{ color: '#FFF8E7', fontWeight: 600, fontSize: 15,
            textShadow: '0 2px 8px rgba(0,0,0,0.3)', whiteSpace: 'nowrap',
            fontFamily: "'Fredoka', sans-serif" }}>
            {book.title}
          </p>
        </div>
      )}

      {/* ── LOADING ── */}
      {phase === 'loading' && !error && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 24, padding: '0 24px' }}>
          <div style={{ width: 150, height: 150 }}>
            {elephantAnim && <Lottie animationData={elephantAnim} loop style={{ width: 150, height: 150 }} />}
          </div>
          <AnimatePresence mode="wait">
            <motion.p key={loadMsg}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              style={{ color: '#FFF8E7', fontSize: 20, fontWeight: 600, textAlign: 'center',
                textShadow: '0 2px 8px rgba(0,0,0,0.3)', fontFamily: "'Fredoka', sans-serif" }}>
              {LOAD_MSGS[loadMsg]}
            </motion.p>
          </AnimatePresence>
        </div>
      )}

      {/* ── ERROR ── */}
      {error && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 16, padding: '0 24px', textAlign: 'center' }}>
          <p style={{ color: '#FFF8E7', fontSize: 20, fontWeight: 600,
            fontFamily: "'Fredoka', sans-serif", textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
            Something went wrong, please try again
          </p>
          <button onClick={generate} style={{
            padding: '12px 28px', borderRadius: 999, border: 'none',
            backgroundColor: '#E8763A', color: '#FFF8E7', fontWeight: 600, fontSize: 16,
            cursor: 'pointer', minHeight: 48, fontFamily: "'Fredoka', sans-serif",
          }}>
            Try Again
          </button>
        </div>
      )}

      {/* ── CELEBRATION ── */}
      {phase === 'done' && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Celebration
            name={name}
            onReadAgain={() => { setPageIdx(0); setPhase('reading') }}
            onChoose={() => router.push('/zone/elephant')}
          />
        </div>
      )}

      {/* ── READING ── */}
      {phase === 'reading' && pages.length > 0 && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 16, padding: '72px 16px 24px' }}>

          {/* Image + nav row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', maxWidth: 560 }}>
            <NavArrow dir="left" onClick={() => setPageIdx(i => i - 1)} disabled={pageIdx === 0} />

            {/* Page image */}
            <div style={{
              flex: 1, aspectRatio: '1', borderRadius: 16, overflow: 'hidden',
              backgroundColor: '#E8763A', boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {images[pageIdx]
                ? <img src={images[pageIdx]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <motion.div animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    style={{ width: '100%', height: '100%', backgroundColor: '#E8763A',
                      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14,
                      fontFamily: "'Fredoka', sans-serif" }}>Loading image...</p>
                  </motion.div>
              }
            </div>

            {/* Right nav or Finish */}
            {pageIdx < pages.length - 1
              ? <NavArrow dir="right" onClick={() => setPageIdx(i => i + 1)} disabled={false} />
              : <button onClick={() => setPhase('done')} style={{
                  width: 56, height: 56, borderRadius: 999, border: 'none',
                  backgroundColor: '#E8763A', color: '#FFF8E7', fontWeight: 700, fontSize: 13,
                  cursor: 'pointer', boxShadow: '0 3px 12px rgba(232,118,58,0.4)',
                  fontFamily: "'Fredoka', sans-serif", whiteSpace: 'nowrap',
                  flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>End</button>
            }
          </div>

          {/* Page dots */}
          <PageDots total={pages.length} current={pageIdx} />

          {/* Text card */}
          <div style={{
            width: '100%', maxWidth: 560, backgroundColor: 'rgba(255,255,255,0.95)',
            borderRadius: 24, padding: '20px 24px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          }}>
            <AnimatePresence mode="wait">
              <motion.p key={pageIdx}
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.22 }}
                style={{
                  margin: 0, color: '#1B2E4A', lineHeight: 1.8,
                  fontSize: book.ageGroup === '3-5' ? 24 : 20,
                  fontFamily: "'Fredoka', sans-serif", fontWeight: 500,
                }}>
                {pages[pageIdx]?.text ?? ''}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Speaker button */}
          <SpeakerBtn text={pages[pageIdx]?.text ?? ''} />
        </div>
      )}
    </div>
  )
}
