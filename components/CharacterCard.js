'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function CharacterCard({ character }) {
  const { id, href, label, subtitle, scene, textColor, subtitleColor, blendMode } = character

  return (
    <Link href={href} className="block">
      <motion.div
        whileHover={{ scale: 1.04, y: -4 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="relative rounded-3xl overflow-hidden cursor-pointer"
        style={{
          width: '100%',
          aspectRatio: '3/4',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          minHeight: 320,
        }}
      >
        {/* Scene background */}
        <div className="absolute inset-0">{scene}</div>

        {/* Character image */}
        <div className="absolute inset-0 flex items-center justify-center" style={{ paddingBottom: 60 }}>
          <div className="relative w-40 h-40 md:w-44 md:h-44">
            <Image
              src={`/characters/${id}.png`}
              alt={label}
              fill
              priority
              style={{ objectFit: 'contain', mixBlendMode: blendMode || 'multiply' }}
            />
          </div>
        </div>

        {/* Label strip at bottom */}
        <div className="absolute bottom-0 left-0 right-0 px-4 py-3" style={{ backgroundColor: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)' }}>
          <p className="text-xl font-bold leading-tight" style={{ color: textColor, fontFamily: 'var(--font-fredoka), sans-serif' }}>
            {label}
          </p>
          <p className="text-sm leading-tight mt-0.5" style={{ color: subtitleColor, fontFamily: 'var(--font-fredoka), sans-serif' }}>
            {subtitle}
          </p>
        </div>
      </motion.div>
    </Link>
  )
}
