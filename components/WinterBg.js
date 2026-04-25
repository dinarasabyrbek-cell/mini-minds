'use client'

const FLAKES = [
  { left: '7%',  s: 5, delay: '0s',    dur: '8s'   },
  { left: '15%', s: 4, delay: '1.2s',  dur: '10s'  },
  { left: '24%', s: 6, delay: '2.5s',  dur: '7s'   },
  { left: '33%', s: 4, delay: '0.8s',  dur: '9s'   },
  { left: '42%', s: 5, delay: '3.2s',  dur: '11s'  },
  { left: '52%', s: 3, delay: '1.6s',  dur: '8.5s' },
  { left: '62%', s: 5, delay: '4.0s',  dur: '9.5s' },
  { left: '73%', s: 4, delay: '0.4s',  dur: '10.5s'},
  { left: '83%', s: 6, delay: '2.8s',  dur: '7.5s' },
  { left: '92%', s: 3, delay: '1.9s',  dur: '8s'   },
]

export function WinterBg() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #E8F4FD 0%, #F8FBFF 100%)' }}>
      <style>{`
        @keyframes snowfall {
          0%   { transform: translateY(-10px); opacity: 1; }
          100% { transform: translateY(110vh); opacity: 0.2; }
        }
        .wsnow { position: fixed; border-radius: 50%; background: #FFFFFF;
          animation: snowfall linear infinite; pointer-events: none; box-shadow: 0 0 4px rgba(180,210,240,0.6); }
      `}</style>

      {/* Blue-grey hills */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="280"  cy="690" rx="380" ry="115" fill="#C8DCF0" opacity="0.38" />
        <ellipse cx="860"  cy="700" rx="340" ry="98"  fill="#C8DCF0" opacity="0.32" />
        <ellipse cx="1280" cy="695" rx="270" ry="88"  fill="#C8DCF0" opacity="0.38" />
      </svg>

      {/* Bare tree silhouettes */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        {/* Left tall tree */}
        <path d="M75,630 L75,295" stroke="#3A3A4A" strokeWidth="7" strokeLinecap="round" />
        <path d="M75,505 L35,415"  stroke="#3A3A4A" strokeWidth="4"   strokeLinecap="round" />
        <path d="M75,455 L118,375" stroke="#3A3A4A" strokeWidth="4"   strokeLinecap="round" />
        <path d="M75,385 L45,308"  stroke="#3A3A4A" strokeWidth="3"   strokeLinecap="round" />
        <path d="M75,352 L112,278" stroke="#3A3A4A" strokeWidth="3"   strokeLinecap="round" />
        <path d="M35,415 L14,372"  stroke="#3A3A4A" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M118,375 L142,335" stroke="#3A3A4A" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M45,308 L28,272"  stroke="#3A3A4A" strokeWidth="2"   strokeLinecap="round" />

        {/* Left medium tree */}
        <path d="M205,630 L205,428" stroke="#3A3A4A" strokeWidth="5" strokeLinecap="round" />
        <path d="M205,535 L170,470" stroke="#3A3A4A" strokeWidth="3" strokeLinecap="round" />
        <path d="M205,495 L240,438" stroke="#3A3A4A" strokeWidth="3" strokeLinecap="round" />
        <path d="M205,462 L178,415" stroke="#3A3A4A" strokeWidth="2" strokeLinecap="round" />
        <path d="M170,470 L148,432" stroke="#3A3A4A" strokeWidth="2" strokeLinecap="round" />

        {/* Background left tree */}
        <path d="M370,630 L370,488" stroke="#3A3A4A" strokeWidth="4" strokeLinecap="round" opacity="0.45" />
        <path d="M370,565 L340,512" stroke="#3A3A4A" strokeWidth="2.5" strokeLinecap="round" opacity="0.45" />
        <path d="M370,532 L402,480" stroke="#3A3A4A" strokeWidth="2.5" strokeLinecap="round" opacity="0.45" />

        {/* Right tall tree */}
        <path d="M1365,630 L1365,305" stroke="#3A3A4A" strokeWidth="7" strokeLinecap="round" />
        <path d="M1365,510 L1325,420" stroke="#3A3A4A" strokeWidth="4"   strokeLinecap="round" />
        <path d="M1365,462 L1405,382" stroke="#3A3A4A" strokeWidth="4"   strokeLinecap="round" />
        <path d="M1365,388 L1335,312" stroke="#3A3A4A" strokeWidth="3"   strokeLinecap="round" />
        <path d="M1365,358 L1395,285" stroke="#3A3A4A" strokeWidth="3"   strokeLinecap="round" />
        <path d="M1325,420 L1300,378" stroke="#3A3A4A" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M1405,382 L1428,342" stroke="#3A3A4A" strokeWidth="2.5" strokeLinecap="round" />

        {/* Right medium tree */}
        <path d="M1242,630 L1242,435" stroke="#3A3A4A" strokeWidth="5" strokeLinecap="round" />
        <path d="M1242,545 L1208,482" stroke="#3A3A4A" strokeWidth="3" strokeLinecap="round" />
        <path d="M1242,505 L1278,450" stroke="#3A3A4A" strokeWidth="3" strokeLinecap="round" />
        <path d="M1242,472 L1215,425" stroke="#3A3A4A" strokeWidth="2" strokeLinecap="round" />

        {/* Background right tree */}
        <path d="M1068,630 L1068,495" stroke="#3A3A4A" strokeWidth="4" strokeLinecap="round" opacity="0.45" />
        <path d="M1068,572 L1038,518" stroke="#3A3A4A" strokeWidth="2.5" strokeLinecap="round" opacity="0.45" />
        <path d="M1068,540 L1100,490" stroke="#3A3A4A" strokeWidth="2.5" strokeLinecap="round" opacity="0.45" />
      </svg>

      {/* Snow ground */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%' }}>
        <svg width="100%" height="100%" viewBox="0 0 1440 270" preserveAspectRatio="none">
          <path d="M0,38 Q180,18 360,32 Q540,48 720,26 Q900,12 1080,30 Q1260,46 1440,24 L1440,270 L0,270 Z"
            fill="#F0F4F8" />
          <path d="M0,38 Q180,18 360,32 Q540,48 720,26 Q900,12 1080,30 Q1260,46 1440,24"
            fill="none" stroke="#E0EAF4" strokeWidth="2" />
        </svg>
      </div>

      {/* Snowflakes */}
      {FLAKES.map((f, i) => (
        <div key={i} className="wsnow"
          style={{ left: f.left, top: -10, width: f.s, height: f.s,
            animationDuration: f.dur, animationDelay: f.delay }} />
      ))}
    </div>
  )
}
