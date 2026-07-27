import { useEffect, useState } from 'react'

const MESSAGES = [
  'Every bin tracked. Every route accounted for.',
  'Ward 15 — cleaner streets, block by block.',
  'Report it, schedule it, track it — in one place.',
]

export default function AuthVisual() {
  const [msgIndex, setMsgIndex] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % MESSAGES.length)
    }, 3800)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative hidden md:flex flex-col justify-between w-full md:w-[46%] min-h-screen bg-[#0d2818] text-white px-10 py-12 overflow-hidden">
      <svg className="absolute inset-0 w-full h-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="36" height="36" patternUnits="userSpaceOnUse">
            <path d="M 36 0 L 0 0 0 36" fill="none" stroke="white" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      <div className="relative z-10">
        <p className="font-mono text-xs tracking-[0.2em] text-emerald-300/70 uppercase">Ward 15 · Kathmandu</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Smart Waste<br />Management System
        </h1>
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center my-8">
        <svg viewBox="0 0 320 320" className="w-full max-w-xs">
          <path
            id="route-path"
            d="M 30 260 C 80 220, 60 160, 120 140 S 200 100, 180 60 S 260 40, 280 30"
            fill="none"
            stroke="#34d399"
            strokeWidth="2.5"
            strokeLinecap="round"
            className={reducedMotion ? '' : 'route-line'}
            opacity="0.85"
          />
          {[[30, 260], [120, 140], [180, 60], [280, 30]].map(([cx, cy], i) => (
            <g key={i} className={reducedMotion ? '' : 'bin-pulse'} style={{ animationDelay: `${i * 0.4}s` }}>
              <circle cx={cx} cy={cy} r="7" fill="#0d2818" stroke="#34d399" strokeWidth="2" />
              <circle cx={cx} cy={cy} r="2.5" fill="#34d399" />
            </g>
          ))}
          {!reducedMotion && (
            <circle r="5" fill="#fff">
              <animateMotion dur="7s" repeatCount="indefinite" rotate="auto">
                <mpath href="#route-path" />
              </animateMotion>
            </circle>
          )}
        </svg>
      </div>

      <div className="relative z-10">
        <p className="text-sm text-white/70 h-10 transition-opacity duration-700">{MESSAGES[msgIndex]}</p>
        <p className="mt-3 font-mono text-[11px] text-emerald-300/50 tracking-wide">27.7172° N · 85.3240° E</p>
      </div>
    </div>
  )
}