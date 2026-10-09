import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import api, { apiError, toQuery } from '../api/axios.js'
import { timeAgo } from '../utils/format.js'
import { ListSkeleton } from '../components/Skeleton.jsx'
import EmptyState from '../components/EmptyState.jsx'

const statusStyle = {
  pending: 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-300',
  accepted: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
  declined: 'border-red-500/40 bg-red-500/10 text-red-500 dark:text-red-400',
  cancelled: 'border-slate-400/40 bg-slate-500/10 text-slate-500 dark:text-slate-400',
}

function RequestCard({ r, tab, onAction }) {
  const [busy, setBusy] = useState(false)
  const other = tab === 'received' ? r.fromUser : r.toUser
  const teamName = r.team?.name || 'a team'

  const act = async (fn, okMsg) => {
    setBusy(true)
    try {
      await fn()
      toast.success(okMsg)
      onAction()
    } catch (err) {
      toast.error(apiError(err, 'Action failed.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="glass rounded-2xl p-5 flex gap-4 items-start"
    >
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-white font-bold shrink-0">
        {(other?.name || '?').charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-slate-900 dark:text-white text-sm">
            {tab === 'received' ? (
              <><span className="text-purple-500 dark:text-purple-300">{other?.name}</span> wants to join <Link to={`/teams/${r.team?._id}`} className="text-cyan-600 dark:text-cyan-300 hover:underline">{teamName}</Link></>
            ) : (
              <>You → <span className="text-purple-500 dark:text-purple-300">{other?.name}</span> · <Link to={`/teams/${r.team?._id}`} className="text-cyan-600 dark:text-cyan-300 hover:underline">{teamName}</Link></>
            )}
          </p>
          <span className={`chip font-mono !text-[10px] ${statusStyle[r.status] || statusStyle.pending}`}>{(r.status || 'pending').toUpperCase()}</span>
        </div>
        {other?.college && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{other.college}{other.branch ? ` · ${other.branch}` : ''}</p>}
        {r.message && (
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 glass-soft rounded-lg px-3 py-2 italic">“{r.message}”</p>
        )}
        <p className="mt-1.5 text-[11px] font-mono text-slate-400">{timeAgo(r.createdAt)}</p>

        {r.status === 'pending' && (
          <div className="mt-3 flex gap-2">
            {tab === 'received' ? (
              <>
                <button disabled={busy} onClick={() => act(() => api.put(`/requests/${r._id}/accept`), `Welcome aboard, ${other?.name?.split(' ')[0]}! 🎉`)} className="btn-primary btn-sm">
                  Accept ✓
                </button>
                <button disabled={busy} onClick={() => act(() => api.put(`/requests/${r._id}/decline`), 'Request declined.')} className="btn-secondary btn-sm">
                  Decline
                </button>
              </>
            ) : (
              <button disabled={busy} onClick={() => act(() => api.delete(`/requests/${r._id}`), 'Request cancelled.')} className="btn-secondary btn-sm">
                Cancel request
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function Requests() {
  const [tab, setTab] = useState('received')
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/requests?${toQuery({ tab })}`)
      setRequests(data.requests || [])
    } catch (err) {
      toast.error(apiError(err, 'Could not load requests.'))
    } finally {
      setLoading(false)
    }
  }, [tab])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="page-shell py-10 max-w-4xl">
      <p className="font-mono text-xs text-cyan-600 dark:text-cyan-400 mb-1">$ hackmate requests --inbox</p>
      <h1 className="section-title">Team requests</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 mb-6">Invites you sent, and hackers knocking on your door.</p>

      <div className="glass rounded-2xl p-1.5 grid grid-cols-2 gap-1.5 mb-6 max-w-sm">
        {['received', 'sent'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold capitalize transition-all cursor-pointer ${
              tab === t
                ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-neon'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            {t === 'received' ? '📥 Received' : '📤 Sent'}
          </button>
        ))}
      </div>

      {loading ? (
        <ListSkeleton rows={3} />
      ) : requests.length === 0 ? (
        <EmptyState
          icon={tab === 'received' ? '📭' : '🕊️'}
          title={tab === 'received' ? 'No incoming requests' : 'No outgoing requests'}
          message={tab === 'received' ? 'When hackers want to join your team, their invites land here.' : 'Head to Find Teammates and invite someone awesome.'}
          actionLabel={tab === 'sent' ? 'Find teammates' : undefined}
          actionTo={tab === 'sent' ? '/find-teammates' : undefined}
        />
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {requests.map((r) => (
              <RequestCard key={r._id} r={r} tab={tab} onAction={load} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
