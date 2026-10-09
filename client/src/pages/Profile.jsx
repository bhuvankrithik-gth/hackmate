import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import api, { apiError } from '../api/axios.js'
import { useAuth } from '../context/AuthContext.jsx'
import { isValidEmail } from '../utils/format.js'
import SkillPicker from '../components/SkillPicker.jsx'
import { PageSpinner } from '../components/ProtectedRoute.jsx'

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate']

export default function Profile() {
  const { user, refreshMe } = useAuth()
  const [form, setForm] = useState(null)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/users/me')
        const u = data.user
        setForm({
          name: u.name || '',
          email: u.email || '',
          college: u.college || '',
          branch: u.branch || '',
          year: u.year || '',
          skills: u.skills || [],
          github: u.github || '',
          linkedin: u.linkedin || '',
          bio: u.bio || '',
          organization: u.organization || '',
        })
      } catch (err) {
        toast.error(apiError(err, 'Could not load profile.'))
      }
    })()
  }, [])

  if (!form) return <PageSpinner />

  const isHost = user?.role === 'host'
  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }))
    setErrors((e) => ({ ...e, [k]: undefined }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required.'
    if (!isValidEmail(form.email)) e.email = 'Enter a valid email address.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const save = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      const payload = isHost
        ? { name: form.name.trim(), organization: form.organization.trim() }
        : {
            name: form.name.trim(),
            college: form.college.trim(),
            branch: form.branch.trim(),
            year: form.year,
            skills: form.skills,
            github: form.github.trim(),
            linkedin: form.linkedin.trim(),
            bio: form.bio.trim(),
          }
      await api.put('/users/me', payload)
      await refreshMe()
      toast.success('Profile updated ✨')
    } catch (err) {
      toast.error(apiError(err, 'Could not save profile.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-shell py-10 max-w-3xl">
      <p className="font-mono text-xs text-cyan-600 dark:text-cyan-400 mb-1">$ hackmate whoami --edit</p>
      <h1 className="section-title">Your profile</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 mb-7">Keep it fresh — this is what teammates see.</p>

      <motion.form
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={save}
        className="glass rounded-2xl p-7 space-y-5"
        noValidate
      >
        <div className="flex items-center gap-4 pb-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold shadow-neon">
            {(form.name || '?').charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-lg text-slate-900 dark:text-white">{form.name || '—'}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-mono">{form.email}</p>
            <span className="chip mt-1 border-purple-500/40 bg-purple-500/10 text-purple-600 dark:text-purple-300 capitalize">{user?.role}</span>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="label">Full name *</label>
            <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} />
            {errors.name && <p className="error-text">{errors.name}</p>}
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" value={form.email} disabled title="Email can't be changed" />
          </div>

          {isHost ? (
            <div>
              <label className="label">Organization</label>
              <input className="input" value={form.organization} onChange={(e) => set('organization', e.target.value)} />
            </div>
          ) : (
            <>
              <div>
                <label className="label">College</label>
                <input className="input" value={form.college} onChange={(e) => set('college', e.target.value)} />
              </div>
              <div>
                <label className="label">Branch</label>
                <input className="input" value={form.branch} onChange={(e) => set('branch', e.target.value)} />
              </div>
              <div>
                <label className="label">Year</label>
                <select className="input" value={form.year} onChange={(e) => set('year', e.target.value)}>
                  <option value="" className="bg-white dark:bg-void-900">Select year</option>
                  {YEARS.map((y) => (
                    <option key={y} value={y} className="bg-white dark:bg-void-900">{y}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">GitHub</label>
                <input className="input font-mono" value={form.github} onChange={(e) => set('github', e.target.value)} placeholder="github.com/username" />
              </div>
              <div>
                <label className="label">LinkedIn</label>
                <input className="input font-mono" value={form.linkedin} onChange={(e) => set('linkedin', e.target.value)} placeholder="linkedin.com/in/username" />
              </div>
              <div className="sm:col-span-2">
                <SkillPicker label="Skills" value={form.skills} onChange={(v) => set('skills', v)} />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Bio</label>
                <textarea className="input resize-none" rows={3} value={form.bio} onChange={(e) => set('bio', e.target.value)} />
              </div>
            </>
          )}
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full !py-3">
          {saving ? 'Saving…' : 'Save profile ✨'}
        </button>
      </motion.form>
    </div>
  )
}
