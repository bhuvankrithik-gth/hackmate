import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function NotFound() {
  return (
    <div className="page-shell py-24 text-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="font-mono text-7xl md:text-8xl font-bold gradient-text">404</p>
        <h1 className="mt-4 section-title">Lost in the void</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          This route doesn&rsquo;t exist — like a hackathon project with no README.
        </p>
        <Link to="/" className="btn-primary mt-6">
          ← Back to base
        </Link>
      </motion.div>
    </div>
  )
}
