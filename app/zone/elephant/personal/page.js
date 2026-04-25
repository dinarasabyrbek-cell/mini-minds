'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { AfricanSunsetBg } from '@/components/AfricanSunsetBg'
import { speak, stopCurrent } from '@/lib/elevenlabs'

export default function PersonalStory() {
  const router = useRouter()
  const [name, setName] = useState('Friend')
  const [selected, setSelected] = useState([])
  const [extra, setExtra] = useState('')
  const [phase, setPhase] = useState('pick') // pick | loading | read
  const [error, setError] = useState(null)
  const [title, setTitle] = useState('My Own Story')
  const [pages, setPages] = useState([])
  const [pageIdx, setPageIdx] = useState(0)
  const [playing, setPlaying] = useState(false)

  const emojiChoices = useMemo(() => ([
    '🦁','🐘','🦒','🦓','🦛','🦏','🐒','🦋','🌳','🌞','🌙','⭐','🌈','🏕️','🏰','🚀','🚂','🛶','⚽','🎨','🎵','🍎','🍯','🎈',
  ]), [])

  useEffect(() => {
    setName(localStorage.getItem('miniMindsName') || 'Friend')
    try {
      const raw = localStorage.getItem('miniMindsPersonalStory')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed?.pages?.length) {
          setTitle(parsed.title || 'My Own Story')
          setPages(parsed.pages)
          setPhase('read')
        }
      }
    } catch {}
  }, [])

  function toggleEmoji(e) {
    setSelected(prev => {
      const has = prev.includes(e)
      if (has) return prev.filter(x => x !== e)
      if (prev.length >= 5) return prev
      return [...prev, e]
    })
  }

  async function createStory() {
    try {
      setError(null)
      setPhase('loading')
      stopCurrent()

      const res = await fetch('/api/generate-personal-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childName: name,
          emojis: selected,
          ageGroup: '3-5',
          pageCount: 7,
          extra: extra?.trim() || '',
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.pages) throw new Error(data.error || 'Story generation failed')

      setTitle(data.title || 'My Own Story')
      setPages(data.pages)
      setPageIdx(0)
      setPhase('read')
      localStorage.setItem('miniMindsPersonalStory', JSON.stringify({ title: data.title, pages: data.pages }))
    } catch (e) {
      console.error('Personal story error:', e)
      setError('Something went wrong, please try again')
      setPhase('pick')
    }
  }

  async function toggleSpeak() {
    if (!pages[pageIdx]?.text) return
    if (playing) { stopCurrent(); setPlaying(false); return }
    setPlaying(true)
    await speak(pages[pageIdx].text)
    setPlaying(false)
  }

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

      {/* Title top center while reading */}
      {phase === 'read' && (
        <div style={{ position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)',
          zIndex: 5, pointerEvents: 'none' }}>
          <p style={{ color: '#FFF8E7', fontWeight: 600, fontSize: 15,
            textShadow: '0 2px 8px rgba(0,0,0,0.3)', whiteSpace: 'nowrap' }}>
            {title}
          </p>
        </div>
      )}

      {/* Picker */}
      {phase === 'pick' && (
        <div style={{ width: '100%', maxWidth: 720, padding: '0 24px' }}>
          <h1 style={{ color: '#FFF8E7', fontSize: 30, fontWeight: 700,
            textShadow: '0 2px 12px rgba(0,0,0,0.3)', margin: '0 0 12px', textAlign: 'center' }}>
            Create a story for {name}
          </h1>
          <p style={{ color: 'rgba(255,248,231,0.85)', fontSize: 16, margin: '0 0 18px', textAlign: 'center' }}>
            Pick up to 5 emojis, then we will write your story.
          </p>

          <div style={{
            backgroundColor: 'rgba(255,255,255,0.14)',
            border: '1px solid rgba(255,248,231,0.28)',
            backdropFilter: 'blur(10px)',
            borderRadius: 24,
            padding: 16,
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(56px, 1fr))',
              gap: 10,
            }}>
              {emojiChoices.map(e => {
                const isOn = selected.includes(e)
                return (
                  <button key={e} onClick={() => toggleEmoji(e)} style={{
                    height: 56, minWidth: 56, borderRadius: 16,
                    border: isOn ? '2px solid rgba(255,248,231,0.9)' : '1px solid rgba(255,248,231,0.25)',
                    backgroundColor: isOn ? 'rgba(255,248,231,0.16)' : 'rgba(0,0,0,0.08)',
                    cursor: 'pointer',
                    fontSize: 26,
                    lineHeight: '56px',
                  }}>
                    {e}
                  </button>
                )
              })}
            </div>

            <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
              <p style={{ margin: 0, color: 'rgba(255,248,231,0.85)', fontSize: 14 }}>
                Selected:
              </p>
              {selected.length === 0 ? (
                <p style={{ margin: 0, color: 'rgba(255,248,231,0.65)', fontSize: 14 }}>None</p>
              ) : selected.map(e => (
                <span key={e} style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  padding: '4px 10px', borderRadius: 999,
                  backgroundColor: 'rgba(255,255,255,0.18)',
                  border: '1px solid rgba(255,248,231,0.3)',
                  fontSize: 16,
                }}>{e}</span>
              ))}
            </div>

            <div style={{ marginTop: 12 }}>
              <textarea
                value={extra}
                onChange={(e) => setExtra(e.target.value)}
                placeholder="Optional: add a small idea (like a place or a friend)."
                style={{
                  width: '100%',
                  minHeight: 84,
                  resize: 'vertical',
                  borderRadius: 18,
                  border: '1px solid rgba(255,248,231,0.28)',
                  backgroundColor: 'rgba(255,255,255,0.12)',
                  color: '#FFF8E7',
                  padding: '12px 14px',
                  outline: 'none',
                  fontFamily: "'Fredoka', sans-serif",
                  fontSize: 14,
                }}
              />
            </div>

            {error && (
              <p style={{ margin: '10px 0 0', color: '#FFF8E7', fontWeight: 600 }}>
                {error}
              </p>
            )}

            <button
              onClick={createStory}
              disabled={selected.length === 0}
              style={{
                marginTop: 14,
                width: '100%',
                padding: '14px 0',
                borderRadius: 999,
                border: 'none',
                backgroundColor: selected.length === 0 ? 'rgba(232,118,58,0.5)' : '#E8763A',
                color: '#FFF8E7',
                fontWeight: 700,
                fontSize: 16,
                cursor: selected.length === 0 ? 'default' : 'pointer',
                minHeight: 52,
                boxShadow: '0 4px 16px rgba(232,118,58,0.35)',
              }}
            >
              Create Story
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {phase === 'loading' && (
        <div style={{ textAlign: 'center', padding: '0 24px' }}>
          <AnimatePresence mode="wait">
            <motion.p
              key="loading"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              style={{
                color: '#FFF8E7',
                fontSize: 20,
                fontWeight: 700,
                textShadow: '0 2px 12px rgba(0,0,0,0.3)',
                margin: 0,
              }}
            >
              Creating your story...
            </motion.p>
          </AnimatePresence>
        </div>
      )}

      {/* Reader */}
      {phase === 'read' && pages.length > 0 && (
        <div style={{ width: '100%', padding: '72px 16px 24px', display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 16 }}>
          <div style={{ width: '100%', maxWidth: 560, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <button
              onClick={() => { stopCurrent(); setPageIdx(i => Math.max(0, i - 1)) }}
              disabled={pageIdx === 0}
              style={{
                minWidth: 56, height: 56, borderRadius: 999, border: 'none',
                backgroundColor: 'rgba(255,255,255,0.88)',
                opacity: pageIdx === 0 ? 0.3 : 1,
                cursor: pageIdx === 0 ? 'default' : 'pointer',
                boxShadow: '0 3px 12px rgba(0,0,0,0.15)',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M14 4L8 11L14 18" stroke="#3D1F0A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <button
              onClick={() => {
                stopCurrent()
                if (pageIdx >= pages.length - 1) {
                  setPhase('pick')
                  setPages([])
                  setPageIdx(0)
                } else {
                  setPageIdx(i => i + 1)
                }
              }}
              style={{
                minWidth: pageIdx >= pages.length - 1 ? 140 : 56,
                height: 56,
                padding: pageIdx >= pages.length - 1 ? '0 18px' : 0,
                borderRadius: 999,
                border: 'none',
                backgroundColor: pageIdx >= pages.length - 1 ? '#E8763A' : 'rgba(255,255,255,0.88)',
                color: pageIdx >= pages.length - 1 ? '#FFF8E7' : '#3D1F0A',
                fontWeight: 700,
                fontSize: 15,
                cursor: 'pointer',
                boxShadow: pageIdx >= pages.length - 1 ? '0 3px 12px rgba(232,118,58,0.4)' : '0 3px 12px rgba(0,0,0,0.15)',
              }}
            >
              {pageIdx >= pages.length - 1 ? 'Finish' : (
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" style={{ display: 'block', margin: '0 auto' }}>
                  <path d="M8 4L14 11L8 18" stroke="#3D1F0A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </div>

          <div style={{
            width: '100%', maxWidth: 560, backgroundColor: 'rgba(255,255,255,0.95)',
            borderRadius: 24, padding: '20px 24px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          }}>
            <AnimatePresence mode="wait">
              <motion.p
                key={pageIdx}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.22 }}
                style={{
                  margin: 0, color: '#1B2E4A', lineHeight: 1.8, fontSize: 24,
                  fontFamily: "'Fredoka', sans-serif", fontWeight: 500,
                }}
              >
                {pages[pageIdx]?.text ?? ''}
              </motion.p>
            </AnimatePresence>
          </div>

          <motion.button
            onClick={toggleSpeak}
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
        </div>
      )}
    </div>
  )
}
