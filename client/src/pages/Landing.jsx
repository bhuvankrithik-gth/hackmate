import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext.jsx'

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: 'easeOut' },
  }),
}

const steps = [
  {
    n: '01',
    icon: '🧬',
    title: 'Build your hacker profile',
    text: 'List your skills with proficiency levels, your college, GitHub and LinkedIn. Your profile is your beacon.',
  },
  {
    n: '02',
    icon: '🛰️',
    title: 'Discover hackathons',
    text: 'Browse live hackathons with real-time registration countdowns. Filter by the skills each event needs.',
  },
  {
    n: '03',
    icon: '🤝',
    title: 'Match & team up',
    text: 'Our match engine scores candidates against your team\u2019s skill gaps. Send a request with one tap.',
  },
  {
    n: '04',
    icon: '🏆',
    title: 'Ship & win',
    text: 'Lock your squad before team formation closes, then go build something legendary.',
  },
]

const features = [
  { icon: '🎯', title: 'Smart match scoring', text: 'Candidates are scored against your team\u2019s missing skills, so every invite is intentional.' },
  { icon: '⏱️', title: 'Live deadline countdowns', text: 'Registration and team-formation timers tick in real time. Never miss a cutoff again.' },
  { icon: '💬', title: 'Team requests with context', text: 'Send requests with a personal note. Accept, decline or cancel — all tracked in one place.' },
  { icon: '📢', title: 'Host announcements', text: 'Organizers broadcast updates to every participant instantly, with in-app notifications.' },
  { icon: '📊', title: 'Host command center', text: 'Manage participants, teams and exports from a single dashboard. CSV export in one click.' },
  { icon: '🔒', title: 'Role-based access', text: 'Students and hosts each get their own universe — tailored dashboards, zero clutter.' },
]

export default function Landing() {
  const { isAuthed, isHost } = useAuth()

  return (
    <div>
      {/* ============ HERO ============ */}
      <section className="page-shell pt-20 md:pt-28 pb-16 text-center relative">
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
          <span className="chip border-purple-500/40 bg-purple-500/10 text-purple-600 dark:text-purple-300 font-mono !text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            v1.0 · now boarding hackers
          </span>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={1}
          className="mt-6 text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] text-slate-900 dark:text-white"
        >
          Find your team.
          <br />
          <span className="gradient-text drop-shadow-[0_0_30px_rgba(168,85,247,0.35)]">Win your hackathon.</span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={2}
          className="mt-6 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400"
        >
          HackMate pairs you with teammates who fill your skill gaps — scored, ranked and one tap away.
          Great ideas die without great teams. Yours won&rsquo;t.
        </motion.p>

        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3} className="mt-9 flex flex-wrap justify-center gap-3">
          {isAuthed ? (
            <Link to={isHost ? '/host' : '/hackathons'} className="btn-primary !px-8 !py-3.5 !text-base">
              {isHost ? 'Open host dashboard →' : 'Browse hackathons →'}
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn-primary !px-8 !py-3.5 !text-base">
                Get started — it&rsquo;s free
              </Link>
              <Link to="/login" className="btn-secondary !px-8 !py-3.5 !text-base">
                Log in
              </Link>
            </>
          )}
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={4}
          className="mt-10 inline-flex items-center gap-2 font-mono text-xs text-slate-400 dark:text-slate-500 glass-soft rounded-lg px-4 py-2.5"
        >
          <span className="text-purple-500 dark:text-purple-400">$</span>
          <span>hackmate match --skills react,python --min 70</span>
          <span className="text-cyan-500 dark:text-cyan-400">✓ 12 candidates found</span>
        </motion.div>

        {/* floating decorative chips */}
        <div className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden>
          <motion.span animate={{ y: [0, -12, 0] }} transition={{ duration: 6, repeat: Infinity }} className="chip absolute left-[8%] top-[22%] border-purple-500/40 bg-purple-500/10 text-purple-600 dark:text-purple-300 font-mono rotate-[-8deg]">
            React · Advanced
          </motion.span>
          <motion.span animate={{ y: [0, 12, 0] }} transition={{ duration: 7, repeat: Infinity }} className="chip absolute right-[7%] top-[30%] border-cyan-500/40 bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 font-mono rotate-[6deg]">
            match: 92%
          </motion.span>
          <motion.span animate={{ y: [0, -10, 0] }} transition={{ duration: 8, repeat: Infinity }} className="chip absolute left-[12%] bottom-[18%] border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-300 font-mono rotate-[4deg]">
            team_of_4 locked 🔒
          </motion.span>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="page-shell py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center mb-10">
          <p className="font-mono text-xs text-cyan-600 dark:text-cyan-400 uppercase tracking-[0.2em] mb-2">// protocol</p>
          <h2 className="section-title">How it works</h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">Four steps from solo hacker to podium finish.</p>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass card-hover rounded-2xl p-6 relative overflow-hidden"
            >
              <div className="absolute -top-3 -right-1 font-mono text-6xl font-bold text-purple-500/10 dark:text-purple-400/10 select-none">
                {s.n}
              </div>
              <div className="text-3xl mb-3">{s.icon}</div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">{s.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{s.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section className="page-shell py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center mb-10">
          <p className="font-mono text-xs text-purple-600 dark:text-purple-400 uppercase tracking-[0.2em] mb-2">// arsenal</p>
          <h2 className="section-title">Everything you need to win</h2>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: (i % 3) * 0.08 }}
              className="glass card-hover rounded-2xl p-6 group"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/30 flex items-center justify-center text-xl mb-4 group-hover:shadow-neon transition-shadow">
                {f.icon}
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-1.5">{f.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="page-shell py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-600/15 via-fuchsia-600/10 to-cyan-500/15 dark:from-purple-600/25 dark:via-fuchsia-600/15 dark:to-cyan-500/20 backdrop-blur-xl p-10 md:p-16 text-center"
        >
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-500/30 blur-[100px] rounded-full" aria-hidden />
          <h2 className="relative section-title !text-3xl md:!text-4xl">
            Your dream team is <span className="gradient-text">one match</span> away.
          </h2>
          <p className="relative mt-3 text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
            Join HackMate, register for a hackathon, and let the match engine assemble your winning squad.
          </p>
          <div className="relative mt-7 flex flex-wrap justify-center gap-3">
            <Link to="/register" className="btn-primary !px-8 !py-3.5 !text-base">Create free account</Link>
            {!isAuthed && (
              <Link to="/register" className="btn-secondary !px-8 !py-3.5 !text-base">I&rsquo;m a host</Link>
            )}
          </div>
        </motion.div>
      </section>
    </div>
  )
}
