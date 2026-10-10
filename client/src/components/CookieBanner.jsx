import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const KEY = 'hm-cookie-ok'

export default function CookieBanner() {
  const [visible, setVisible] = useState(() => {
    try {
      return localStorage.getItem(KEY) !== '1'
    } catch {
      return true
    }
  })

  const accept = () => {
    try {
      localStorage.setItem(KEY, '1')
    } catch {
      /* storage unavailable — just hide for this session */
    }
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50"
        >
          <div className="glass rounded-2xl p-4 shadow-2xl flex gap-3 items-start">
            <span className="text-2xl shrink-0">🍪</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                We use minimal browser storage to keep you logged in and remember your preferences.
                No ad trackers, ever. See our{' '}
                <Link to="/privacy" className="text-purple-500 dark:text-purple-300 font-semibold hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
              <button onClick={accept} className="btn-primary btn-sm mt-3">
                Got it ✓
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
