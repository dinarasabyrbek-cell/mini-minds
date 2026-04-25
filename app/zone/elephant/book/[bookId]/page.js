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

const LOAD_MSGS = [
  'Elephant is getting your book ready...',
  'Writing the story...',
  'Almost there...',
]
const F = "'Fredoka', sans-serif"

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
      animate={playing ? { opacity: [1, 0.55, 1] } : { opacity: 1 }}
      transition={playing ? { repeat: Infinity, duration: 1.1 } : {}}
      style={{
        width: 52, height: 52, borderRadius: '50%', border: 'none', flexShrink: 0,
        backgroundColor: '#E8763A', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 14px rgba(232,118,58,0.45)',
      }}
    >
      {playing
        ? <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="3" y="3" width="5" height="14" rx="2" fill="white" />
            <rect x="12" y="3" width="5" height="14" rx="2" fill="white" />
          </svg>
        : <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 7H7.5L12 3.5V16.5L7.5 13H4V7Z" fill="white" />
            <path d="M15 6.5C16.2 7.7 16.2 12.3 15 13.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M17.5 4.5C19.8 6.8 19.8 13.2 17.5 15.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
      }
    </motion.button>
  )
}

function NavBtn({ dir, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: 52, height: 52, borderRadius: '50%', border: 'none', flexShrink: 0,
      backgroundColor: 'rgba(255,255,255,0.9)',
      opacity: disabled ? 0.3 : 1, cursor: disabled ? 'default' : 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: disabled ? 'none' : '0 3px 12px rgba(0,0,0,0.15)',
    }}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        {dir === 'left'
          ? <path d="M13 4L7 10L13 16" stroke="#1B2E4A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          : <path d="M7 4L13 10L7 16" stroke="#1B2E4A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        }
      </svg>
    </button>
  )
}

function PageDots({ total, current }) {
  if (total > 12) return null
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: 8, height: 8, borderRadius: '50%',
          backgroundColor: i === current ? '#E8763A' : 'rgba(255,255,255,0.5)',
          transition: 'background-color 0.2s',
        }} />
      ))}
    </div>
  )
}

function Celebration({ onReadAgain, onChoose }) {
  const anim = useElephantAnim()
  useEffect(() => {
    import('canvas-confetti').then(m =>
      m.default({ particleCount: 130, spread: 80, origin: { y: 0.55 } })
    )
  }, [])
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 24, padding: '0 24px', textAlign: 'center' }}>
      <div style={{ width: 160, height: 160 }}>
        {anim && <Lottie animationData={anim} loop style={{ width: 160, height: 160 }} />}
      </div>
      <h1 style={{ color: '#FFF8E7', fontSize: 32, fontWeight: 700, margin: 0,
        textShadow: '0 2px 12px rgba(0,0,0,0.3)', fontFamily: F }}>
        You finished the story!
      </h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 320 }}>
        <button onClick={onReadAgain} style={{
          padding: '14px 0', borderRadius: 999, border: 'none', minHeight: 52,
          backgroundColor: '#E8763A', color: '#FFF8E7', fontWeight: 600, fontSize: 17,
          cursor: 'pointer', fontFamily: F, boxShadow: '0 4px 16px rgba(232,118,58,0.4)',
        }}>Read Again</button>
        <button onClick={onChoose} style={{
          padding: '14px 0', borderRadius: 999, minHeight: 52,
          border: '2px solid rgba(255,248,231,0.6)',
          backgroundColor: 'transparent', color: '#FFF8E7', fontWeight: 600, fontSize: 17,
          cursor: 'pointer', fontFamily: F,
        }}>Choose Another Story</button>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   MAIN PAGE
   Strategy: load story TEXT first (fast, ~3s), show reader immediately.
   Images load lazily per-page in the background — never block reading.
