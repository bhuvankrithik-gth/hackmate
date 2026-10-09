import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext.jsx'
import { apiError } from '../api/axios.js'
import { isValidEmail } from '../utils/format.js'
import { YEAR_OPTIONS } from '../utils/years.js'
import SkillPicker from '../components/SkillPicker.jsx'

const studentInit = {
  name: '', email: '', password: '', college: '', branch: '', year: '',
  skills: [], github: '', linkedin: '', bio: '',
}
const hostInit = { name: '', organization: '', email: '', password: '' }

export default function Register() {
  const navigate = useNavigate()
  const { registerStudent, registerHost } = useAuth()
  const [role, setRole] = useState('student')
  const [form, setForm] = useState(studentInit)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const switchRole = (r) => {
    setRole(r)
    setForm(r === 'student' ? studentInit : hostInit)
    setErrors({})
  }

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }))
    setErrors((e) => ({ ...e, [k]: undefined }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required.'
    if (!isValidEmail(form.email)) e.email = 'Enter a valid email address.'
    if (!form.password || form.password.length < 6) e.password = 'Password must be at least 6 characters.'
    if (role === 'student') {
      if (!form.college.trim()) e.college = 'College is required.'
      if (!form.branch.trim()) e.branch = 'Branch is required.'
      if (!form.year) e.year = 'Select your year.'
      if ((form.skills || []).length === 0) e.skills = 'Add at least one skill — it powers your match score.'
    } else {
      if (!form.organization.trim()) e.organization = 'Organization is required.'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async (ev) => {
    ev.preventDefault()
    if (!validate()) {
      toast.error('Please fix the highlighted fields.')
      return
    }
    setSubmitting(true)
    try {
      let user
      if (role === 'student') {
        user = await registerStudent({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          college: form.college.trim(),
          branch: form.branch.trim(),
          year: Number(form.year),
          skills: form.skills,
          github: form.github.trim(),
          linkedin: form.linkedin.trim(),
          bio: form.bio.trim(),
        })
      } else {
        user = await registerHost({
          name: form.name.trim(),
          organization: form.organization.trim(),
          email: form.email.trim(),
          password: form.password,
        })
      }
      toast.success(`Welcome aboard, ${user.name.split(' ')[0]}! 🎉`)
      navigate(user.role === 'host' ? '/host' : '/hackathons', { replace: true })
    } catch (err) {
      toast.error(apiError(err, 'Registration failed.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page-shell py-12 flex justify-center">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-2xl">
        <div className="text-center mb-7">
          <p className="font-mono text-xs text-cyan-600 dark:text-cyan-400 mb-2">$ hackmate init --new-user</p>
          <h1 className="section-title">Join the arena</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-500 dark:text-purple-300 font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </div>

        {/* role toggle */}
        <div className="glass rounded-2xl p-1.5 grid grid-cols-2 gap-1.5 mb-6">
          {[
            { id: 'student', icon: '🧑‍💻', title: "I'm a hacker", sub: 'Compete & find teams' },
            { id: 'host', icon: '🏛️', title: "I'm a host", sub: 'Run hackathons' },
          ].map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => switchRole(r.id)}
              className={`relative rounded-xl px-4 py-3.5 text-left transition-all cursor-pointer ${
                role === r.id
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-neon'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-900/5 dark:hover:bg-white/5'
              }`}
            >
              <span className="text-xl">{r.icon}</span>
              <span className="block font-bold text-sm mt-1">{r.title}</span>
              <span className={`block text-xs ${role === r.id ? 'text-white/80' : 'text-slate-400'}`}>{r.sub}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.form
            key={role}
            initial={{ opacity: 0, x: role === 'student' ? -18 : 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: role === 'student' ? 18 : -18 }}
            transition={{ duration: 0.25 }}
            onSubmit={submit}
            className="glass rounded-2xl p-7 space-y-5"
            noValidate
          >
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="label" htmlFor="name">Full name *</label>
                <input id="name" className="input" placeholder="Ada Lovelace" value={form.name} onChange={(e) => set('name', e.target.value)} />
                {errors.name && <p className="error-text">{errors.name}</p>}
              </div>
              <div>
                <label className="label" htmlFor="email">Email *</label>
                <input id="email" type="email" className="input" placeholder="ada@college.edu" value={form.email} onChange={(e) => set('email', e.target.value)} />
                {errors.email && <p className="error-text">{errors.email}</p>}
              </div>
              <div>
                <label className="label" htmlFor="password">Password *</label>
                <input id="password" type="password" className="input" placeholder="Min. 6 characters" value={form.password} onChange={(e) => set('password', e.target.value)} />
                {errors.password && <p className="error-text">{errors.password}</p>}
              </div>

              {role === 'student' ? (
                <>
                  <div>
                    <label className="label" htmlFor="college">College *</label>
                    <input id="college" className="input" placeholder="IIT Bombay" value={form.college} onChange={(e) => set('college', e.target.value)} />
                    {errors.college && <p className="error-text">{errors.college}</p>}
                  </div>
                  <div>
                    <label className="label" htmlFor="branch">Branch *</label>
                    <input id="branch" className="input" placeholder="Computer Science" value={form.branch} onChange={(e) => set('branch', e.target.value)} />
                    {errors.branch && <p className="error-text">{errors.branch}</p>}
                  </div>
                  <div>
                    <label className="label" htmlFor="year">Year *</label>
                    <select id="year" className="input" value={form.year} onChange={(e) => set('year', e.target.value)}>
                      <option value="" className="bg-white dark:bg-void-900">Select year</option>
                      {YEAR_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value} className="bg-white dark:bg-void-900">{o.label}</option>
                      ))}
                    </select>
                    {errors.year && <p className="error-text">{errors.year}</p>}
                  </div>
                  <div>
                    <label className="label" htmlFor="github">GitHub</label>
                    <input id="github" className="input font-mono" placeholder="github.com/username" value={form.github} onChange={(e) => set('github', e.target.value)} />
                  </div>
                  <div>
                    <label className="label" htmlFor="linkedin">LinkedIn</label>
                    <input id="linkedin" className="input font-mono" placeholder="linkedin.com/in/username" value={form.linkedin} onChange={(e) => set('linkedin', e.target.value)} />
                  </div>
                  <div className="sm:col-span-2">
                    <SkillPicker value={form.skills} onChange={(v) => set('skills', v)} error={errors.skills} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label" htmlFor="bio">Bio</label>
                    <textarea
                      id="bio"
                      rows={3}
                      className="input resize-none"
                      placeholder="Hackathon veteran. Ships at 3am. Loves weird APIs."
                      value={form.bio}
                      onChange={(e) => set('bio', e.target.value)}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="label" htmlFor="organization">Organization *</label>
                    <input id="organization" className="input" placeholder="MLH / Your club" value={form.organization} onChange={(e) => set('organization', e.target.value)} />
                    {errors.organization && <p className="error-text">{errors.organization}</p>}
                  </div>
                  <div className="sm:col-span-2 glass-soft rounded-xl p-4 text-sm text-slate-500 dark:text-slate-400">
                    🛠️ As a host you can <span className="text-slate-700 dark:text-slate-200 font-medium">create hackathons</span>, manage participants & teams, publish announcements and export registrations as CSV.
                  </div>
                </>
              )}
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full !py-3">
              {submitting ? 'Creating account…' : `Create ${role} account →`}
            </button>
          </motion.form>
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
