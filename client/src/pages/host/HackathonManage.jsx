import { useEffect, useState, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import api, { apiError, toQuery } from '../../api/axios.js'
import { formatDate, formatDateTime, timeAgo, skillNames } from '../../utils/format.js'
import { PageSpinner } from '../../components/ProtectedRoute.jsx'
import { ListSkeleton } from '../../components/Skeleton.jsx'
import EmptyState from '../../components/EmptyState.jsx'

function ParticipantsTab({ hackathonId }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ search: '', skill: '', college: '' })
  const [exporting, setExporting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/hackathons/${hackathonId}/participants?${toQuery(filters)}`)
      setRows(data.participants || [])
    } catch (err) {
      toast.error(apiError(err, 'Could not load participants.'))
    } finally {
      setLoading(false)
    }
  }, [hackathonId, filters.search, filters.skill, filters.college])

  useEffect(() => {
    const id = setTimeout(load, 350)
    return () => clearTimeout(id)
  }, [load])

  const exportCsv = async () => {
    setExporting(true)
    try {
      const res = await api.get(`/hackathons/${hackathonId}/participants/export`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }))
      const a = document.createElement('a')
      a.href = url
      a.download = `hackathon-${hackathonId}-participants.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      toast.success('CSV downloaded 📥')
    } catch (err) {
      toast.error(apiError(err, 'CSV export failed.'))
    } finally {
      setExporting(false)
    }
  }

  const setF = (k, v) => setFilters((f) => ({ ...f, [k]: v }))

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4">
        <input className="input !w-auto flex-1 min-w-[10rem]" placeholder="🔍 Name or email…" value={filters.search} onChange={(e) => setF('search', e.target.value)} />
        <input className="input !w-auto flex-1 min-w-[10rem]" placeholder="Skill" value={filters.skill} onChange={(e) => setF('skill', e.target.value)} />
        <input className="input !w-auto flex-1 min-w-[10rem]" placeholder="College" value={filters.college} onChange={(e) => setF('college', e.target.value)} />
        <button onClick={exportCsv} disabled={exporting} className="btn-primary btn-sm !px-4 !py-2.5">
          {exporting ? 'Exporting…' : '📥 Export CSV'}
        </button>
      </div>

      {loading ? (
        <ListSkeleton rows={5} />
      ) : rows.length === 0 ? (
        <EmptyState icon="👥" title="No participants" message="Nobody has registered yet — or nobody matches the filters." />
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[760px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/10">
                  <th className="px-5 py-3.5 font-semibold">Name</th>
                  <th className="px-5 py-3.5 font-semibold">College</th>
                  <th className="px-5 py-3.5 font-semibold">Skills</th>
                  <th className="px-5 py-3.5 font-semibold">Links</th>
                  <th className="px-5 py-3.5 font-semibold">Registered</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p._id} className="border-b border-slate-100 dark:border-white/5 last:border-0 hover:bg-purple-500/5 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-900 dark:text-white">{p.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{p.email}</p>
                      <p className="text-xs text-slate-400">{p.branch}{p.year ? ` · ${p.year}` : ''}</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">{p.college || '—'}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1 max-w-[16rem]">
                        {skillNames(p.skills).slice(0, 4).map((s) => (
                          <span key={s} className="chip border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-300 !text-[10px]">{s}</span>
                        ))}
                        {skillNames(p.skills).length > 4 && <span className="text-[10px] text-slate-400">+{skillNames(p.skills).length - 4}</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs">
                      {p.github && <a href={p.github.startsWith('http') ? p.github : `https://${p.github}`} target="_blank" rel="noreferrer" className="text-cyan-600 dark:text-cyan-300 hover:underline mr-2">gh</a>}
                      {p.linkedin && <a href={p.linkedin.startsWith('http') ? p.linkedin : `https://${p.linkedin}`} target="_blank" rel="noreferrer" className="text-cyan-600 dark:text-cyan-300 hover:underline">in</a>}
                      {!p.github && !p.linkedin && <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-500 dark:text-slate-400">{formatDate(p.registeredAt || p.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="px-5 py-3 text-xs font-mono text-slate-400 border-t border-slate-200 dark:border-white/10">
            {rows.length} participant{rows.length === 1 ? '' : 's'}
          </p>
        </div>
      )}
    </div>
  )
}

function TeamsTab({ hackathonId }) {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/hackathons/${hackathonId}/teams`)
        setTeams(data.teams || [])
      } catch (err) {
        toast.error(apiError(err, 'Could not load teams.'))
      } finally {
        setLoading(false)
      }
    })()
  }, [hackathonId])

  if (loading) return <ListSkeleton rows={4} />
  if (teams.length === 0) {
    return <EmptyState icon="🧑‍🤝‍🧑" title="No teams yet" message="Teams will appear here once participants start forming them." />
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {teams.map((t) => (
        <div key={t._id} className="glass card-hover rounded-2xl p-5">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="font-bold text-slate-900 dark:text-white">{t.name}</h3>
            <span className={`chip font-mono !text-[10px] ${t.isOpen === false ? 'border-red-500/40 bg-red-500/10 text-red-500' : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'}`}>
              {t.isOpen === false ? '🔒 CLOSED' : `● ${t.members?.length || 0} MEMBERS`}
            </span>
          </div>
          <div className="space-y-2">
            {(t.members || []).map((m) => (
              <div key={m._id} className="flex items-center gap-2.5 text-sm">
                <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                  {(m.name || '?').charAt(0).toUpperCase()}
                </span>
                <span className="text-slate-700 dark:text-slate-200 truncate">{m.name}</span>
                <span className="text-[11px] text-slate-400 truncate ml-auto">{skillNames(m.skills).slice(0, 3).join(', ')}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function AnnouncementsTab({ hackathonId }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ title: '', body: '' })
  const [sending, setSending] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/hackathons/${hackathonId}/announcements`)
      setItems(data.announcements || [])
    } catch (err) {
      toast.error(apiError(err, 'Could not load announcements.'))
    } finally {
      setLoading(false)
    }
  }, [hackathonId])

  useEffect(() => {
    load()
  }, [load])

  const publish = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.body.trim()) {
      toast.error('Title and body are required.')
      return
    }
    setSending(true)
    try {
      const { data } = await api.post(`/hackathons/${hackathonId}/announcements`, {
        title: form.title.trim(),
        body: form.body.trim(),
      })
      setItems((list) => [data.announcement || data, ...list])
      setForm({ title: '', body: '' })
      toast.success('Announcement published 📢 — every participant was notified.')
    } catch (err) {
      toast.error(apiError(err, 'Could not publish announcement.'))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <form onSubmit={publish} className="glass rounded-2xl p-6 h-fit lg:sticky lg:top-24">
        <h3 className="font-bold text-slate-900 dark:text-white mb-1">📢 New announcement</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Published instantly + pushes a notification to every participant.</p>
        <div className="space-y-3">
          <input className="input" placeholder="Title — e.g. Theme revealed!" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={120} />
          <textarea className="input resize-none" rows={5} placeholder="Details, links, judging criteria…" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
          <button type="submit" disabled={sending} className="btn-primary w-full">
            {sending ? 'Publishing…' : 'Publish announcement 📢'}
          </button>
        </div>
      </form>

      <div>
        {loading ? (
          <ListSkeleton rows={3} />
        ) : items.length === 0 ? (
          <EmptyState icon="📣" title="No announcements" message="Publish the first update for your hackers." />
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {items.map((a) => (
                <motion.div
                  key={a._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-2xl p-5 border-l-2 !border-l-purple-500"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-semibold text-slate-900 dark:text-white">{a.title}</h4>
                    <span className="text-[11px] font-mono text-slate-400 shrink-0">{timeAgo(a.createdAt)}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{a.body}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}

const TABS = [
  { id: 'participants', label: '👥 Participants' },
  { id: 'teams', label: '🧑‍🤝‍🧑 Teams' },
  { id: 'announcements', label: '📢 Announcements' },
]

export default function HackathonManage() {
  const { id } = useParams()
  const [hackathon, setHackathon] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('participants')

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/hackathons/${id}`)
        setHackathon(data.hackathon)
      } catch (err) {
        toast.error(apiError(err, 'Could not load hackathon.'))
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  if (loading) return <PageSpinner />
  if (!hackathon) {
    return (
      <div className="page-shell py-16">
        <EmptyState icon="🛰️" title="Hackathon not found" actionLabel="Back to dashboard" actionTo="/host" />
      </div>
    )
  }

  return (
    <div className="page-shell py-10">
      <Link to="/host" className="text-sm text-slate-500 dark:text-slate-400 hover:text-purple-500 dark:hover:text-purple-300 font-mono">
        ← /host
      </Link>

      <div className="mt-3 mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="section-title">{hackathon.title}</h1>
            <span className={`chip font-mono ${hackathon.status === 'open' ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-600 dark:text-cyan-300' : 'border-slate-400/40 bg-slate-500/10 text-slate-500'}`}>
              {hackathon.status?.toUpperCase()}
            </span>
          </div>
          <p className="mt-1 font-mono text-xs text-slate-400">
            {formatDateTime(hackathon.startDate)} → {formatDateTime(hackathon.endDate)} · {hackathon.participantCount ?? 0} participants · {hackathon.teamCount ?? 0} teams
          </p>
        </div>
        <Link to={`/host/hackathons/${id}/edit`} className="btn-secondary btn-sm">✏️ Edit details</Link>
      </div>

      <div className="glass rounded-2xl p-1.5 flex gap-1.5 mb-6 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer ${
              tab === t.id
                ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-neon'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {tab === 'participants' && <ParticipantsTab hackathonId={id} />}
          {tab === 'teams' && <TeamsTab hackathonId={id} />}
          {tab === 'announcements' && <AnnouncementsTab hackathonId={id} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
