'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { AfricanDaytimeBg } from '@/components/AfricanDaytimeBg'
import { videos, getVideo } from '@/lib/videoData'

const F = "'Fredoka', sans-serif"

function PlayIcon() {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: '50%',
        backgroundColor: 'rgba(0,0,0,0.42)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M5 3.5L14.5 9L5 14.5V3.5Z" fill="white" />
        </svg>
      </div>
    </div>
  )
}

function SmallCard({ video }) {
  return (
    <Link href={`/zone/giraffe/watch/${video.id}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
      <motion.div
        whileHover={{ scale: 1.03 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        style={{
          width: 160, backgroundColor: 'rgba(255,255,255,0.95)',
          borderRadius: 14, overflow: 'hidden',
          boxShadow: '0 3px 14px rgba(0,0,0,0.12)', cursor: 'pointer',
        }}
      >
        <div style={{ position: 'relative', height: 100, backgroundColor: '#E0E0E0' }}>
          <img
            src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
            alt={video.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          <PlayIcon />
        </div>
        <div style={{ padding: '8px 10px' }}>
          <p style={{
            margin: 0, fontSize: 13, fontWeight: 600, color: '#1B2E4A', fontFamily: F,
            lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {video.title}
          </p>
        </div>
      </motion.div>
    </Link>
  )
}

export default function WatchPage() {
  const { videoId } = useParams()
  const router      = useRouter()
  const video       = getVideo(videoId)
  const others      = videos.filter(v => v.id !== videoId)

  if (!video) return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <AfricanDaytimeBg />
      <p style={{ color: '#1B2E4A', fontSize: 20, fontFamily: F }}>Video not found.</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100dvh', fontFamily: F, display: 'flex', flexDirection: 'column' }}>
      <AfricanDaytimeBg />

      {/* ── Top bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px', flexShrink: 0, position: 'relative', zIndex: 5,
      }}>
        {/* Back */}
        <button
          onClick={() => router.push('/zone/giraffe')}
          style={{
            width: 40, height: 40, borderRadius: '50%', border: 'none',
            backgroundColor: 'rgba(255,255,255,0.85)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.10)', flexShrink: 0,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M11 4L5 9L11 14" stroke="#1B2E4A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Title */}
        <p style={{
          color: '#1B2E4A', fontWeight: 700, fontSize: 18, margin: 0, textAlign: 'center',
          flex: 1, padding: '0 12px', overflow: 'hidden',
          textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          textShadow: '0 1px 4px rgba(255,255,255,0.6)',
        }}>
          {video.title}
        </p>

        {/* Spacer to balance back button */}
        <div style={{ width: 40, flexShrink: 0 }} />
      </div>

      {/* ── Scrollable content ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 32px' }}>

        {/* Video player */}
        <div style={{
          width: '100%', maxWidth: 800, margin: '0 auto 28px',
          borderRadius: 16, overflow: 'hidden',
          boxShadow: '0 10px 40px rgba(0,0,0,0.18)',
          backgroundColor: '#000',
        }}>
          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
            <iframe
              key={videoId}
              src={`https://www.youtube.com/embed/${video.youtubeId}?rel=0&modestbranding=1&autoplay=1`}
              style={{
                position: 'absolute', top: 0, left: 0,
                width: '100%', height: '100%', border: 'none', display: 'block',
              }}
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        </div>

        {/* More videos */}
        {others.length > 0 && (
          <div style={{ width: '100%', maxWidth: 800, margin: '0 auto' }}>
            <h2 style={{
              color: '#1B2E4A', fontWeight: 700, fontSize: 20, margin: '0 0 14px',
              textShadow: '0 1px 4px rgba(255,255,255,0.5)',
            }}>
              More Videos
            </h2>
            <div style={{
              display: 'flex', gap: 14, overflowX: 'auto',
              paddingBottom: 8, scrollbarWidth: 'none',
              WebkitOverflowScrolling: 'touch',
            }}>
              {others.map(v => <SmallCard key={v.id} video={v} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
