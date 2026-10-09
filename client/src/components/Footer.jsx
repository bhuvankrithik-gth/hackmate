import { Link } from 'react-router-dom'
import { Logo } from './Navbar.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function Footer() {
  const { isStudent, isHost } = useAuth()

  return (
    <footer className="relative z-10 mt-16 border-t border-slate-200 dark:border-white/10 bg-white/40 dark:bg-black/30 backdrop-blur-xl">
      <div className="page-shell py-10">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 max-w-sm">
              Find your team. Win your hackathon. HackMate matches you with teammates who fill your skill gaps — before the clock runs out.
            </p>
            <p className="mt-3 font-mono text-xs text-slate-400 dark:text-slate-500">
              <span className="text-purple-500 dark:text-purple-400">$</span> hackmate --find-team --win
              <span className="animate-pulse">▊</span>
            </p>
          </div>
          <div>
            <h4 className="label">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-slate-500 dark:text-slate-400 hover:text-purple-500 dark:hover:text-purple-300">Home</Link></li>
              {isStudent && (
                <>
                  <li><Link to="/hackathons" className="text-slate-500 dark:text-slate-400 hover:text-purple-500 dark:hover:text-purple-300">Hackathons</Link></li>
                  <li><Link to="/find-teammates" className="text-slate-500 dark:text-slate-400 hover:text-purple-500 dark:hover:text-purple-300">Find teammates</Link></li>
                </>
              )}
              {isHost && (
                <li><Link to="/host" className="text-slate-500 dark:text-slate-400 hover:text-purple-500 dark:hover:text-purple-300">Host dashboard</Link></li>
              )}
            </ul>
          </div>
          <div>
            <h4 className="label">Account</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/login" className="text-slate-500 dark:text-slate-400 hover:text-purple-500 dark:hover:text-purple-300">Log in</Link></li>
              <li><Link to="/register" className="text-slate-500 dark:text-slate-400 hover:text-purple-500 dark:hover:text-purple-300">Sign up</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-slate-400 dark:text-slate-500">© 2026 HackMate. Built for hackers, by hackers.</p>
          <p className="font-mono text-xs text-slate-400 dark:text-slate-500">
            <span className="text-cyan-500 dark:text-cyan-400">◈</span> ship fast · team up · win big
          </p>
        </div>
      </div>
    </footer>
  )
}
