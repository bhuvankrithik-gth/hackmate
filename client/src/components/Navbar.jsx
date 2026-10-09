import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api/axios.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'

export function Logo({ compact = false }) {
  return (
    <Link to="/" className="flex items-center gap-2.5 group">
      <span className="relative inline-flex">
        <svg width="34" height="34" viewBox="0 0 32 32" className="drop-shadow-[0_0_10px_rgba(168,85,247,0.6)] group-hover:drop-shadow-[0_0_16px_rgba(168,85,247,0.9)] transition-all">
          <defs>
            <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#a855f7" />
              <stop offset="1" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
          <rect width="32" height="32" rx="8" fill="url(#logo-g)" />
          <path d="M11 12l5 4-5 4" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M17.5 21.5h5" stroke="#0a0e1a" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </span>
      {!compact && (
        <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Hack<span className="gradient-text">Mate</span>
        </span>
      )}
    </Link>
  )
}

const studentLinks = [
  { to: '/hackathons', label: 'Hackathons' },
  { to: '/find-teammates', label: 'Find Teammates' },
  { to: '/requests', label: 'Requests' },
]

const hostLinks = [{ to: '/host', label: 'Dashboard' }]

function linkCls({ isActive }) {
  return `px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
    isActive
      ? 'text-purple-600 dark:text-purple-300 bg-purple-500/10 dark:bg-purple-500/15 shadow-[inset_0_0_12px_rgba(168,85,247,0.15)]'
      : 'text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-white hover:bg-slate-900/5 dark:hover:bg-white/5'
  }`
}

export default function Navbar() {
  const { user, isAuthed, isStudent, isHost, logout } = useAuth()
  const { isDark, toggle } = useTheme()
  const navigate = useNavigate()
  const [unread, setUnread] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)

  // Poll unread notification count every 30s.
  useEffect(() => {
    if (!isAuthed) {
      setUnread(0)
      return
    }
    let alive = true
    const fetchCount = async () => {
      try {
        const { data } = await api.get('/notifications/unread-count')
        if (alive) setUnread(data.count || 0)
      } catch {
        /* silent */
      }
    }
    fetchCount()
    const id = setInterval(fetchCount, 30000)
    return () => {
      alive = false
      clearInterval(id)
    }
  }, [isAuthed])

  const links = isHost ? hostLinks : isStudent ? studentLinks : []

  const handleLogout = () => {
    logout()
    setUserOpen(false)
    setMobileOpen(false)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40">
      <div className="glass !rounded-none border-x-0 border-t-0">
        <div className="page-shell">
          <div className="flex items-center justify-between h-16">
            <Logo />

            {/* desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {links.map((l) => (
                <NavLink key={l.to} to={l.to} className={linkCls} end={l.to === '/host'}>
                  {l.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              {/* theme toggle */}
              <button
                onClick={toggle}
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                className="w-9 h-9 rounded-lg glass-soft flex items-center justify-center text-slate-600 dark:text-slate-300 hover:border-purple-500/50 hover:text-purple-500 dark:hover:text-purple-300 transition-all"
              >
                {isDark ? (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                  </svg>
                ) : (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
                  </svg>
                )}
              </button>

              {isAuthed ? (
                <>
                  {/* notification bell */}
                  <Link
                    to="/notifications"
                    className="relative w-9 h-9 rounded-lg glass-soft flex items-center justify-center text-slate-600 dark:text-slate-300 hover:border-purple-500/50 hover:text-purple-500 dark:hover:text-purple-300 transition-all"
                    title="Notifications"
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
                    </svg>
                    {unread > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 min-w-[1.25rem] h-5 px-1 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-[10px] font-bold flex items-center justify-center shadow-neon">
                        {unread > 99 ? '99+' : unread}
                      </span>
                    )}
                  </Link>

                  {/* user menu */}
                  <div className="relative hidden md:block">
                    <button
                      onClick={() => setUserOpen((v) => !v)}
                      className="flex items-center gap-2 rounded-lg glass-soft pl-1.5 pr-2.5 py-1.5 hover:border-purple-500/50 transition-all"
                    >
                      <span className="w-7 h-7 rounded-md bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                        {(user?.name || 'U').charAt(0).toUpperCase()}
                      </span>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200 max-w-[7rem] truncate">
                        {user?.name?.split(' ')[0]}
                      </span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`text-slate-400 transition-transform ${userOpen ? 'rotate-180' : ''}`}>
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>
                    <AnimatePresence>
                      {userOpen && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setUserOpen(false)} />
                          <motion.div
                            initial={{ opacity: 0, y: -6, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -6, scale: 0.98 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 mt-2 w-52 glass rounded-xl p-2 z-20 shadow-2xl"
                          >
                            <div className="px-3 py-2 border-b border-slate-200 dark:border-white/10 mb-1">
                              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user?.name}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                              <span className="chip mt-1.5 border-purple-500/40 bg-purple-500/10 text-purple-600 dark:text-purple-300 capitalize">
                                {user?.role}
                              </span>
                            </div>
                            {!isHost && (
                              <Link to="/profile" onClick={() => setUserOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-purple-500/10 hover:text-purple-600 dark:hover:text-purple-300">
                                Edit profile
                              </Link>
                            )}
                            <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-500 dark:text-red-400 hover:bg-red-500/10">
                              Log out
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link to="/login" className="btn-secondary btn-sm !px-4 !py-2">
                    Log in
                  </Link>
                  <Link to="/register" className="btn-primary btn-sm !px-4 !py-2">
                    Get started
                  </Link>
                </div>
              )}

              {/* mobile hamburger */}
              <button
                onClick={() => setMobileOpen((v) => !v)}
                className="md:hidden w-9 h-9 rounded-lg glass-soft flex items-center justify-center text-slate-600 dark:text-slate-300"
                aria-label="Menu"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  {mobileOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden border-t border-slate-200 dark:border-white/10"
            >
              <div className="page-shell py-3 flex flex-col gap-1">
                {links.map((l) => (
                  <NavLink key={l.to} to={l.to} className={linkCls} onClick={() => setMobileOpen(false)} end={l.to === '/host'}>
                    {l.label}
                  </NavLink>
                ))}
                {!isHost && isAuthed && (
                  <NavLink to="/profile" className={linkCls} onClick={() => setMobileOpen(false)}>
                    Profile
                  </NavLink>
                )}
                {isAuthed ? (
                  <button onClick={handleLogout} className="text-left px-3.5 py-2 rounded-lg text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-500/10">
                    Log out ({user?.name?.split(' ')[0]})
                  </button>
                ) : (
                  <div className="flex gap-2 pt-1">
                    <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary btn-sm flex-1">Log in</Link>
                    <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary btn-sm flex-1">Get started</Link>
                  </div>
                )}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
