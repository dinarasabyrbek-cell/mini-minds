'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { saveGameSession } from '@/lib/progress'

const PAIRS = [
  { id: 'A', letter: 'A', word: 'Apple', emoji: '🍎' },
  { id: 'B', letter: 'B', word: 'Ball',  emoji: '⚽' },
  { id: 'C', letter: 'C', word: 'Cat',   emoji: '🐱' },
  { id: 'D', letter: 'D', word: 'Dog',   emoji: '🐶' },
]

function buildDeck() {
  const cards = []
  PAIRS.forEach(pair => {
    cards.push({ uid: `${pair.id}-letter`, pairId: pair.id, type: 'letter', letter: pair.letter, word: pair.word, emoji: pair.emoji })
    cards.push({ uid: `${pair.id}-word`,   pairId: pair.id, type: 'word',   letter: pair.letter, word: pair.word, emoji: pair.emoji })
  })
  // shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]]
  }
  return cards
}

function PawPrint() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="24" cy="30" rx="12" ry="9" fill="rgba(255,255,255,0.25)" />
      <circle cx="13" cy="19" r="5" fill="rgba(255,255,255,0.25)" />
      <circle cx="24" cy="15" r="5.5" fill="rgba(255,255,255,0.25)" />
      <circle cx="35" cy="19" r="5" fill="rgba(255,255,255,0.25)" />
    </svg>
  )
}

