import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api, { apiError, toQuery } from '../api/axios.js'
import { formatDate, formatDateTime } from '../utils/format.js'
import CountdownTimer from '../components/CountdownTimer.jsx'
import { HackathonCardSkeleton } from '../components/Skeleton.jsx'
import EmptyState from '../components/EmptyState.jsx'

function StatusBadge({ status }) {
  const open = status === 'open'
  return (
    <span className={`chip font-mono ${open ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-600 dark:text-cyan-300' : 'border-slate-400/40 bg-slate-500/10 text-slate-500 dark:text-slate-400'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${open ? 'bg-cyan-400 animate-pulse' : 'bg-slate-400'}`} />
      {open ? 'OPEN' : 'CLOSED'}
    </span>
  )
}

function Banner({ url, title }) {
  if (url) {
    return <img src={url} alt={title} className="w-full h-40 object-cover" loading="lazy" />
  }
  return (
    <div className="w-full h-40 bg-gradient-to-br from-purple-600/40 via-fuchsia-600/25 to-cyan-500/40 dark:from-purple-700/50 dark:via-fuchsia-700/30 dark:to-cyan-600/40 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 30% 40%, rgba(255,255,255,0.25), transparent 50%)' }} />
      <span className="font-mono text-5xl font-bold text-white/40 select-none">&lt;/&gt;</span>
    </div>
  )
}

function HackathonCard({ h, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.4) }}
    >
      <Link to={`/hackathons/${h._id}`} className="glass card-hover rounded-2xl overflow-hidden block h-full">
        <div className="relative">
          <Banner url={h.bannerUrl} title={h.title} />
          <div className="absolute top-3 left-3 flex gap-2">
            <StatusBadge status={h.status} />
            {h.isRegistered && (
              <span className="chip border-purple-500/40 bg-purple-600/80 text-white font-mono">✓ REGISTERED</span>
            )}
          </div>
        </div>
        <div className="p-5">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug line-clamp-1">{h.title}</h3>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[2.5rem]">{h.description}</p>

          <div className="mt-4">
            <CountdownTimer deadline={h.registrationDeadline} compact />
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {(h.requiredSkills || []).slice(0, 4).map((s) => (
              <span key={s} className="chip border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-300">
                {s}
              </span>
            ))}
            {(h.requiredSkills || []).length > 4 && (
              <span className="chip border-slate-300 dark:border-white/10 text-slate-400">+{h.requiredSkills.length - 4}</span>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-mono" title={`Starts ${formatDateTime(h.startDate)}`}>📅 {formatDate(h.startDate)} → {formatDate(h.endDate)}</span>
            <span className="font-mono">👥 {h.participantCount ?? 0} · 🧑‍🤝‍🧑 {h.teamCount ?? 0}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Team size ≤ {h.teamSizeLimit} · {h.mode === 'online' ? '🌐 Online' : `📍 ${h.venue || 'Offline'}`}</span>
            <span className="text-purple-500 dark:text-purple-300 font-semibold">View →</span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default function Hackathons() {
  const [hackathons, setHackathons] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ search: '', skill: '', status: '', from: '', to: '' })

  const fetchAll = useCallback(async (f = filters) => {
    setLoading(true)
    try {
      const { data } = await api.get(`/hackathons?${toQuery(f)}`)
      setHackathons(data.hackathons || [])
    } catch (err) {
      // keep silent on list load; show empty state
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  // Debounced search
  useEffect(() => {
    const id = setTimeout(() => fetchAll(filters), 400)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.skill, filters.status, filters.from, filters.to])

  const setF = (k, v) => setFilters((f) => ({ ...f, [k]: v }))
  const clearFilters = () => setFilters({ search: '', skill: '', status: '', from: '', to: '' })
  const hasFilters = Object.values(filters).some(Boolean)

  return (
    <div className="page-shell py-10">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-7">
        <div>
          <p className="font-mono text-xs text-cyan-600 dark:text-cyan-400 mb-1">$ hackmate ls --hackathons</p>
          <h1 className="section-title">Hackathons</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Pick your battleground. The countdown is already running.</p>
        </div>
      </div>

      {/* filters */}
      <div className="glass rounded-2xl p-4 mb-7">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <input
              className="input"
              placeholder="🔍 Search title or description…"
              value={filters.search}
              onChange={(e) => setF('search', e.target.value)}
            />
          </div>
          <input className="input" placeholder="Skill (e.g. React)" value={filters.skill} onChange={(e) => setF('skill', e.target.value)} />
          <select className="input" value={filters.status} onChange={(e) => setF('status', e.target.value)}>
            <option value="" className="bg-white dark:bg-void-900">All statuses</option>
            <option value="open" className="bg-white dark:bg-void-900">Open</option>
            <option value="closed" className="bg-white dark:bg-void-900">Closed</option>
          </select>
          <input type="date" className="input" value={filters.from} onChange={(e) => setF('from', e.target.value)} title="From date" />
          <input type="date" className="input" value={filters.to} onChange={(e) => setF('to', e.target.value)} title="To date" />
        </div>
        {hasFilters && (
          <button onClick={clearFilters} className="mt-3 text-xs font-mono text-purple-500 dark:text-purple-300 hover:underline">
            ✕ clear all filters
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <HackathonCardSkeleton key={i} />
          ))}
        </div>
      ) : hackathons.length === 0 ? (
        <EmptyState
          icon="🛸"
          title="No hackathons found"
          message={hasFilters ? 'Try loosening your filters — the perfect hackathon might be hiding.' : 'No hackathons are live right now. Check back soon.'}
          actionLabel={hasFilters ? 'Clear filters' : undefined}
          onAction={hasFilters ? clearFilters : undefined}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {hackathons.map((h, i) => (
            <HackathonCard key={h._id} h={h} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
