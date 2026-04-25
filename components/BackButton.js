'use client'

import { useRouter } from 'next/navigation'

export default function BackButton({ href, color = '#9C7C5A' }) {
  const router = useRouter()

  function handleBack() {
    if (href) {
      router.push(href)
    } else {
      router.back()
    }
  }

  return (
    <button
      onClick={handleBack}
      className="flex items-center gap-2 px-4 py-2 rounded-full text-base font-semibold transition-all hover:scale-105 active:scale-95"
      style={{
        backgroundColor: 'rgba(255,255,255,0.35)',
        color: color,
        backdropFilter: 'blur(4px)',
        minWidth: 44,
        minHeight: 44,
      }}
    >
      <span className="text-xl">←</span>
      <span>Back</span>
    </button>
  )
}
