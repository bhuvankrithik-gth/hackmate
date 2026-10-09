import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import api, { apiError } from '../../api/axios.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { formatDate } from '../../utils/format.js'
import { HackathonCardSkeleton } from '../../components/Skeleton.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import Modal from '../../components/Modal.jsx'

function StatCard({ icon, label, value, accent }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass card-hover rounded-2xl p-5 relative overflow-hidden"
    >
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-30 ${accent}`} aria-hidden />
      <div className="text-2xl mb-2">{icon}</div>
      <p className="font-mono text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
      <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 mt-1">{label}</p>
    </motion.div>
  )
}

export default function HostDashboard() {
  const { user } = useAuth()
  const [hackathons, setHackathons] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/hackathons')
      setHackathons(data.hackathons || [])
    } catch (err) {
      toast.error(apiError(err, 'Could not load hackathons.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const doDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.delete(`/hackathons/${deleteTarget._id}`)
      toast.success(`"${deleteTarget.title}" deleted.`)
      setHackathons((list) => list.filter((h) => h._id !== deleteTarget._id))
    } catch (err) {
      toast.error(apiError(err, 'Could not delete hackathon.'))
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  const stats = {
    total: hackathons.length,
    open: hackathons.filter((h) => h.status === 'open').length,
    participants: hackathons.reduce((s, h) => s + (h.participantCount || 0), 0),
    teams: hackathons.reduce((s, h) => s + (h.teamCount || 0), 0),
  }

  return (
    <div className="page-shell py-10">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-7">
        <div>
          <p className="font-mono text-xs text-cyan-600 dark:text-cyan-400 mb-1">$ hackmate host --dashboard</p>
          <h1 className="section-title">
            Command center{user?.organization ? <span className="gradient-text"> · {user.organization}</span> : ''}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Run your hackathons like a mission control.</p>
        </div>
        <Link to="/host/hackathons/new" className="btn-primary">+ New hackathon</Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon="🏟️" label="Hackathons" value={stats.total} accent="bg-purple-500" />
        <StatCard icon="🟢" label="Open now" value={stats.open} accent="bg-cyan-500" />
        <StatCard icon="👥" label="Participants" value={stats.participants} accent="bg-fuchsia-500" />
        <StatCard icon="🧑‍🤝‍🧑" label="Teams" value={stats.teams} accent="bg-emerald-500" />
      </div>

      <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Your hackathons</h2>

      {loading ? (
        <div className="grid gap-5 md:grid-cols-2">
          <HackathonCardSkeleton />
          <HackathonCardSkeleton />
        </div>
      ) : hackathons.length === 0 ? (
        <EmptyState
          icon="🏟️"
          title="No hackathons yet"
          message="Create your first hackathon and start rallying hackers."
          actionLabel="+ Create hackathon"
          actionTo="/host/hackathons/new"
        />
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/10">
                  <th className="px-5 py-3.5 font-semibold">Hackathon</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 font-semibold">Dates</th>
                  <th className="px-5 py-3.5 font-semibold">Participants</th>
                  <th className="px-5 py-3.5 font-semibold">Teams</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {hackathons.map((h) => (
                  <tr key={h._id} className="border-b border-slate-100 dark:border-white/5 last:border-0 hover:bg-purple-500/5 transition-colors">
                    <td className="px-5 py-4">
                      <Link to={`/host/hackathons/${h._id}`} className="font-semibold text-slate-900 dark:text-white hover:text-purple-500 dark:hover:text-purple-300">
                        {h.title}
                      </Link>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{h.mode} · size ≤ {h.teamSizeLimit}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`chip font-mono ${h.status === 'open' ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-600 dark:text-cyan-300' : 'border-slate-400/40 bg-slate-500/10 text-slate-500'}`}>
                        {h.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                      {formatDate(h.startDate)} → {formatDate(h.endDate)}
                    </td>
                    <td className="px-5 py-4 font-mono">{h.participantCount ?? 0}</td>
                    <td className="px-5 py-4 font-mono">{h.teamCount ?? 0}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1.5">
                        <Link to={`/host/hackathons/${h._id}`} className="btn-secondary btn-sm" title="Manage">⚙️</Link>
                        <Link to={`/host/hackathons/${h._id}/edit`} className="btn-secondary btn-sm" title="Edit">✏️</Link>
                        <button onClick={() => setDeleteTarget(h)} className="btn-danger btn-sm" title="Delete">🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title="Delete hackathon?">
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
          <span className="font-semibold text-slate-800 dark:text-slate-200">“{deleteTarget?.title}”</span> will be permanently deleted along with all its teams, requests and announcements.
        </p>
        <p className="text-sm text-red-500 dark:text-red-400 mb-5">This cannot be undone.</p>
        <div className="flex gap-2">
          <button onClick={() => setDeleteTarget(null)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={doDelete} disabled={deleting} className="btn-danger flex-1">
            {deleting ? 'Deleting…' : 'Delete forever'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
