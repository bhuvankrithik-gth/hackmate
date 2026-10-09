import { motion } from 'framer-motion'

const SECTIONS = [
  {
    title: 'What we collect',
    body: 'When you create an account we store your name, email address, and the profile details you provide (college, branch, year, skills, bio, and links). If you sign in with Google, we receive your name, email address, and Google account ID from Google to create and link your account. We also store the hackathons you join, teams you form, and requests you send — that is the core of the service.',
  },
  {
    title: 'How we use it',
    body: 'Your profile and skills are shown to other students so teams can find each other — that matchmaking is the point of HackMate. Hosts can see the participants of their own hackathons. We never sell your data, and we never share it with advertisers.',
  },
  {
    title: 'Google sign-in',
    body: 'If you use Sign in with Google, Google shares your name, email address, and profile picture with HackMate per your consent. We use these only to create and secure your account. You can revoke HackMate’s access at any time from your Google Account security settings.',
  },
  {
    title: 'Data security',
    body: 'Passwords are stored as one-way bcrypt hashes and are never kept in plain text. Authentication uses signed JWT tokens. Your data lives in a managed MongoDB Atlas database with encrypted connections.',
  },
  {
    title: 'Your control',
    body: 'You can edit your profile at any time from the Profile page. To delete your account and data, contact us and we will remove it.',
  },
  {
    title: 'Contact',
    body: 'Questions about this policy? Reach out through the HackMate repository or your hackathon host.',
  },
]

export default function Privacy() {
  return (
    <div className="page-shell py-14 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <p className="font-mono text-xs text-cyan-600 dark:text-cyan-400 mb-2">$ hackmate privacy</p>
        <h1 className="section-title">Privacy Policy</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Last updated: October 2026</p>
        <div className="mt-8 space-y-6">
          {SECTIONS.map((s) => (
            <section key={s.title} className="glass rounded-2xl p-6">
              <h2 className="font-bold text-lg mb-2">{s.title}</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{s.body}</p>
            </section>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
