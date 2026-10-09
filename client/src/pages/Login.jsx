import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext.jsx'
import { apiError } from '../api/axios.js'
import { isValidEmail } from '../utils/format.js'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }))
    setErrors((e) => ({ ...e, [k]: undefined }))
  }

  const validate = () => {
    const e = {}
    if (!isValidEmail(form.email)) e.email = 'Enter a valid email address.'
    if (!form.password) e.password = 'Password is required.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      const user = await login(form.email.trim(), form.password)
      toast.success(`Welcome back, ${user.name.split(' ')[0]}! 🚀`)
      const from = location.state?.from
      if (from && from !== '/login' && from !== '/register') navigate(from, { replace: true })
      else navigate(user.role === 'host' ? '/host' : '/hackathons', { replace: true })
    } catch (err) {
      toast.error(apiError(err, 'Login failed. Check your credentials.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page-shell py-14 flex justify-center">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-7">
          <p className="font-mono text-xs text-cyan-600 dark:text-cyan-400 mb-2">$ hackmate login</p>
          <h1 className="section-title">Welcome back, hacker</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Don&rsquo;t have an account?{' '}
            <Link to="/register" className="text-purple-500 dark:text-purple-300 font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>

        <form onSubmit={submit} className="glass rounded-2xl p-7 space-y-4" noValidate>
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="input"
              placeholder="you@college.edu"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
            />
            {errors.email && <p className="error-text">{errors.email}</p>}
          </div>

          <div>
            <label className="label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="input"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
            />
            {errors.password && <p className="error-text">{errors.password}</p>}
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full !py-3">
            {submitting ? 'Logging in…' : 'Log in →'}
          </button>

          <p className="text-center font-mono text-[11px] text-slate-400 dark:text-slate-500 pt-1">
            demo: student1@hackmate.demo / hackmate123
          </p>
        </form>
      </motion.div>
    </div>
  )
}
