import { useEffect, useState } from 'react'

function pad(n) {
  return String(n).padStart(2, '0')
}

function parts(deadline) {
  const diff = new Date(deadline).getTime() - Date.now()
  if (Number.isNaN(diff) || diff <= 0) return null
  const d = Math.floor(diff / 86400000)
  const h = Math.floor((diff % 86400000) / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  return { d, h, m, s }
}

/**
 * CountdownTimer — live ticking countdown (1s interval) to a deadline.
 * Shows compact "Xd Xh Xm Xs" or a "Closed" state once past.
 */
export default function CountdownTimer({ deadline, label = 'Registration closes in', compact = false }) {
  const [t, setT] = useState(() => parts(deadline))

  useEffect(() => {
    setT(parts(deadline))
    const id = setInterval(() => setT(parts(deadline)), 1000)
    return () => clearInterval(id)
  }, [deadline])

  if (!t) {
    return (
      <span className="chip border-red-500/40 bg-red-500/10 text-red-500 dark:text-red-400 font-mono">
        ● Closed
      </span>
    )
  }

  const urgent = t.d === 0 && t.h < 6

  if (compact) {
    return (
      <span
        className={`font-mono text-sm font-semibold tabular-nums ${
          urgent ? 'text-red-500 dark:text-red-400 animate-pulse' : 'text-purple-600 dark:text-purple-300'
        }`}
        title={label}
      >
        {t.d > 0 && `${t.d}d `}
        {pad(t.h)}:{pad(t.m)}:{pad(t.s)}
      </span>
    )
  }

  const cells = [
    [t.d, 'days'],
    [t.h, 'hrs'],
    [t.m, 'min'],
    [t.s, 'sec'],
  ]

  return (
    <div>
      <p className="label !mb-2">{label}</p>
      <div className="flex gap-2">
        {cells.map(([v, u]) => (
          <div
            key={u}
            className={`glass-soft rounded-lg px-2.5 py-1.5 text-center min-w-[3.25rem] ${
              urgent ? 'border-red-500/40' : ''
            }`}
          >
            <div
              className={`font-mono text-lg font-bold tabular-nums leading-none ${
                urgent ? 'text-red-500 dark:text-red-400' : 'text-slate-900 dark:text-white'
              }`}
            >
              {pad(v)}
            </div>
            <div className="text-[9px] uppercase tracking-widest text-slate-500 dark:text-slate-400 mt-0.5">{u}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
