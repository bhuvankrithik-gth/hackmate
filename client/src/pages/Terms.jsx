import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const SECTIONS = [
  {
    title: '1. What HackMate is',
    body: 'HackMate ("the Service") is a platform that helps students discover hackathons and form teams. Students can create profiles, register for hackathons, create or join teams, and communicate through team requests and notifications. Hosts (organizers) can create hackathons, manage participants and teams, publish announcements, and export registration data.',
  },
  {
    title: '2. Accepting these terms',
    body: 'By creating an account or using HackMate, you agree to these Terms of Service and to our Privacy Policy. If you do not agree, do not use the Service. We record the date and time you accept these terms when you sign up. If you are signing up on behalf of an organization (as a host), you confirm you are authorized to do so.',
  },
  {
    title: '3. Eligibility',
    body: 'You must be at least 16 years old to use HackMate. If you are under 18, you confirm you have permission from a parent or guardian. You may only maintain one account, and you must provide accurate information when registering.',
  },
  {
    title: '4. Your account and security',
    body: 'You are responsible for keeping your login credentials confidential and for all activity under your account. If you sign in with Google, you are also bound by Google\'s terms. Notify us promptly if you suspect unauthorized access. We may suspend or terminate accounts that violate these terms.',
  },
  {
    title: '5. Acceptable use',
    body: 'You agree not to: (a) harass, threaten, or harm other users; (b) post content that is unlawful, defamatory, obscene, or infringing; (c) impersonate any person or organization; (d) spam users with unwanted requests or messages; (e) scrape, crawl, or automatically harvest data from the Service; (f) attempt to breach, probe, or disrupt our systems; (g) use the Service for any unlawful purpose, including cheating or plagiarism in hackathons.',
  },
  {
    title: '6. Your content',
    body: 'You retain ownership of the content you post (team names, descriptions, profiles, messages). By posting, you grant HackMate a worldwide, non-exclusive, royalty-free license to display and distribute that content as part of operating the Service. You are solely responsible for your content and confirm you have the rights to share it.',
  },
  {
    title: '7. Hackathons run by hosts',
    body: 'Hackathons listed on HackMate are organized by independent hosts, not by HackMate. We do not control event schedules, judging, prizes, or rules. Any dispute about a specific hackathon — including prizes or disqualification — is between you and the host. HackMate is not a party to those disputes.',
  },
  {
    title: '8. Intellectual property',
    body: 'The HackMate name, logo, design, and software are our intellectual property. You may not copy, modify, or reverse-engineer the Service except as permitted by law. Nothing in these terms transfers any of our IP rights to you.',
  },
  {
    title: '9. Termination',
    body: 'You may delete your account at any time by contacting us, and we will remove your data as described in the Privacy Policy. We may suspend or terminate your access if you violate these terms, abuse the Service, or if required by law. Sections that should reasonably survive (liability limits, IP, governing law) survive termination.',
  },
  {
    title: '10. Disclaimers',
    body: 'The Service is provided "as is" and "as available", without warranties of any kind, express or implied — including warranties of merchantability, fitness for a particular purpose, and non-infringement. We do not guarantee the Service will be uninterrupted, error-free, or secure, or that any team you join will win anything.',
  },
  {
    title: '11. Limitation of liability',
    body: 'To the maximum extent permitted by law, HackMate and its operators will not be liable for any indirect, incidental, special, consequential, or punitive damages, or for loss of profits, data, or goodwill, arising from your use of the Service — even if advised of the possibility. Our total liability for any claim will not exceed the amount you paid us in the 12 months before the claim (which, for a free service, is zero).',
  },
  {
    title: '12. Indemnification',
    body: 'You agree to indemnify and hold harmless HackMate and its operators from claims, damages, and expenses (including reasonable legal fees) arising from your content, your use of the Service, or your violation of these terms.',
  },
  {
    title: '13. Changes to these terms',
    body: 'We may update these terms from time to time. Material changes will be announced on the site, and continued use after the changes take effect counts as acceptance. The "last updated" date below always shows the current version.',
  },
  {
    title: '14. Governing law',
    body: 'These terms are governed by the laws of India, without regard to conflict-of-law principles. Disputes will be subject to the exclusive jurisdiction of the courts at the operator\'s principal place of business in India.',
  },
  {
    title: '15. Contact',
    body: 'Questions about these terms? Contact us through the HackMate GitHub repository or your hackathon host, and we will respond.',
  },
]

export default function Terms() {
  return (
    <div className="page-shell py-14 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <p className="font-mono text-xs text-cyan-600 dark:text-cyan-400 mb-2">$ hackmate terms</p>
        <h1 className="section-title">Terms of Service</h1>
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
          <Link to="/privacy" className="text-purple-500 dark:text-purple-300 font-semibold hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </motion.div>
    </div>
  )
}