function FlipCard({ card, isFlipped, isMatched, onClick, disabled }) {
  const showFace = isFlipped || isMatched

  return (
    <div
      onClick={!disabled && !showFace ? onClick : undefined}
      style={{ cursor: disabled || showFace ? 'default' : 'pointer', minHeight: 100, minWidth: 44, position: 'relative' }}
    >
      <AnimatePresence initial={false} mode="wait">
        {!showFace ? (
          <motion.div
            key="back"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{
              position: 'absolute', inset: 0,
              borderRadius: 16,
              backgroundColor: '#E05C2A',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            <PawPrint />
          </motion.div>
        ) : (
          <motion.div
            key="front"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: isMatched ? 1.04 : 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{
              position: 'absolute', inset: 0,
              borderRadius: 16,
              backgroundColor: '#FFFFFF',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 4,
              border: isMatched ? '3px solid #7DC44E' : '3px solid #1B2E4A',
              boxShadow: isMatched
                ? '0 4px 16px rgba(125,196,78,0.5), 0 0 0 2px rgba(125,196,78,0.3)'
                : '0 4px 12px rgba(0,0,0,0.12)',
            }}
          >
            {card.type === 'letter' ? (
              <span style={{ fontSize: 44, fontWeight: 700, color: '#1B2E4A', fontFamily: 'var(--font-fredoka), sans-serif', lineHeight: 1 }}>
                {card.letter}
              </span>
            ) : (
              <>
                <span style={{ fontSize: 28 }}>{card.emoji}</span>
                <span style={{ fontSize: 16, fontWeight: 600, color: '#2D2014', fontFamily: 'var(--font-fredoka), sans-serif' }}>
                  {card.word}
                </span>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function MatchGame() {
  const [deck, setDeck]               = useState(() => buildDeck())
  const [flipped, setFlipped]         = useState([])
  const [matched, setMatched]         = useState(new Set())
  const [attempts, setAttempts]       = useState(0)
  const [locked, setLocked]           = useState(false)
  const [startTime]                   = useState(() => Date.now())
  const [elapsed, setElapsed]         = useState(0)
  const [gameOver, setGameOver]       = useState(false)
  const [savedScore, setSavedScore]   = useState(null)
  const timerRef                      = useRef(null)

  useEffect(() => {
    timerRef.current = setInterval(() => {
      if (!gameOver) setElapsed(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [gameOver, startTime])

  const handleFlip = useCallback((card) => {
    if (locked || flipped.length >= 2 || flipped.includes(card.uid) || matched.has(card.pairId)) return

    const newFlipped = [...flipped, card.uid]
    setFlipped(newFlipped)

    if (newFlipped.length === 2) {
      setAttempts(a => a + 1)
      setLocked(true)
      const [uid1, uid2] = newFlipped
      const card1 = deck.find(c => c.uid === uid1)
      const card2 = deck.find(c => c.uid === uid2)

      if (card1.pairId === card2.pairId && card1.type !== card2.type) {
        // Match!
        const newMatched = new Set([...matched, card1.pairId])
        setTimeout(() => {
          setMatched(newMatched)
          setFlipped([])
          setLocked(false)
          if (newMatched.size === PAIRS.length) {
            const finalElapsed = Math.floor((Date.now() - startTime) / 1000)
            setElapsed(finalElapsed)
            setGameOver(true)
            clearInterval(timerRef.current)
            const stars = finalElapsed < 30 ? 3 : finalElapsed < 60 ? 2 : 1
            setSavedScore(stars)
            saveGameSession('letter-match', stars, finalElapsed)
          }
        }, 600)
      } else {
        // No match — flip back
        setTimeout(() => {
          setFlipped([])
          setLocked(false)
        }, 1000)
      }
    }
  }, [locked, flipped, matched, deck, startTime])

  function restart() {
    setDeck(buildDeck())
    setFlipped([])
    setMatched(new Set())
    setAttempts(0)
    setLocked(false)
    setElapsed(0)
    setGameOver(false)
    setSavedScore(null)
  }

  const stars = elapsed < 30 ? 3 : elapsed < 60 ? 2 : 1

  return (
    <div className="flex flex-col items-center gap-6" style={{ fontFamily: 'var(--font-fredoka), sans-serif' }}>
      {/* Stats bar */}
      <div className="flex gap-6 text-lg font-semibold" style={{ color: '#2D2014' }}>
        <span>⏱ {elapsed}s</span>
        <span>🎯 {attempts} tries</span>
        <span>✅ {matched.size}/{PAIRS.length} matched</span>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-4 gap-4 w-full max-w-lg" style={{ gridTemplateRows: 'auto auto' }}>
        {deck.map(card => (
          <div key={card.uid} style={{ aspectRatio: '3/4' }}>
            <FlipCard
              card={card}
              isFlipped={flipped.includes(card.uid)}
              isMatched={matched.has(card.pairId)}
              onClick={() => handleFlip(card)}
              disabled={locked}
            />
          </div>
        ))}
      </div>

      {/* Win screen */}
      <AnimatePresence>
        {gameOver && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          >
            <motion.div
              initial={{ y: 40 }}
              animate={{ y: 0 }}
              className="rounded-3xl p-8 flex flex-col items-center gap-4 w-full max-w-sm text-center"
              style={{ backgroundColor: '#FFFFFF', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
            >
              <div className="text-6xl">🎉</div>
              <h2 className="text-3xl font-bold" style={{ color: '#2D2014' }}>Amazing!</h2>
              <p className="text-lg" style={{ color: '#9C7C5A' }}>You matched all the pairs!</p>

              {/* Stars */}
              <div className="flex gap-2 text-5xl">
                {[1, 2, 3].map(n => (
                  <motion.span
                    key={n}
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: n <= savedScore ? 1 : 0.4, rotate: 0, opacity: n <= savedScore ? 1 : 0.25 }}
                    transition={{ delay: n * 0.2, type: 'spring', stiffness: 300 }}
                  >
                    ⭐
                  </motion.span>
                ))}
              </div>

              <p className="text-lg font-semibold" style={{ color: '#9C7C5A' }}>
                {elapsed}s · {attempts} tries
              </p>

              <button
                onClick={restart}
                className="px-8 py-3 rounded-full text-xl font-semibold text-white transition-all hover:scale-105 active:scale-95"
                style={{ backgroundColor: '#E05C2A', boxShadow: '0 4px 16px rgba(224,92,42,0.4)', minHeight: 52 }}
              >
                Play Again 🐾
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
