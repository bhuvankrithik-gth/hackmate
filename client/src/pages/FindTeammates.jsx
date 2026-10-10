import { useEffect, useState, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import api, { apiError, toQuery } from '../api/axios.js'
import { useAuth } from '../context/AuthContext.jsx'
import { skillNames } from '../utils/format.js'
import MatchRing from '../components/MatchRing.jsx'
import Modal from '../components/Modal.jsx'
import SkillPicker from '../components/SkillPicker.jsx'
import { ListSkeleton } from '../components/Skeleton.jsx'
import EmptyState from '../components/EmptyState.jsx'

function Avatar({ name, size = 'w-12 h-12 text-base' }) {
  return (
    <div className={`${size} rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-white font-bold shrink-0 shadow-neon`}>
      {(name || '?').charAt(0).toUpperCase()}
    </div>
  )
}

function JoinWithCodeCard({ hackathonId }) {
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [found, setFound] = useState(null)
  const [error, setError] = useState('')
  const [joinBusy, setJoinBusy] = useState(false)

  const lookup = async () => {
    const trimmed = code.trim().toUpperCase()
    if (!trimmed) {
      setError('Enter the invite code your friend shared.')
      return
    }
    setBusy(true)
    setError('')
    setFound(null)
    try {
      const { data } = await api.get(`/teams/by-code/${encodeURIComponent(trimmed)}`)
      if (String(data.team.hackathon._id) !== String(hackathonId)) {
        setError('That team is competing in a different hackathon.')
        return
      }
      setFound(data.team)
    } catch (err) {
      setError(apiError(err, 'Could not find that team.'))
    } finally {
      setBusy(false)
    }
  }

  const requestJoin = async () => {
    if (!found) return
    setJoinBusy(true)
    try {
      await api.post('/requests/join', { teamId: found._id })
      toast.success(`Request sent to ${found.name} 🎉 — the owner will review it. Check Requests for updates.`)
      setFound(null)
      setCode('')
    } catch (err) {
      toast.error(apiError(err, 'Could not send the request.'))
    } finally {
      setJoinBusy(false)
    }
  }

  return (
    <div className="glass rounded-2xl p-6 text-center border-dashed !border-cyan-500/40">
      <div className="text-3xl mb-2">🔑</div>
      <h3 className="font-bold text-slate-900 dark:text-white">Have a friend&rsquo;s invite code?</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4">
        Drop it here to find their team and request a spot.
      </p>
      <div className="flex gap-2 max-w-sm mx-auto">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => { if (e.key === 'Enter') lookup() }}
          placeholder="e.g. XK7Q2P"
          maxLength={12}
          className="input font-mono uppercase tracking-widest text-center"
        />
        <button onClick={lookup} disabled={busy} className="btn-secondary shrink-0">
          {busy ? '…' : 'Find'}
        </button>
      </div>
      {error && <p className="mt-2.5 text-xs text-red-500">{error}</p>}
      {found && (
        <div className="mt-4 glass-soft rounded-xl p-4 text-left max-w-sm mx-auto">
          <p className="font-semibold text-slate-900 dark:text-white text-sm">{found.name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            👑 {found.owner?.name} · 👥 {found.memberCount}/{found.teamSizeLimit} members
            {found.isOpen === false && ' · 🔒 closed'}
          </p>
          {found.isMember ? (
            <p className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 font-medium">✅ You&rsquo;re already in this team.</p>
          ) : found.myOtherTeam ? (
            <p className="mt-3 text-xs text-amber-600 dark:text-amber-400 font-medium">
              ⚠ You&rsquo;re already in “{found.myOtherTeam.name}” for this hackathon.
            </p>
          ) : (
            <button onClick={requestJoin} disabled={joinBusy || found.isOpen === false} className="btn-primary btn-sm w-full mt-3">
              {joinBusy ? 'Sending…' : 'Request to join →'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function CreateTeamCard({ hackathonId, onCreated }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', missingSkills: [] })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.name.trim()) errs.name = 'Team name is required.'
    if (form.missingSkills.length > 10) errs.missingSkills = 'Max 10 missing skills.'
    setErrors(errs)
    if (Object.keys(errs).length) return
    setSubmitting(true)
    try {
      const { data } = await api.post('/teams', {
        hackathonId,
        name: form.name.trim(),
        description: form.description.trim(),
        missingSkills: form.missingSkills.map((s) => ({ name: s.name })),
      })
      toast.success('Team created! Now find your people. 🎉')
      setOpen(false)
      setForm({ name: '', description: '', missingSkills: [] })
      onCreated(data.team)
    } catch (err) {
      toast.error(apiError(err, 'Could not create team.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="glass rounded-2xl p-6 text-center border-dashed !border-purple-500/40">
        <div className="text-3xl mb-2">🧑‍🚀</div>
        <h3 className="font-bold text-slate-900 dark:text-white">No team yet for this hackathon</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4">
          Create one, declare the skills you&rsquo;re missing, and let the match engine do the rest.
        </p>
        <button onClick={() => setOpen(true)} className="btn-primary">+ Create team</button>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Create your team" wide>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Team name *</label>
            <input className="input" placeholder="e.g. Null Pointers" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            {errors.name && <p className="error-text">{errors.name}</p>}
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={3} placeholder="What are you building? Who are you looking for?" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <SkillPicker
            label="Skills we're missing (max 10)"
            value={form.missingSkills}
            onChange={(v) => setForm({ ...form, missingSkills: v })}
            withLevel={false}
            error={errors.missingSkills}
          />
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Creating…' : 'Create team 🚀'}
          </button>
        </form>
      </Modal>
    </>
  )
}

function RequestModal({ candidate, teamId, onClose, onSent }) {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  const send = async () => {
    setSending(true)
    try {
      await api.post('/requests', { teamId, toUserId: candidate.user._id, message: message.trim() })
      toast.success(`Request sent to ${candidate.user.name.split(' ')[0]}! 🤝`)
      onSent()
      onClose()
    } catch (err) {
      toast.error(apiError(err, 'Could not send request.'))
    } finally {
      setSending(false)
    }
  }

  return (
    <Modal open={Boolean(candidate)} onClose={onClose} title={`Invite ${candidate?.user.name?.split(' ')[0] || ''} to your team`}>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
        Add a personal note — teams with a message get accepted way more often.
      </p>
      <textarea
        className="input resize-none"
        rows={4}
        maxLength={500}
        placeholder="Hey! We loved your React + ML combo. We're building an AI study buddy — want in?"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <div className="flex gap-2 mt-4">
        <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        <button onClick={send} disabled={sending} className="btn-primary flex-1">
          {sending ? 'Sending…' : 'Send request 🤝'}
        </button>
      </div>
    </Modal>
  )
}

export default function FindTeammates() {
  const { user } = useAuth()
  const [params, setParams] = useSearchParams()
  const [hackathons, setHackathons] = useState([])
  const [hackathonId, setHackathonId] = useState(params.get('hackathonId') || '')
  const [teams, setTeams] = useState([])
  const [teamId, setTeamId] = useState(params.get('teamId') || '')
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({ search: '', skill: '', college: '', sort: 'match' })
  const [requestTarget, setRequestTarget] = useState(null)
  const [sentIds, setSentIds] = useState(new Set())

  // Load hackathons the student is registered in.
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/hackathons')
        const mine = (data.hackathons || []).filter((h) => h.isRegistered)
        setHackathons(mine)
        if (!hackathonId && mine.length > 0) setHackathonId(mine[0]._id)
      } catch {
        /* ignore */
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Load my teams for the hackathon.
  const loadTeams = useCallback(async () => {
    if (!hackathonId) {
      setTeams([])
      return
    }
    try {
      const { data } = await api.get(`/teams/my?${toQuery({ hackathonId })}`)
      const list = data.teams || []
      setTeams(list)
      if (!teamId || !list.some((t) => t._id === teamId)) {
        setTeamId(list[0]?._id || '')
      }
    } catch (err) {
      toast.error(apiError(err, 'Could not load your teams.'))
    }
  }, [hackathonId])

  useEffect(() => {
    loadTeams()
  }, [loadTeams])

  // Load candidates.
  const loadCandidates = useCallback(async () => {
    if (!hackathonId || !teamId) {
      setCandidates([])
      return
    }
    setLoading(true)
    try {
      const { data } = await api.get(
        `/teams/search/candidates?${toQuery({ hackathonId, teamId, skill: filters.skill, search: filters.search, college: filters.college, sort: 'match' })}`
      )
      let list = data.candidates || []
      if (filters.sort === 'name') {
        list = [...list].sort((a, b) => a.user.name.localeCompare(b.user.name))
      }
      setCandidates(list)
    } catch (err) {
      toast.error(apiError(err, 'Could not load candidates.'))
    } finally {
      setLoading(false)
    }
  }, [hackathonId, teamId, filters.skill, filters.search, filters.college, filters.sort])

  useEffect(() => {
    const id = setTimeout(loadCandidates, 350)
    return () => clearTimeout(id)
  }, [loadCandidates])

  useEffect(() => {
    setParams(
      { ...(hackathonId ? { hackathonId } : {}), ...(teamId ? { teamId } : {}) },
      { replace: true }
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hackathonId, teamId])

  const team = teams.find((t) => t._id === teamId)
  const setF = (k, v) => setFilters((f) => ({ ...f, [k]: v }))

  return (
    <div className="page-shell py-10">
      <p className="font-mono text-xs text-cyan-600 dark:text-cyan-400 mb-1">$ hackmate find-teammates --sort match</p>
      <h1 className="section-title">Find teammates</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 mb-7">
        Scored against your team&rsquo;s skill gaps. Higher ring = better fit.
      </p>

      {/* selectors */}
      <div className="glass rounded-2xl p-4 mb-6 grid gap-3 md:grid-cols-2">
        <div>
          <label className="label">Hackathon</label>
          <select className="input" value={hackathonId} onChange={(e) => { setHackathonId(e.target.value); setTeamId('') }}>
            {hackathons.map((h) => (
              <option key={h._id} value={h._id} className="bg-white dark:bg-void-900">{h.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Your team</label>
          {teams.length > 0 ? (
            <select className="input" value={teamId} onChange={(e) => setTeamId(e.target.value)}>
              {teams.map((t) => (
                <option key={t._id} value={t._id} className="bg-white dark:bg-void-900">
                  {t.name}{t.isOpen === false ? ' (closed)' : ''}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400 py-2.5">Create a team below to start matching.</p>
          )}
        </div>
      </div>

      {!teamId && hackathonId && (
        <div className="mb-6 grid gap-6 md:grid-cols-2">
          <CreateTeamCard hackathonId={hackathonId} onCreated={(t) => { setTeams((ts) => [...ts, t]); setTeamId(t._id) }} />
          <JoinWithCodeCard hackathonId={hackathonId} />
        </div>
      )}

      {team && (
        <div className="glass-soft rounded-2xl p-4 mb-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <span className="font-bold text-slate-900 dark:text-white">🎯 {team.name}</span>
          {team.isOpen === false && <span className="chip border-red-500/40 bg-red-500/10 text-red-500">closed</span>}
          <span className="text-slate-500 dark:text-slate-400">
            Missing skills:{' '}
            {(team.missingSkills || []).length > 0 ? (
              (team.missingSkills || []).map((s) => (
                <span key={s.name || s} className="chip border-orange-500/40 bg-orange-500/10 text-orange-600 dark:text-orange-300 ml-1">
                  {s.name || s}
                </span>
              ))
            ) : (
              <span className="text-slate-400 italic">none — match scores will be 0%</span>
            )}
          </span>
          <Link to={`/teams/${team._id}`} className="ml-auto text-purple-500 dark:text-purple-300 font-semibold text-sm hover:underline">
            Manage team →
          </Link>
        </div>
      )}

      {teamId && (
        <>
          {/* candidate filters */}
          <div className="grid gap-3 md:grid-cols-4 mb-6">
            <input className="input" placeholder="🔍 Name…" value={filters.search} onChange={(e) => setF('search', e.target.value)} />
            <input className="input" placeholder="Skill (e.g. Python)" value={filters.skill} onChange={(e) => setF('skill', e.target.value)} />
            <input className="input" placeholder="College" value={filters.college} onChange={(e) => setF('college', e.target.value)} />
            <select className="input" value={filters.sort} onChange={(e) => setF('sort', e.target.value)}>
              <option value="match" className="bg-white dark:bg-void-900">Sort: best match</option>
              <option value="name" className="bg-white dark:bg-void-900">Sort: name A–Z</option>
            </select>
          </div>

          {loading ? (
            <ListSkeleton rows={4} />
          ) : candidates.length === 0 ? (
            <EmptyState
              icon="🔭"
              title="No candidates found"
              message="Everyone registered is either on your team already or filtered out. Try widening the filters."
            />
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              <AnimatePresence>
                {candidates.map((c, i) => {
                  const u = c.user || {}
                  const sent = sentIds.has(u._id)
                  return (
                    <motion.div
                      key={u._id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.3) }}
                      className="glass card-hover rounded-2xl p-5 flex gap-4"
                    >
                      <MatchRing percent={c.matchPercent} size={84} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3">
                          <Avatar name={u.name} />
                          <div className="min-w-0">
                            <h3 className="font-bold text-slate-900 dark:text-white truncate">{u.name}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                              {u.college}{u.branch ? ` · ${u.branch}` : ''}{u.year ? ` · ${u.year}` : ''}
                            </p>
                          </div>
                        </div>

                        {(c.matchedSkills || []).length > 0 && (
                          <div className="mt-3">
                            <p className="text-[10px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-semibold mb-1">✓ fills your gaps</p>
                            <div className="flex flex-wrap gap-1.5">
                              {c.matchedSkills.map((s) => (
                                <span key={s} className="chip border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">{s}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {(c.missingSkills || []).length > 0 && (
                          <div className="mt-2">
                            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-1">still missing</p>
                            <div className="flex flex-wrap gap-1.5">
                              {c.missingSkills.map((s) => (
                                <span key={s} className="chip border-slate-300 dark:border-white/10 text-slate-500 dark:text-slate-400">{s}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {skillNames(u.skills).slice(0, 5).map((s) => (
                            <span key={s} className="chip border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-300 !text-[10px]">{s}</span>
                          ))}
                        </div>

                        <div className="mt-3 flex gap-2">
                          {u.github && (
                            <a href={u.github.startsWith('http') ? u.github : `https://${u.github}`} target="_blank" rel="noreferrer" className="btn-secondary btn-sm font-mono">GitHub</a>
                          )}
                          <button
                            onClick={() => setRequestTarget(c)}
                            disabled={sent || team?.isOpen === false}
                            className="btn-primary btn-sm ml-auto"
                          >
                            {sent ? '✓ Request sent' : 'Send request 🤝'}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </>
      )}

      <RequestModal
        candidate={requestTarget}
        teamId={teamId}
        onClose={() => setRequestTarget(null)}
        onSent={() => requestTarget && setSentIds((s) => new Set(s).add(requestTarget.user._id))}
      />
    </div>
  )
}
