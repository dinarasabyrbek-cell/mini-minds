'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Root() {
  const router = useRouter()

  useEffect(() => {
    const childId = localStorage.getItem('miniMindsChildId')
    if (childId) {
      router.replace('/home')
    } else {
      router.replace('/onboarding')
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FFFBF5' }}>
      <div className="text-2xl" style={{ color: '#9C7C5A', fontFamily: 'var(--font-fredoka), sans-serif' }}>Loading...</div>
    </div>
  )
}
