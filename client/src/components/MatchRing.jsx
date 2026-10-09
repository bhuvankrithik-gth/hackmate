/**
 * MatchRing — SVG circular progress for teammate match percentages.
 * Colors per contract: red < 40, orange 40–70, green > 70.
 */
export default function MatchRing({ percent = 0, size = 88, stroke = 8, showLabel = true }) {
  const p = Math.max(0, Math.min(100, Math.round(percent)))
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const color = p < 40 ? '#ef4444' : p <= 70 ? '#f59e0b' : '#22c55e'

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <filter id={`glow-${p}-${size}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" className="text-slate-200 dark:text-white/10" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * p) / 100}
          filter={`url(#glow-${p}-${size})`}
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.22, 1, 0.36, 1)' }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono font-bold text-slate-900 dark:text-white" style={{ fontSize: size * 0.22 }}>
            {p}%
          </span>
          <span className="text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400">match</span>
        </div>
      )}
    </div>
  )
}
