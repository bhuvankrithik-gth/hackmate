import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import api, { apiError } from '../api/axios.js'
import { timeAgo, NOTIF_ICONS } from '../utils/format.js'
import { ListSkeleton } from '../components/Skeleton.jsx'
import EmptyState from '../components/EmptyState.jsx'

export default function Notifications() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/notifications')
      setItems(data.notifications || [])
    } catch (err) {
      toast.error(apiError(err, 'Could not load notifications.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const markRead = async (n) => {
    if (n.read) {
      if (n.link) navigate(n.link)
      return
    }
    try {
      await api.put(`/notifications/${n._id}/read`)
      setItems((list) => list.map((x) => (x._id === n._id ? { ...x, read: true } : x)))
    } catch {
      /* non-fatal */
    } finally {
      if (n.link) navigate(n.link)
    }
  }

  const markAll = async () => {
    const unreadIds = items.filter((n) => !n.read).map((n) => n._id)
    if (unreadIds.length === 0) return
    setMarking(true)
    try {
      await Promise.all(unreadIds.map((id) => api.put(`/notifications/${id}/read`)))
      setItems((list) => list.map((x) => ({ ...x, read: true })))
      toast.success('All caught up! ✅')
    } catch {
      toast.error('Could not mark all as read.')
    } finally {
      setMarking(false)
    }
  }

  const unreadCount = items.filter((n) => !n.read).length

  return (
    <div className="page-shell py-10 max-w-3xl">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="font-mono text-xs text-cyan-600 dark:text-cyan-400 mb-1">$ hackmate inbox --unread {unreadCount}</p>
          <h1 className="section-title">Notifications</h1>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAll} disabled={marking} className="btn-secondary btn-sm shrink-0">
            {marking ? 'Marking…' : 'Mark all read'}
          </button>
        )}
      </div>

      {loading ? (
        <ListSkeleton rows={4} />
      ) : items.length === 0 ? (
        <EmptyState icon="🔕" title="All quiet" message="Team invites, acceptances and host announcements will show up here." />
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {items.map((n) => (
              <motion.button
                key={n._id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                onClick={() => markRead(n)}
                className={`w-full text-left glass rounded-2xl p-4 flex gap-4 items-start transition-all cursor-pointer card-hover ${
                  n.read ? 'opacity-70' : 'border-purple-500/30 dark:border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.12)]'
                }`}
              >
                <span className="text-2xl shrink-0 w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  {NOTIF_ICONS[n.type] || '🔔'}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-2">
                    <span className={`font-semibold text-sm ${n.read ? 'text-slate-600 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                      {n.title}
                    </span>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-purple-500 shadow-neon shrink-0" />}
                  </span>
                  {n.body && <span className="block mt-1 text-sm text-slate-500 dark:text-slate-400">{n.body}</span>}
                  <span className="block mt-1.5 text-[11px] font-mono text-slate-400">{timeAgo(n.createdAt)}</span>
                </span>
                {n.link && <span className="text-purple-500 dark:text-purple-300 text-sm shrink-0">→</span>}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
