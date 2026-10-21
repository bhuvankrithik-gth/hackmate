import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import api, { apiError } from '../../api/axios.js'
import { useAuth } from '../../context/AuthContext.jsx'
import EmptyState from '../../components/EmptyState.jsx'

function statusChip(status) {
  if (status === 'approved') return 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
  if (status === 'pending') return 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-300'
  return 'border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-300'
}

function HostRow({ host, busyId, onDecide, showActions }) {
  const busy = busyId === host._id
  return (
    <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-white/5 last:border-0">
      <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-white font-bold shrink-0">
        {(host.name || 'H').charAt(0).toUpperCase()}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-slate-900 dark:text-white truncate">
          {host.name}
          {host.isAdmin && <span className="chip ml-2 border-purple-500/40 bg-purple-500/10 text-purple-600 dark:text-purple-300">ADMIN</span>}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
          {host.email} · {host.organization || '—'} · requested {new Date(host.createdAt).toLocaleDateString()}
        </p>
      </div>
      <span className={`chip font-mono ${statusChip(host.hostStatus)}`}>{(host.hostStatus || 'approved').toUpperCase()}</span>
      {showActions && !host.isAdmin && (
        <div className="flex gap-1.5">
          {host.hostStatus !== 'approved' && (
            <button onClick={() => onDecide(host, 'approve')} disabled={busy} className="btn-primary btn-sm">
              {busy ? '…' : '✓ Approve'}
            </button>
          )}
          {host.hostStatus !== 'rejected' && (
            <button onClick={() => onDecide(host, 'reject')} disabled={busy} className="btn-danger btn-sm">
              {busy ? '…' : host.hostStatus === 'approved' ? 'Revoke' : '✕ Reject'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function HostRequests() {
  const { user } = useAuth()
  const [pending, setPending] = useState([])
  const [hosts, setHosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [forbidden, setForbidden] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/users/host-requests')
      setPending(data.pending || [])
      setHosts(data.hosts || [])
      setForbidden(false)
    } catch (err) {
      if (err?.response?.status === 403) setForbidden(true)
      else toast.error(apiError(err, 'Could not load host requests.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const decide = async (host, action) => {
    setBusyId(host._id)
    try {
      await api.post(`/users/host-requests/${host._id}/${action}`)
      toast.success(
        action === 'approve'
          ? `${host.name} approved — they can log in and create hackathons now.`
          : `${host.name} ${host.hostStatus === 'approved' ? 'revoked' : 'rejected'}.`
      )
      await load()
    } catch (err) {
      toast.error(apiError(err, 'Could not update that host.'))
    } finally {
      setBusyId(null)
    }
  }

  if (!loading && forbidden) {
    return (
      <div className="page-shell py-10">
        <EmptyState
          icon="🔒"
          title="Admins only"
          message={`Host approvals are handled by the HackMate admin${user?.email ? '' : ''}. If that's you, make sure you're logged in with the admin host account.`}
          actionLabel="Back to dashboard"
          actionTo="/host"
        />
      </div>
    )
  }

  return (
    <div className="page-shell py-10">
      <div className="mb-7">
        <p className="font-mono text-xs text-cyan-600 dark:text-cyan-400 mb-1">$ hackmate admin --host-requests</p>
        <h1 className="section-title">Host <span className="gradient-text">approvals</span></h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          New hosts can&rsquo;t log in or create hackathons until you approve them here. You can also revoke a host who misbehaves.
        </p>
      </div>

      <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-4">
        Pending requests {pending.length > 0 && <span className="chip ml-1 border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-300 font-mono">{pending.length}</span>}
      </h2>

      {loading ? (
        <div className="glass rounded-2xl p-6 text-sm text-slate-500 dark:text-slate-400">Loading…</div>
      ) : pending.length === 0 ? (
        <EmptyState icon="✅" title="All caught up" message="No host accounts are waiting for approval right now." />
      ) : (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl overflow-hidden mb-10">
          {pending.map((h) => (
            <HostRow key={h._id} host={h} busyId={busyId} onDecide={decide} showActions />
          ))}
        </motion.div>
      )}

      <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-4">All hosts</h2>
      {loading ? null : hosts.length === 0 ? (
        <EmptyState icon="🏛️" title="No hosts yet" message="Approved and rejected host accounts will show up here." />
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          {hosts.map((h) => (
            <HostRow key={h._id} host={h} busyId={busyId} onDecide={decide} showActions />
          ))}
        </div>
      )}
    </div>
  )
}
