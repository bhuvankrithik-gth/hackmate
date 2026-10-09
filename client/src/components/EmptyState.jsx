import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

/** Friendly empty-state panel with optional CTA. */
export default function EmptyState({ icon, title, message, actionLabel, actionTo, onAction }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass rounded-2xl p-10 text-center max-w-md mx-auto"
    >
      <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/30 flex items-center justify-center text-3xl mb-4">
        {icon || '🛰️'}
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
      {message && <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{message}</p>}
      {(actionLabel && actionTo) && (
        <Link to={actionTo} className="btn-primary mt-5">
          {actionLabel}
        </Link>
      )}
      {(actionLabel && onAction) && (
        <button onClick={onAction} className="btn-primary mt-5">
          {actionLabel}
        </button>
      )}
    </motion.div>
  )
}
