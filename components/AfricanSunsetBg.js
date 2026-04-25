'use client'

export function AfricanSunsetBg() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #C8392B 0%, #E8763A 38%, #F5C842 100%)' }}>

      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">

        {/* Heat haze near horizon */}
        <rect x="0" y="608" width="1440" height="60" fill="#F5C842" opacity="0.18" />

        {/* Sun glow */}
        <circle cx="720" cy="648" r="110" fill="#F5D442" opacity="0.22" />
        {/* Sun */}
        <circle cx="720" cy="648" r="80" fill="#F5D442" opacity="0.95" />

        {/* Birds (V shapes in sky) */}
        <path d="M340,175 Q352,163 364,175" fill="none" stroke="#1A0A00" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M368,158 Q381,145 394,158" fill="none" stroke="#1A0A00" strokeWidth="3.5" strokeLinecap="round" />

        {/* ── ACACIA TREES ── */}

        {/* Left tree 1 — tall */}
        <rect x="52" y="490" width="11" height="160" rx="4" fill="#1A0A00" />
        <ellipse cx="57"  cy="485" rx="80" ry="18" fill="#1A0A00" />
        <ellipse cx="20"  cy="495" rx="48" ry="13" fill="#1A0A00" />
        <ellipse cx="100" cy="493" rx="52" ry="14" fill="#1A0A00" />

        {/* Left tree 2 — shorter, partially off screen */}
        <rect x="198" y="545" width="9" height="105" rx="3" fill="#1A0A00" />
        <ellipse cx="202" cy="540" rx="62" ry="15" fill="#1A0A00" />
        <ellipse cx="168" cy="549" rx="36" ry="11" fill="#1A0A00" />
        <ellipse cx="238" cy="547" rx="38" ry="12" fill="#1A0A00" />

        {/* Right tree 1 — tall */}
        <rect x="1272" y="482" width="12" height="168" rx="4" fill="#1A0A00" />
        <ellipse cx="1278" cy="476" rx="84" ry="19" fill="#1A0A00" />
        <ellipse cx="1238" cy="487" rx="50" ry="14" fill="#1A0A00" />
        <ellipse cx="1320" cy="484" rx="55" ry="15" fill="#1A0A00" />

        {/* Right tree 2 — medium, near edge */}
        <rect x="1390" y="528" width="10" height="122" rx="3" fill="#1A0A00" />
        <ellipse cx="1395" cy="522" rx="68" ry="16" fill="#1A0A00" />
        <ellipse cx="1358" cy="531" rx="40" ry="12" fill="#1A0A00" />

        {/* Tiny giraffe silhouette — far right background */}
        {/* Body */}
        <rect x="1122" y="595" width="18" height="28" rx="4" fill="#1A0A00" opacity="0.8" />
        {/* Neck */}
        <rect x="1126" y="562" width="7" height="36" rx="3" fill="#1A0A00" opacity="0.8" />
        {/* Head */}
        <ellipse cx="1131" cy="558" rx="7" ry="5" fill="#1A0A00" opacity="0.8" />
        {/* Legs */}
        <line x1="1125" y1="622" x2="1123" y2="645" stroke="#1A0A00" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
        <line x1="1135" y1="622" x2="1133" y2="645" stroke="#1A0A00" strokeWidth="4" strokeLinecap="round" opacity="0.8" />

        {/* Ground */}
        <path d="M0,652 Q120,638 240,645 Q380,653 520,642 Q660,632 800,648 Q940,660 1080,648 Q1220,638 1360,645 Q1420,648 1440,644 L1440,900 L0,900 Z"
          fill="#C8A050" />

        {/* Ground highlight edge */}
        <path d="M0,652 Q120,638 240,645 Q380,653 520,642 Q660,632 800,648 Q940,660 1080,648 Q1220,638 1360,645 Q1420,648 1440,644"
          fill="none" stroke="#A08040" strokeWidth="2" opacity="0.5" />

        {/* Rocks */}
        <ellipse cx="320"  cy="700" rx="22" ry="12" fill="#A08040" />
        <ellipse cx="750"  cy="720" rx="18" ry="10" fill="#A08040" />
        <ellipse cx="1150" cy="705" rx="25" ry="13" fill="#A08040" />

        {/* Grass tufts */}
        {[80,220,390,540,680,820,960,1080,1210,1360].map((x, i) => (
          <g key={i}>
            <path d={`M${x},652 Q${x-4},638 ${x-8},652`} stroke="#8B6914" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d={`M${x},652 Q${x+2},635 ${x+7},652`} stroke="#8B6914" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d={`M${x+12},654 Q${x+14},640 ${x+18},654`} stroke="#8B6914" strokeWidth="2" fill="none" strokeLinecap="round" />
          </g>
        ))}
      </svg>
    </div>
  )
}
