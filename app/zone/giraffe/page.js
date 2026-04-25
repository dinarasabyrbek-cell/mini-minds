'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { AfricanDaytimeBg } from '@/components/AfricanDaytimeBg'
import { videos } from '@/lib/videoData'

const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

const _gc = new Map()
function useGiraffeAnim() {
  const [data, setData] = useState(() => _gc.get('g') ?? null)
  useEffect(() => {
    if (_gc.has('g')) return
    fetch('/animations/giraffe-clean.json')
      .then(r => r.json()).then(d => { _gc.set('g', d); setData(d) }).catch(() => {})
  }, [])
  return data
}

const F = "'Fredoka', sans-serif"

/* ── Play icon SVG ── */
function PlayIcon() {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: '50%',
        backgroundColor: 'rgba(0,0,0,0.42)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M6 4L16 10L6 16V4Z" fill="white" />
        </svg>
      </div>
    </div>
  )
}

/* ── Video card ── */
function VideoCard({ video, compact = false }) {
  const thumbH = compact ? 100 : 160
  const titleSize = compact ? 13 : 15

  return (
    <Link href={`/zone/giraffe/watch/${video.id}`} style={{ textDecoration: 'none', flexShrink: compact ? 0 : undefined }}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        style={{
          width: compact ? 160 : '100%',
          backgroundColor: '#FFFFFF',
          borderRadius: 16, overflow: 'hidden',
          boxShadow: '0 4px 18px rgba(0,0,0,0.10)',
          cursor: 'pointer',
        }}
      >
        {/* Thumbnail */}
        <div style={{ position: 'relative', height: thumbH, backgroundColor: '#E0E0E0' }}>
          <img
            src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
            alt={video.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          <PlayIcon />
        </div>

        {/* Info */}
        <div style={{ padding: compact ? '8px 10px' : '12px 14px' }}>
          <p style={{
            margin: '0 0 6px', fontSize: titleSize, fontWeight: 600, color: '#1B2E4A',
            fontFamily: F, lineHeight: 1.35,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {video.title}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{
              padding: '2px 8px', borderRadius: 999, fontSize: 12, fontWeight: 600,
              backgroundColor: '#E8F5E2', color: '#2D6A2D', fontFamily: F,
            }}>
              {video.category}
            </span>
            {!compact && (
              <span style={{ fontSize: 13, color: '#9CA3AF', fontFamily: F }}>Watch</span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  )
}

/* ── Hub page ── */
export default function GiraffeHub() {
  const router = useRouter()
  const [name, setName] = useState('Friend')
  const giraffeAnim = useGiraffeAnim()

  useEffect(() => {
    setName(localStorage.getItem('miniMindsName') || 'Friend')
  }, [])

  return (
    <div style={{ minHeight: '100dvh', fontFamily: F }}>
      <AfricanDaytimeBg />

      {/* Back button */}
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
        <button onClick={() => router.push('/home')} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
          borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.85)', color: '#1B2E4A',
          fontWeight: 600, fontSize: 15, border: 'none', cursor: 'pointer',
          backdropFilter: 'blur(6px)', minHeight: 44, boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="#1B2E4A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 24px 48px' }}>

        {/* Giraffe Lottie */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <div style={{ width: 150, height: 150 }}>
            {giraffeAnim && <Lottie animationData={giraffeAnim} loop style={{ width: 150, height: 150 }} />}
          </div>
        </div>

        {/* Heading */}
        <h1 style={{
          textAlign: 'center', color: '#1B2E4A', fontWeight: 700,
          fontSize: 'clamp(20px, 3vw, 28px)', marginBottom: 32,
        }}>
          What do you want to watch, {name}?
        </h1>

        {/* Video grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 20,
        }}>
          {videos.map(v => <VideoCard key={v.id} video={v} />)}
        </div>
      </div>
    </div>
  )
}
