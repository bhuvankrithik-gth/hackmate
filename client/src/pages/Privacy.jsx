import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const SECTIONS = [
  {
    title: 'Information we collect',
    body: 'Account data: your name, email address, and password (stored only as a one-way bcrypt hash — we never see or store plain-text passwords). Profile data you provide: college, branch, year, skills, bio, GitHub/LinkedIn links, and for hosts, organization name. Service data: hackathons you register for, teams you create or join, team requests you send or receive, and announcements you read. If you sign in with Google, Google shares your name, verified email address, and Google account ID with us so we can create and link your account.',
  },
  {
    title: 'How we use your information',
    body: 'We use your data to operate HackMate: creating your account, showing your profile and skills to other students for team matchmaking (that is the core of the service), letting hosts see participants of their own hackathons, sending you notifications about requests and announcements, and keeping the Service secure. We never sell your personal data, and we never share it with advertisers.',
  },
  {
    title: 'Who can see your data',
    body: 'Your name, college, skills, and bio are visible to other logged-in students so teams can find each other. Hosts can see the profiles of participants registered in their hackathons. Team details are visible to team members and to students browsing teams. We do not publish your email address publicly; it is used for account and notification purposes.',
  },
  {
    title: 'Service providers',
    body: 'We use trusted infrastructure providers to run HackMate: Vercel (website hosting), MongoDB Atlas (database), and Google (sign-in, only if you choose it). These providers process data only to provide their services to us and are bound by their own security and privacy commitments.',
  },
  {
    title: 'Cookies and local storage',
    body: 'HackMate uses browser local storage to keep you logged in (your authentication token) and to remember small preferences like the cookie notice dismissal. We do not use third-party advertising or tracking cookies, and we do not sell browsing data.',
  },
  {
    title: 'Data security',
    body: 'Passwords are hashed with bcrypt (12 rounds) and never stored in plain text. Sessions use signed JWT tokens that expire after 7 days. All connections to our servers and database use encryption (HTTPS/TLS). No system is perfectly secure, but we follow industry-standard practices to protect your data.',
  },
  {
    title: 'Data retention',
    body: 'We keep your account data while your account is active. If you delete your account, we remove your personal data within a reasonable time, except where we must retain limited records for legal or security purposes.',
  },
  {
    title: 'Your rights and control',
    body: 'You can view and edit your profile at any time from the Profile page. You can revoke Google sign-in access from your Google Account security settings. To export or delete your account and data, contact us and we will help.',
  },
  {
    title: "Children's privacy",
    body: 'HackMate is intended for users aged 16 and above. We do not knowingly collect data from children under 16. If you believe a child has provided us data, contact us and we will delete it.',
  },
  {
    title: 'Changes to this policy',
    body: 'We may update this policy as HackMate evolves. Material changes will be announced on the site, and the "last updated" date below will always reflect the current version.',
  },
  {
    title: 'Contact',
    body: 'Questions about your privacy or this policy? Reach out through the HackMate GitHub repository or your hackathon host.',
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
        <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          Also see our{' '}
          <Link to="/terms" className="text-purple-500 dark:text-purple-300 font-semibold hover:underline">
            Terms of Service
          </Link>
          .
        </p>
      </motion.div>
    </div>
  )
}
