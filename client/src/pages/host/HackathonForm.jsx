import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import api, { apiError } from '../../api/axios.js'
import { toLocalInput, fromLocalInput } from '../../utils/format.js'
import { PageSpinner } from '../../components/ProtectedRoute.jsx'

const emptyForm = {
  title: '', description: '', bannerUrl: '',
  startDate: '', endDate: '', registrationDeadline: '', teamFormationDeadline: '',
  mode: 'online', venue: '', prize: '', teamSizeLimit: 4, requiredSkills: [],
}

export default function HackathonForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [skillInput, setSkillInput] = useState('')

  useEffect(() => {
    if (!isEdit) return
    (async () => {
      try {
        const { data } = await api.get(`/hackathons/${id}`)
        const h = data.hackathon
        setForm({
          title: h.title || '',
          description: h.description || '',
          bannerUrl: h.bannerUrl || '',
          startDate: toLocalInput(h.startDate),
          endDate: toLocalInput(h.endDate),
          registrationDeadline: toLocalInput(h.registrationDeadline),
          teamFormationDeadline: toLocalInput(h.teamFormationDeadline),
          mode: h.mode || 'online',
          venue: h.venue || '',
          prize: h.prize || '',
          teamSizeLimit: h.teamSizeLimit || 4,
          requiredSkills: h.requiredSkills || [],
        })
      } catch (err) {
        toast.error(apiError(err, 'Could not load hackathon.'))
        navigate('/host')
      } finally {
        setLoading(false)
      }
    })()
  }, [id, isEdit, navigate])

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }))
    setErrors((e) => ({ ...e, [k]: undefined }))
  }

  const addSkill = () => {
    const s = skillInput.trim()
    if (!s) return
    if (form.requiredSkills.some((x) => x.toLowerCase() === s.toLowerCase())) {
      setSkillInput('')
      return
    }
    setForm((f) => ({ ...f, requiredSkills: [...f.requiredSkills, s] }))
    setSkillInput('')
  }

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Title is required.'
    if (!form.description.trim()) e.description = 'Description is required.'
    if (!form.startDate) e.startDate = 'Start date is required.'
    if (!form.endDate) e.endDate = 'End date is required.'
    if (form.startDate && form.endDate && new Date(form.endDate) <= new Date(form.startDate)) {
      e.endDate = 'End date must be after start date.'
    }
    if (!form.registrationDeadline) e.registrationDeadline = 'Registration deadline is required.'
    if (!form.teamFormationDeadline) e.teamFormationDeadline = 'Team formation deadline is required.'
    if (form.mode === 'offline' && !form.venue.trim()) e.venue = 'Venue is required for offline events.'
    if (!form.teamSizeLimit || Number(form.teamSizeLimit) < 2) e.teamSizeLimit = 'Team size must be at least 2.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async (ev) => {
    ev.preventDefault()
    if (!validate()) {
      toast.error('Please fix the highlighted fields.')
      return
    }
    setSaving(true)
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        bannerUrl: form.bannerUrl.trim() || undefined,
        startDate: fromLocalInput(form.startDate),
        endDate: fromLocalInput(form.endDate),
        registrationDeadline: fromLocalInput(form.registrationDeadline),
        teamFormationDeadline: fromLocalInput(form.teamFormationDeadline),
        mode: form.mode,
        venue: form.venue.trim(),
        prize: form.prize.trim(),
        teamSizeLimit: Number(form.teamSizeLimit),
        requiredSkills: form.requiredSkills,
      }
      if (isEdit) {
        await api.put(`/hackathons/${id}`, payload)
        toast.success('Hackathon updated ✨')
        navigate(`/host/hackathons/${id}`)
      } else {
        const { data } = await api.post('/hackathons', payload)
        const newId = data.hackathon?._id || data._id
        toast.success('Hackathon launched! 🚀')
        navigate(newId ? `/host/hackathons/${newId}` : '/host')
      }
    } catch (err) {
      toast.error(apiError(err, 'Could not save hackathon.'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <PageSpinner />

  const field = (key, label, node, hint) => (
    <div>
      <label className="label" htmlFor={key}>{label}</label>
      {node}
      {errors[key] && <p className="error-text">{errors[key]}</p>}
      {hint && !errors[key] && <p className="text-[11px] text-slate-400 mt-1">{hint}</p>}
    </div>
  )

  return (
    <div className="page-shell py-10 max-w-3xl">
      <Link to="/host" className="text-sm text-slate-500 dark:text-slate-400 hover:text-purple-500 dark:hover:text-purple-300 font-mono">
        ← /host
      </Link>
      <div className="mt-2 mb-7">
        <p className="font-mono text-xs text-cyan-600 dark:text-cyan-400 mb-1">
          $ hackmate hackathon {isEdit ? 'update' : 'create'}
        </p>
        <h1 className="section-title">{isEdit ? 'Edit hackathon' : 'Launch a hackathon'}</h1>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={submit}
        className="glass rounded-2xl p-7 space-y-5"
        noValidate
      >
        {field('title', 'Title *', (
          <input id="title" className="input" placeholder="HackNight 2026" value={form.title} onChange={(e) => set('title', e.target.value)} />
        ))}
        {field('description', 'Description *', (
          <textarea id="description" rows={4} className="input resize-none" placeholder="36 hours. Unlimited caffeine. Build the future." value={form.description} onChange={(e) => set('description', e.target.value)} />
        ))}
        {field('bannerUrl', 'Banner image URL', (
          <input id="bannerUrl" className="input font-mono" placeholder="https://…" value={form.bannerUrl} onChange={(e) => set('bannerUrl', e.target.value)} />
        ), 'Optional — a gradient cover is generated automatically.')}

        <div className="grid sm:grid-cols-2 gap-5">
          {field('startDate', 'Starts *', (
            <input id="startDate" type="datetime-local" className="input" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} />
          ))}
          {field('endDate', 'Ends *', (
            <input id="endDate" type="datetime-local" className="input" value={form.endDate} onChange={(e) => set('endDate', e.target.value)} />
          ))}
          {field('registrationDeadline', 'Registration deadline *', (
            <input id="registrationDeadline" type="datetime-local" className="input" value={form.registrationDeadline} onChange={(e) => set('registrationDeadline', e.target.value)} />
          ))}
          {field('teamFormationDeadline', 'Team formation deadline *', (
            <input id="teamFormationDeadline" type="datetime-local" className="input" value={form.teamFormationDeadline} onChange={(e) => set('teamFormationDeadline', e.target.value)} />
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {field('mode', 'Mode', (
            <div className="grid grid-cols-2 gap-2">
              {['online', 'offline'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => set('mode', m)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold capitalize transition-all cursor-pointer ${
                    form.mode === m
                      ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-neon'
                      : 'glass-soft text-slate-500 dark:text-slate-400 hover:border-purple-500/40'
                  }`}
                >
                  {m === 'online' ? '🌐 Online' : '📍 Offline'}
                </button>
              ))}
            </div>
          ))}
          {field('teamSizeLimit', 'Max team size *', (
            <input id="teamSizeLimit" type="number" min={2} max={10} className="input" value={form.teamSizeLimit} onChange={(e) => set('teamSizeLimit', e.target.value)} />
          ))}
        </div>

        {form.mode === 'offline' && field('venue', 'Venue *', (
          <input id="venue" className="input" placeholder="Convention Center, Hall B" value={form.venue} onChange={(e) => set('venue', e.target.value)} />
        ))}

        {field('prize', 'Prize', (
          <input id="prize" className="input" placeholder="₹1,00,000 + internship interviews" value={form.prize} onChange={(e) => set('prize', e.target.value)} />
        ))}

        <div>
          <span className="label">Required skills</span>
          <div className="flex flex-wrap gap-2 mb-2.5">
            {form.requiredSkills.map((s) => (
              <span key={s} className="chip border-purple-500/40 bg-purple-500/10 text-purple-600 dark:text-purple-300 font-mono">
                {s}
                <button type="button" onClick={() => setForm((f) => ({ ...f, requiredSkills: f.requiredSkills.filter((x) => x !== s) }))} className="ml-1 hover:text-red-500">✕</button>
              </span>
            ))}
            {form.requiredSkills.length === 0 && <span className="text-xs text-slate-400 italic py-1">None yet</span>}
          </div>
          <div className="flex gap-2">
            <input
              className="input flex-1"
              placeholder="Type a skill and press Enter"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }}
            />
            <button type="button" onClick={addSkill} className="btn-secondary shrink-0">Add</button>
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full !py-3">
          {saving ? 'Saving…' : isEdit ? 'Save changes ✨' : 'Launch hackathon 🚀'}
        </button>
      </motion.form>
    </div>
  )
}
