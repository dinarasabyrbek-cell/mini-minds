'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import BackButton from '@/components/BackButton'

/* ─── Palette ─── */
const PALETTE = [
  '#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6',
  '#8B5CF6', '#EC4899', '#92400E', '#111827', '#FFFFFF',
  '#7DD3FC', '#FBCFE8', '#86EFAC', '#FED7AA', '#9CA3AF',
]

/* ─── SVG stroke defaults ─── */
const SK = { stroke: '#374151', strokeWidth: 3, strokeLinejoin: 'round', strokeLinecap: 'round' }

/* ─── Region helper: returns props for a colorable SVG element ─── */
function mkR(colors, onFill) {
  return (key, extra = {}) => ({
    className: 'cr',
    fill: colors[key] ?? '#FFFFFF',
    onClick: () => onFill(key),
    ...SK,
    ...extra,
  })
}

/* ─── Star polygon helper ─── */
function star(cx, cy, ro, ri, n = 5) {
  const pts = []
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 === 0 ? ro : ri
    const a = (i * Math.PI / n) - Math.PI / 2
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`)
  }
  return pts.join(' ')
}

/* ══════════════════════════════════════════
   SVG SCENE 1 — NATURE
══════════════════════════════════════════ */
function NatureSVG({ colors, onFill }) {
  const r = mkR(colors, onFill)
  return (
    <svg viewBox="0 0 400 400" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      {/* Sky */}
      <rect {...r('sky', { strokeWidth: 0 })} x="0" y="0" width="400" height="255" />
      {/* Sun */}
      <circle {...r('sun')} cx="335" cy="65" r="42" />
      {/* Cloud 1 */}
      <ellipse {...r('cl1')} cx="72" cy="92" rx="52" ry="27" />
      <ellipse {...r('cl1')} cx="112" cy="80" rx="40" ry="22" />
      {/* Cloud 2 */}
      <ellipse {...r('cl2')} cx="238" cy="60" rx="55" ry="27" />
      <ellipse {...r('cl2')} cx="282" cy="50" rx="40" ry="22" />
      {/* Ground */}
      <rect {...r('ground', { strokeWidth: 0 })} x="0" y="255" width="400" height="145" />
      {/* Hill */}
      <ellipse {...r('hill')} cx="200" cy="262" rx="235" ry="64" />
      {/* Tree trunk */}
      <rect {...r('trunk')} x="163" y="196" width="34" height="68" rx="4" />
      {/* Tree canopy */}
      <polygon {...r('leaves')} points="96,198 180,62 264,198" />
      {/* Flower 1 */}
      <circle {...r('f1p')} cx="62" cy="253" r="20" />
      <circle {...r('f1c')} cx="62" cy="253" r="9" />
      <line x1="62" y1="271" x2="62" y2="292" {...SK} />
      {/* Flower 2 */}
      <circle {...r('f2p')} cx="108" cy="259" r="17" />
      <circle {...r('f2c')} cx="108" cy="259" r="7" />
      <line x1="108" y1="274" x2="108" y2="292" {...SK} />
      {/* Flower 3 */}
      <circle {...r('f3p')} cx="312" cy="252" r="20" />
      <circle {...r('f3c')} cx="312" cy="252" r="9" />
      <line x1="312" y1="270" x2="312" y2="292" {...SK} />
    </svg>
  )
}

/* ══════════════════════════════════════════
   SVG SCENE 2 — ANIMALS
══════════════════════════════════════════ */
function AnimalsSVG({ colors, onFill }) {
  const r = mkR(colors, onFill)
  return (
    <svg viewBox="0 0 400 400" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      {/* Sky */}
      <rect {...r('sky', { strokeWidth: 0 })} x="0" y="0" width="400" height="242" />
      {/* Ground */}
      <rect {...r('ground', { strokeWidth: 0 })} x="0" y="242" width="400" height="158" />
      <ellipse {...r('ghill')} cx="200" cy="248" rx="250" ry="52" />
      {/* ── Elephant (left) ── */}
      <ellipse {...r('el-ear')} cx="192" cy="218" rx="28" ry="38" />
      <ellipse {...r('el-body')} cx="138" cy="276" rx="90" ry="62" />
      <circle {...r('el-head')} cx="224" cy="232" r="48" />
      <circle fill="#374151" cx="237" cy="220" r="5" />
      <path {...r('el-trunk', { strokeWidth: 8, fill: colors['el-trunk'] ?? '#FFFFFF' })}
        d="M 248,274 Q 272,292 264,320 Q 256,342 240,342 Q 226,340 226,330" />
      <rect {...r('el-legs')} x="80" y="320" width="30" height="52" rx="10" />
      <rect {...r('el-legs')} x="118" y="320" width="30" height="52" rx="10" />
      <rect {...r('el-legs')} x="156" y="320" width="30" height="52" rx="10" />
      {/* ── Bird (top-right) ── */}
      <ellipse {...r('bird')} cx="300" cy="82" rx="30" ry="18" />
      <path {...r('bird')} d="M 286,76 Q 268,56 252,70 Q 268,78 286,88 Z" />
      <polygon fill="#F59E0B" points="328,80 344,86 328,92" stroke="#374151" strokeWidth="2" />
      <circle fill="#374151" cx="320" cy="80" r="4" />
      {/* ── Butterfly (right) ── */}
      <ellipse {...r('bfly-top')} cx="352" cy="175" rx="26" ry="38" transform="rotate(-22,352,175)" />
      <ellipse {...r('bfly-top')} cx="312" cy="175" rx="26" ry="38" transform="rotate(22,312,175)" />
      <ellipse {...r('bfly-bot')} cx="348" cy="210" rx="20" ry="28" transform="rotate(18,348,210)" />
      <ellipse {...r('bfly-bot')} cx="316" cy="210" rx="20" ry="28" transform="rotate(-18,316,210)" />
      <ellipse {...r('bfly-body')} cx="330" cy="192" rx="7" ry="22" />
      <line x1="326" y1="172" x2="316" y2="154" {...SK} strokeWidth="2" />
      <circle fill="#374151" cx="316" cy="154" r="3" />
      <line x1="334" y1="172" x2="344" y2="154" {...SK} strokeWidth="2" />
      <circle fill="#374151" cx="344" cy="154" r="3" />
    </svg>
  )
}

/* ══════════════════════════════════════════
   SVG SCENE 3 — HOUSE
══════════════════════════════════════════ */
function HouseSVG({ colors, onFill }) {
  const r = mkR(colors, onFill)
  return (
    <svg viewBox="0 0 400 400" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <rect {...r('sky', { strokeWidth: 0 })} x="0" y="0" width="400" height="218" />
      <rect {...r('ground', { strokeWidth: 0 })} x="0" y="218" width="400" height="182" />
      {/* House */}
      <rect {...r('walls')} x="75" y="148" width="250" height="138" />
      <polygon {...r('roof')} points="55,151 200,44 345,151" />
      <rect {...r('chimney')} x="254" y="62" width="40" height="92" rx="3" />
      {/* Door */}
      <rect {...r('door')} x="167" y="218" width="66" height="80" rx="6" />
      <circle fill="#854D0E" cx="225" cy="264" r="5" />
      {/* Windows */}
      <rect {...r('win1')} x="92" y="170" width="65" height="50" rx="4" />
      <line x1="124" y1="170" x2="124" y2="220" {...SK} strokeWidth="2" />
      <line x1="92" y1="195" x2="157" y2="195" {...SK} strokeWidth="2" />
      <rect {...r('win2')} x="243" y="170" width="65" height="50" rx="4" />
      <line x1="275" y1="170" x2="275" y2="220" {...SK} strokeWidth="2" />
      <line x1="243" y1="195" x2="308" y2="195" {...SK} strokeWidth="2" />
      {/* Path */}
      <polygon {...r('path')} points="155,298 245,298 265,360 135,360" />
      {/* Fence */}
      {[18, 36, 54].map(x => (
        <rect key={x} {...r('fence')} x={x} y="248" width="12" height="48" rx="2" strokeWidth="2" />
      ))}
      <rect {...r('fence', { strokeWidth: 2 })} x="14" y="248" width="56" height="10" rx="3" />
      {[330, 348, 366].map(x => (
        <rect key={x} {...r('fence')} x={x} y="248" width="12" height="48" rx="2" strokeWidth="2" />
      ))}
      <rect {...r('fence', { strokeWidth: 2 })} x="326" y="248" width="56" height="10" rx="3" />
      {/* Garden flowers */}
      <circle {...r('gf1p')} cx="30" cy="222" r="14" />
      <circle {...r('gf1c')} cx="30" cy="222" r="6" />
      <line x1="30" y1="234" x2="30" y2="250" {...SK} strokeWidth="2" />
      <circle {...r('gf2p')} cx="58" cy="226" r="12" />
      <circle {...r('gf2c')} cx="58" cy="226" r="5" />
      <line x1="58" y1="236" x2="58" y2="250" {...SK} strokeWidth="2" />
      <circle {...r('gf3p')} cx="355" cy="222" r="14" />
      <circle {...r('gf3c')} cx="355" cy="222" r="6" />
      <line x1="355" y1="234" x2="355" y2="250" {...SK} strokeWidth="2" />
    </svg>
  )
}

/* ══════════════════════════════════════════
   SVG SCENE 4 — OCEAN
══════════════════════════════════════════ */
function OceanSVG({ colors, onFill }) {
  const r = mkR(colors, onFill)
  return (
    <svg viewBox="0 0 400 400" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <rect {...r('sky', { strokeWidth: 0 })} x="0" y="0" width="400" height="198" />
      <circle {...r('sun')} cx="330" cy="65" r="42" />
      <rect {...r('water', { strokeWidth: 0 })} x="0" y="198" width="400" height="202" />
      {/* Waves */}
      <path {...r('wave1')} d="M0,198 Q50,182 100,198 Q150,214 200,198 Q250,182 300,198 Q350,214 400,198 L400,222 L0,222 Z" strokeWidth="2" />
      <path {...r('wave2')} d="M0,224 Q50,210 100,224 Q150,238 200,224 Q250,210 300,224 Q350,238 400,224 L400,244 L0,244 Z" strokeWidth="2" />
      {/* Whale */}
      <ellipse {...r('whale')} cx="162" cy="318" rx="112" ry="56" />
      <path {...r('w-tail')} d="M 272,310 L 318,276 L 308,310 L 318,344 L 272,326 Z" />
      <path {...r('w-fin')} d="M 172,264 Q 198,238 218,256 Q 200,268 172,270 Z" />
      <circle fill="#374151" cx="132" cy="308" r="7" />
      <path d="M 118,325 Q 132,336 148,325" fill="none" stroke="#374151" strokeWidth="3" />
      {/* Fish 1 */}
      <ellipse {...r('fish1')} cx="318" cy="252" rx="28" ry="16" />
      <polygon {...r('fish1')} points="344,242 366,232 366,272 344,262" />
      <circle fill="#374151" cx="306" cy="248" r="4" />
      {/* Fish 2 */}
      <ellipse {...r('fish2')} cx="348" cy="315" rx="22" ry="13" />
      <polygon {...r('fish2')} points="368,306 386,298 386,332 368,324" />
      <circle fill="#374151" cx="338" cy="312" r="3" />
      {/* Starfish */}
      <polygon {...r('starfish')} points={star(72, 368, 28, 12)} />
      {/* Bubbles */}
      <circle {...r('bubbles')} cx="105" cy="278" r="11" />
      <circle {...r('bubbles')} cx="88" cy="256" r="8" />
      <circle {...r('bubbles')} cx="74" cy="238" r="6" />
    </svg>
  )
}

/* ══════════════════════════════════════════
   SVG SCENE 5 — SPACE
══════════════════════════════════════════ */
function SpaceSVG({ colors, onFill }) {
  const r = mkR(colors, onFill)
  const STAR_POS = [[50,48],[358,82],[28,305],[386,338],[205,28],[118,202],[308,182],[170,340],[260,90]]
  return (
    <svg viewBox="0 0 400 400" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <rect {...r('bg', { strokeWidth: 0 })} x="0" y="0" width="400" height="400" />
      {/* Stars */}
      {STAR_POS.map(([cx, cy], i) => (
        <polygon key={i} {...r('stars', { strokeWidth: 1 })} points={star(cx, cy, 10, 4)} />
      ))}
      {/* Moon */}
      <circle {...r('moon')} cx="336" cy="75" r="48" />
      <circle {...r('crater1')} cx="322" cy="60" r="12" />
      <circle {...r('crater1')} cx="350" cy="90" r="9" />
      {/* Planet 1 with ring */}
      <circle {...r('planet1')} cx="72" cy="108" r="42" />
      <ellipse {...r('ring1')} cx="72" cy="108" rx="70" ry="18" />
      {/* Planet 2 */}
      <circle {...r('planet2')} cx="52" cy="332" r="38" />
      {/* Planet 3 */}
      <circle {...r('planet3')} cx="336" cy="352" r="50" />
      {/* Rocket */}
      <polygon {...r('r-nose')} points="176,155 200,78 224,155" />
      <rect {...r('r-body')} x="176" y="152" width="48" height="132" rx="5" />
      <circle {...r('r-win')} cx="200" cy="205" r="18" />
      <polygon {...r('r-fins')} points="176,228 150,284 176,284" />
      <polygon {...r('r-fins')} points="224,228 250,284 224,284" />
      <ellipse {...r('r-flame')} cx="200" cy="291" rx="20" ry="28" />
      {/* Asteroid */}
      <ellipse {...r('asteroid')} cx="302" cy="155" rx="36" ry="22" transform="rotate(-18,302,155)" />
      <circle fill="#374151" cx="292" cy="150" r="5" />
      <circle fill="#374151" cx="314" cy="162" r="4" />
    </svg>
  )
}

/* ─── Room background ─── */
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
        <ellipse cx="1050" cy="700" rx="280" ry="110" fill="#E05C2A" opacity="0.65" />
      </svg>
    </div>
  )
}

/* ─── Scene definitions ─── */
const SCENES = [
  { id: 'nature',  label: '🌿 Nature',  color: '#22C55E', SVGComp: NatureSVG },
  { id: 'animals', label: '🐘 Animals', color: '#F97316', SVGComp: AnimalsSVG },
  { id: 'house',   label: '🏠 House',   color: '#3B82F6', SVGComp: HouseSVG },
  { id: 'ocean',   label: '🌊 Ocean',   color: '#06B6D4', SVGComp: OceanSVG },
  { id: 'space',   label: '🚀 Space',   color: '#8B5CF6', SVGComp: SpaceSVG },
]

/* ─── Scene picker ─── */
function ScenePicker({ onSelect, onBack }) {
  return (
    <div className="relative z-10 flex flex-col items-center px-4 py-6 w-full max-w-2xl mx-auto">
      <div className="self-start mb-4">
        <BackButton href="/zone/cat" color="#854D0E" />
      </div>
      <h1 className="text-4xl font-bold mb-8 text-center" style={{ color: '#2D2014' }}>
        🎨 Pick a Scene
      </h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-5 w-full">
        {SCENES.map((scene, i) => (
          <motion.button
            key={scene.id}
            onClick={() => onSelect(scene)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, type: 'spring', stiffness: 280, damping: 22 }}
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.97 }}
            className="flex flex-col items-center rounded-3xl overflow-hidden cursor-pointer"
            style={{
              backgroundColor: 'rgba(255,255,255,0.9)',
              border: `3px solid ${scene.color}`,
              boxShadow: `0 6px 20px ${scene.color}33`,
            }}
          >
            {/* Mini SVG preview */}
            <div style={{ width: '100%', aspectRatio: '1', overflow: 'hidden', background: '#FAFAFA' }}>
              <scene.SVGComp colors={{}} onFill={() => {}} />
            </div>
            <div className="py-3 px-2 text-center w-full"
              style={{ borderTop: `2px solid ${scene.color}44` }}>
              <span className="text-lg font-bold" style={{ color: '#2D2014', fontFamily: 'var(--font-fredoka), sans-serif' }}>
                {scene.label}
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

/* ─── Color palette ─── */
function Palette({ selected, onSelect }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        padding: '10px 16px',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        flexShrink: 0,
      }}
    >
      {PALETTE.map(hex => (
        <button
          key={hex}
          onClick={() => onSelect(hex)}
          style={{
            width: 46,
            height: 46,
            minWidth: 46,
            borderRadius: '50%',
            backgroundColor: hex,
            border: selected === hex ? '3px solid #374151' : '3px solid transparent',
            outline: selected === hex ? '2px solid #FFFFFF' : 'none',
            outlineOffset: 1,
            boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
            cursor: 'pointer',
            transition: 'transform 0.1s',
            transform: selected === hex ? 'scale(1.2)' : 'scale(1)',
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  )
}

/* ─── Coloring screen ─── */
function ColoringScreen({ scene, colors, onFill, selectedColor, onColorSelect, onClear, onBack }) {
  const { SVGComp, label, color } = scene
  return (
    <div className="fixed inset-0 flex flex-col" style={{ fontFamily: 'var(--font-fredoka), sans-serif', backgroundColor: '#FDE8C8' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '2px solid rgba(133,77,14,0.15)' }}>
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-base font-semibold transition-all hover:scale-105 active:scale-95"
          style={{ backgroundColor: 'rgba(255,255,255,0.7)', color: '#854D0E', minHeight: 44 }}
        >
          ← Scenes
        </button>
        <span className="text-xl font-bold" style={{ color: '#2D2014' }}>{label}</span>
        <button
          onClick={onClear}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-base font-semibold transition-all hover:scale-105 active:scale-95"
          style={{ backgroundColor: 'rgba(255,255,255,0.7)', color: '#854D0E', minHeight: 44 }}
        >
          Clear 🗑️
        </button>
      </div>

      {/* SVG canvas */}
      <div className="flex-1 flex items-center justify-center p-3 overflow-hidden">
        <div
          style={{
            width: 'min(500px, calc(100vw - 24px), calc(100vh - 180px))',
            aspectRatio: '1',
            backgroundColor: '#FFFFFF',
            borderRadius: 20,
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            border: `3px solid ${color}`,
          }}
        >
          {/* Hover style for regions */}
          <style>{`.cr { transition: opacity 0.1s; } .cr:hover { opacity: 0.82; cursor: pointer; }`}</style>
          <SVGComp colors={colors} onFill={onFill} />
        </div>
      </div>

      {/* Palette bar */}
      <div
        className="flex-shrink-0"
        style={{
          backgroundColor: 'rgba(255,255,255,0.9)',
          borderTop: '2px solid rgba(133,77,14,0.15)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <Palette selected={selectedColor} onSelect={onColorSelect} />
      </div>
    </div>
  )
}

/* ─── Main page ─── */
export default function ColoringPage() {
  const [scene, setScene]               = useState(null)
  const [colors, setColors]             = useState({})
  const [selectedColor, setSelectedColor] = useState('#EF4444')

  function handleFill(key) {
    setColors(prev => ({ ...prev, [key]: selectedColor }))
  }

  function handleSelectScene(s) {
    setScene(s)
    setColors({})
  }

  return (
    <div className="min-h-screen relative" style={{ fontFamily: 'var(--font-fredoka), sans-serif' }}>
      <RoomBg />
      <AnimatePresence mode="wait">
        {!scene ? (
          <motion.div key="picker" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ScenePicker onSelect={handleSelectScene} />
          </motion.div>
        ) : (
          <motion.div key="coloring" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ColoringScreen
              scene={scene}
              colors={colors}
              onFill={handleFill}
              selectedColor={selectedColor}
              onColorSelect={setSelectedColor}
              onClear={() => setColors({})}
              onBack={() => setScene(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
