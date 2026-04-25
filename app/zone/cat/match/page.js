'use client'

import BackButton from '@/components/BackButton'
import MatchGame from '@/components/MatchGame'

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

export default function CatMatch() {
  return (
    <div className="min-h-screen relative" style={{ fontFamily: 'var(--font-fredoka), sans-serif' }}>
      <RoomBg />
      <div className="relative z-10 px-4 py-6 max-w-3xl mx-auto">
        <div className="mb-4">
          <BackButton href="/zone/cat" color="#854D0E" />
        </div>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold" style={{ color: '#2D2014' }}>Letter Match 🐱</h1>
          <p className="text-lg mt-1" style={{ color: '#854D0E' }}>Flip the cards and match each letter with its word!</p>
        </div>
        <MatchGame />
      </div>
    </div>
  )
}