══════════════════════════════════════════ */
export default function BookReader() {
  const { bookId } = useParams()
  const router     = useRouter()
  const book       = getBook(bookId)

  const [phase,   setPhase]   = useState('loading') // loading | reading | done
  const [loadMsg, setLoadMsg] = useState(0)
  const [error,   setError]   = useState(null)
  const [pages,   setPages]   = useState([])
  // images: { [pageIndex]: string | 'loading' | null }
  const [images,  setImages]  = useState({})
  const [pageIdx, setPageIdx] = useState(0)
  const generatingRef = useRef(new Set()) // track in-flight requests
  const elephantAnim  = useElephantAnim()

  useEffect(() => {
    if (phase !== 'loading') return
    const id = setInterval(() => setLoadMsg(m => (m + 1) % LOAD_MSGS.length), 2000)
    return () => clearInterval(id)
  }, [phase])

  useEffect(() => {
    if (!book) return
    loadStory()
  }, [book])

  /* Load pre-cached images on mount */
  useEffect(() => {
    if (!book) return
    const cached = {}
    for (let i = 0; i < book.pageCount; i++) {
      const url = getCachedImage(book.id, i)
      if (url) cached[i] = url
    }
    if (Object.keys(cached).length) setImages(prev => ({ ...prev, ...cached }))
  }, [book])

  /* Trigger image generation for current page + prefetch next */
  useEffect(() => {
    if (phase !== 'reading' || !book) return
    generateImage(pageIdx)
    if (pageIdx + 1 < book.pageCount) generateImage(pageIdx + 1)
  }, [pageIdx, phase, book])

  async function loadStory() {
    try {
      setError(null)
      setPhase('loading')

      /* ── Story text (fast) ── */
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
      setPageIdx(0)
      setPhase('reading')  // ← reader opens immediately, images load in background
    } catch (err) {
      console.error('Book load error:', err)
      setError('Something went wrong, please try again')
    }
  }

  /* Generate a single image lazily — safe to call multiple times */
  async function generateImage(idx) {
    if (!book) return
    if (getCachedImage(book.id, idx)) return // already cached
    if (generatingRef.current.has(idx)) return // already in-flight

    generatingRef.current.add(idx)
    setImages(prev => ({ ...prev, [idx]: 'loading' }))

    try {
      const prompt = idx === 0 ? book.coverPrompt : (book.pagePrompts[idx] ?? book.coverPrompt)
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, bookId: book.id, pageIndex: idx,
          zone: 'elephant', kind: idx === 0 ? 'cover' : 'page' }),
      })
      const data = await res.json()
      if (res.ok && data.imageUrl) {
        setCachedImage(book.id, idx, data.imageUrl)
        setImages(prev => ({ ...prev, [idx]: data.imageUrl }))
      } else {
        setImages(prev => ({ ...prev, [idx]: null }))
      }
    } catch {
      setImages(prev => ({ ...prev, [idx]: null }))
    } finally {
      generatingRef.current.delete(idx)
    }
  }

  if (!book) return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <AfricanSunsetBg />
      <p style={{ color: '#FFF8E7', fontSize: 20, fontFamily: F }}>Book not found.</p>
    </div>
  )

  const isFirst = pageIdx === 0
  const isLast  = pages.length > 0 && pageIdx === pages.length - 1
  const textSize = book.ageGroup === '3-5' ? 22 : 18
  const pageImage = images[pageIdx]

  return (
    <div style={{ minHeight: '100dvh', fontFamily: F, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <AfricanSunsetBg />

      {/* ── LOADING (only while fetching story text) ── */}
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
                textShadow: '0 2px 8px rgba(0,0,0,0.3)', fontFamily: F }}>
              {LOAD_MSGS[loadMsg]}
            </motion.p>
          </AnimatePresence>
        </div>
      )}

      {/* ── ERROR ── */}
      {error && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 16, padding: '0 24px', textAlign: 'center' }}>
          <p style={{ color: '#FFF8E7', fontSize: 20, fontWeight: 600, fontFamily: F,
            textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
            {error}
          </p>
          <button onClick={loadStory} style={{
            padding: '12px 28px', borderRadius: 999, border: 'none', minHeight: 48,
            backgroundColor: '#E8763A', color: '#FFF8E7', fontWeight: 600, fontSize: 16,
            cursor: 'pointer', fontFamily: F,
          }}>Try Again</button>
        </div>
      )}

      {/* ── CELEBRATION ── */}
      {phase === 'done' && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Celebration
            onReadAgain={() => { setPageIdx(0); setPhase('reading') }}
            onChoose={() => { stopCurrent(); router.push('/zone/elephant') }}
          />
        </div>
      )}

      {/* ── READING ── */}
      {phase === 'reading' && pages.length > 0 && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Top bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px', flexShrink: 0 }}>
            <button onClick={() => { stopCurrent(); router.push('/zone/elephant') }}
              style={{ width: 40, height: 40, borderRadius: '50%', border: 'none',
                backgroundColor: 'rgba(255,255,255,0.2)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(6px)', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M11 4L5 9L11 14" stroke="#FFF8E7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <p style={{ color: '#FFF8E7', fontWeight: 700, fontSize: 18, margin: 0,
              textAlign: 'center', textShadow: '0 2px 8px rgba(0,0,0,0.3)',
              flex: 1, padding: '0 10px', overflow: 'hidden',
              textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {book.title}
            </p>

            <p style={{ color: 'rgba(255,248,231,0.8)', fontSize: 14, fontWeight: 400,
              margin: 0, whiteSpace: 'nowrap', flexShrink: 0 }}>
              Page {pageIdx + 1} of {pages.length}
            </p>
          </div>

          {/* Scrollable content */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column',
            padding: '0 16px 16px', gap: 16 }}>

            {/* Illustration */}
            <div style={{
              width: '100%', maxWidth: 480, margin: '0 auto', flexShrink: 0,
              height: 'clamp(200px, 42vh, 340px)',
              borderRadius: 16, overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              backgroundColor: '#E8763A', position: 'relative',
            }}>
              <AnimatePresence mode="wait">
                {pageImage && pageImage !== 'loading'
                  ? <motion.img key={`img-${pageIdx}`} src={pageImage} alt=""
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ width: '100%', height: '100%', objectFit: 'cover',
                        position: 'absolute', inset: 0 }} />
                  : <motion.div key={`ph-${pageIdx}`}
                      animate={{ opacity: pageImage === 'loading' ? [0.6, 1, 0.6] : 0.8 }}
                      transition={pageImage === 'loading' ? { repeat: Infinity, duration: 1.6 } : {}}
                      style={{ position: 'absolute', inset: 0,
                        background: 'linear-gradient(135deg, #E8763A 0%, #F5C842 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 15, fontFamily: F,
                        textAlign: 'center', padding: '0 16px' }}>
                        {pageImage === 'loading' ? 'Painting this page...' : book.title}
                      </p>
                    </motion.div>
                }
              </AnimatePresence>
            </div>

            {/* Text card */}
            <div style={{ width: '100%', maxWidth: 480, margin: '0 auto',
              backgroundColor: 'rgba(255,255,255,0.97)', borderRadius: 16,
              padding: '16px 20px', boxShadow: '0 6px 24px rgba(0,0,0,0.12)' }}>
              <AnimatePresence mode="wait">
                <motion.p key={pageIdx}
                  initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.22 }}
                  style={{ margin: 0, color: '#1B2E4A', lineHeight: 1.8,
                    fontSize: textSize, fontFamily: F, fontWeight: 500, textAlign: 'center' }}>
                  {pages[pageIdx]?.text ?? ''}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Navigation */}
            <div style={{ width: '100%', maxWidth: 480, margin: '0 auto',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <NavBtn dir="left" onClick={() => setPageIdx(i => i - 1)} disabled={isFirst} />
              <SpeakerBtn text={pages[pageIdx]?.text ?? ''} />
              {isLast
                ? <button onClick={() => { stopCurrent(); setPhase('done') }} style={{
                    height: 52, padding: '0 22px', borderRadius: 999, border: 'none',
                    backgroundColor: '#E8763A', color: '#FFF8E7', fontWeight: 600, fontSize: 16,
                    cursor: 'pointer', fontFamily: F, flexShrink: 0,
                    boxShadow: '0 4px 14px rgba(232,118,58,0.4)',
                  }}>Done</button>
                : <NavBtn dir="right" onClick={() => setPageIdx(i => i + 1)} disabled={false} />
              }
            </div>

            {/* Page dots */}
            <PageDots total={pages.length} current={pageIdx} />
          </div>
        </div>
      )}
    </div>
  )
}
