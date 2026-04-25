'use client'

export function AfricanDaytimeBg() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #6BB8E8 0%, #A8D8F0 100%)' }}>

      <style>{`
        @keyframes cloudDrift {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-110vw); }
        }
        .cloud-1 { animation: cloudDrift 38s linear infinite; }
        .cloud-2 { animation: cloudDrift 44s linear infinite 8s; }
        .cloud-3 { animation: cloudDrift 32s linear infinite 18s; }
      `}</style>

      {/* Drifting clouds */}
      <div className="cloud-1" style={{ position: 'fixed', top: '8%', left: '60%', opacity: 0.9 }}>
        <svg width="160" height="60" viewBox="0 0 160 60">
          <ellipse cx="80"  cy="38" rx="68" ry="26" fill="white" />
          <ellipse cx="45"  cy="32" rx="38" ry="24" fill="white" />
          <ellipse cx="118" cy="30" rx="36" ry="22" fill="white" />
        </svg>
      </div>
      <div className="cloud-2" style={{ position: 'fixed', top: '18%', left: '30%', opacity: 0.85 }}>
        <svg width="120" height="46" viewBox="0 0 120 46">
          <ellipse cx="60"  cy="30" rx="52" ry="20" fill="white" />
          <ellipse cx="30"  cy="25" rx="28" ry="18" fill="white" />
          <ellipse cx="90"  cy="24" rx="26" ry="16" fill="white" />
        </svg>
      </div>
      <div className="cloud-3" style={{ position: 'fixed', top: '6%', left: '10%', opacity: 0.9 }}>
        <svg width="190" height="70" viewBox="0 0 190 70">
          <ellipse cx="95"  cy="45" rx="80" ry="30" fill="white" />
          <ellipse cx="52"  cy="38" rx="44" ry="28" fill="white" />
          <ellipse cx="142" cy="36" rx="42" ry="26" fill="white" />
        </svg>
      </div>

      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">

        {/* Sun glow + sun */}
        <circle cx="1340" cy="80" r="72" fill="#F5D442" opacity="0.25" />
        <circle cx="1340" cy="80" r="50" fill="#F5D442" />

        {/* Distant hills */}
        <ellipse cx="400"  cy="648" rx="380" ry="80" fill="#8BAE5A" opacity="0.38" />
        <ellipse cx="1000" cy="655" rx="320" ry="70" fill="#8BAE5A" opacity="0.32" />

        {/* ── LEFT ACACIA TREE 1 ── */}
        <rect x="72" y="480" width="12" height="172" rx="4" fill="#3D1F0A" />
        {/* Canopy */}
        <ellipse cx="78"  cy="472" rx="90" ry="20" fill="#5A9E3A" />
        <ellipse cx="38"  cy="484" rx="52" ry="15" fill="#5A9E3A" />
        <ellipse cx="122" cy="481" rx="58" ry="16" fill="#5A9E3A" />
        {/* Birds on left tree */}
        <ellipse cx="22"  cy="478" rx="9" ry="6" fill="#E8643A" />
        <polygon points="13,478 7,476 7,480" fill="#E8643A" />
        <ellipse cx="148" cy="475" rx="8" ry="5" fill="#F5C842" />
        <polygon points="156,475 162,473 162,477" fill="#F5C842" />

        {/* ── LEFT ACACIA TREE 2 — shorter ── */}
        <rect x="215" y="532" width="10" height="120" rx="3" fill="#3D1F0A" />
        <ellipse cx="220" cy="525" rx="68" ry="17" fill="#5A9E3A" />
        <ellipse cx="185" cy="535" rx="40" ry="13" fill="#5A9E3A" />
        <ellipse cx="258" cy="533" rx="44" ry="14" fill="#5A9E3A" />
        {/* Bird */}
        <ellipse cx="172" cy="529" rx="7" ry="5" fill="#E8643A" />
        <polygon points="165,529 159,527 159,531" fill="#E8643A" />

        {/* ── RIGHT ACACIA TREE 1 ── */}
        <rect x="1290" y="475" width="13" height="177" rx="4" fill="#3D1F0A" />
        <ellipse cx="1296" cy="467" rx="94" ry="21" fill="#5A9E3A" />
        <ellipse cx="1254" cy="479" rx="54" ry="16" fill="#5A9E3A" />
        <ellipse cx="1340" cy="476" rx="60" ry="17" fill="#5A9E3A" />
        {/* Birds on right tree */}
        <ellipse cx="1246" cy="472" rx="9" ry="6" fill="#F5C842" />
        <polygon points="1237,472 1231,470 1231,474" fill="#F5C842" />
        <ellipse cx="1362" cy="469" rx="8" ry="5" fill="#E8643A" />
        <polygon points="1370,469 1376,467 1376,471" fill="#E8643A" />

        {/* ── RIGHT ACACIA TREE 2 — near edge ── */}
        <rect x="1400" y="515" width="11" height="137" rx="3" fill="#3D1F0A" />
        <ellipse cx="1405" cy="508" rx="72" ry="18" fill="#5A9E3A" />
        <ellipse cx="1368" cy="518" rx="42" ry="13" fill="#5A9E3A" />

        {/* Ground */}
        <path d="M0,648 Q160,634 320,642 Q480,650 640,638 Q800,626 960,640 Q1120,652 1280,640 Q1400,632 1440,636 L1440,900 L0,900 Z"
          fill="#C8C84A" />
        <path d="M0,648 Q160,634 320,642 Q480,650 640,638 Q800,626 960,640 Q1120,652 1280,640 Q1400,632 1440,636"
          fill="none" stroke="#A8A830" strokeWidth="2" opacity="0.4" />

        {/* Grass tufts */}
        {[70,210,370,520,680,820,960,1100,1250,1400].map((x, i) => (
          <g key={i}>
            <path d={`M${x},648 Q${x-3},634 ${x-7},648`} stroke="#3B6D11" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d={`M${x},648 Q${x+2},632 ${x+6},648`} stroke="#3B6D11" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d={`M${x+10},650 Q${x+12},636 ${x+16},650`} stroke="#3B6D11" strokeWidth="2" fill="none" strokeLinecap="round" />
          </g>
        ))}

        {/* Scattered flowers */}
        {[[150,670,'#F472B6'],[340,685,'#FFFFFF'],[600,672,'#F472B6'],[850,680,'#FFFFFF'],
          [1050,675,'#F472B6'],[1220,682,'#FFFFFF'],[1380,670,'#F472B6']].map(([x,y,c],i) => (
          <g key={i}>
            <line x1={x} y1={y} x2={x} y2={Number(y)+14} stroke="#3B6D11" strokeWidth="2" />
            <circle cx={x} cy={y} r="6" fill={c} />
          </g>
        ))}
      </svg>
    </div>
  )
}
