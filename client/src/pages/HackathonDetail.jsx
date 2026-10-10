import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import api, { apiError } from '../api/axios.js'
import { formatDate, formatDateTime, timeAgo } from '../utils/format.js'
import CountdownTimer from '../components/CountdownTimer.jsx'
import { PageSpinner } from '../components/ProtectedRoute.jsx'
import EmptyState from '../components/EmptyState.jsx'

function InfoRow({ icon, label, value }) {
  return (
    <div className="glass-soft rounded-xl p-4">
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{icon} {label}</p>
      <p className="font-semibold text-slate-900 dark:text-white text-sm">{value}</p>
    </div>
  )
}

export default function HackathonDetail() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [announcements, setAnnouncements] = useState([])
  const [code, setCode] = useState('')
  const [codeBusy, setCodeBusy] = useState(false)
  const [codeTeam, setCodeTeam] = useState(null)
  const [codeError, setCodeError] = useState('')
  const [joinBusy, setJoinBusy] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/hackathons/${id}`)
      setData(data)
      try {
        const ann = await api.get(`/hackathons/${id}/announcements`)
        setAnnouncements(ann.data.announcements || [])
      } catch {
        setAnnouncements([])
      }
    } catch (err) {
      toast.error(apiError(err, 'Could not load hackathon.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const register = async () => {
    setRegistering(true)
    try {
      const { data: res } = await api.post(`/hackathons/${id}/register`)
      toast.success(res.message || 'Registered! 🎉')
      load()
    } catch (err) {
      toast.error(apiError(err, 'Registration failed.'))
    } finally {
      setRegistering(false)
    }
  }

  if (loading) return <PageSpinner />
  if (!data?.hackathon) {
    return (
      <div className="page-shell py-16">
        <EmptyState icon="🛰️" title="Hackathon not found" message="It may have been deleted." actionLabel="Back to hackathons" actionTo="/hackathons" />
      </div>
    )
  }

  const h = data.hackathon
  const open = h.status === 'open'
  const canRegister = !data.isRegistered && open

  const lookupCode = async () => {
    const trimmed = code.trim().toUpperCase()
    if (!trimmed) {
      setCodeError('Enter the invite code your friend shared.')
      return
    }
    setCodeBusy(true)
    setCodeError('')
    setCodeTeam(null)
    try {
      const { data: res } = await api.get(`/teams/by-code/${encodeURIComponent(trimmed)}`)
      if (String(res.team.hackathon._id) !== String(h._id)) {
        setCodeError('That team is competing in a different hackathon.')
        return
      }
      setCodeTeam(res.team)
    } catch (err) {
      setCodeError(apiError(err, 'Could not find that team.'))
    } finally {
      setCodeBusy(false)
    }
  }

  const requestJoin = async () => {
    if (!codeTeam) return
    setJoinBusy(true)
    try {
      await api.post('/requests/join', { teamId: codeTeam._id })
      toast.success(`Request sent to ${codeTeam.name} 🎉 — the owner will review it.`)
      setCodeTeam(null)
      setCode('')
    } catch (err) {
      toast.error(apiError(err, 'Could not send the request.'))
    } finally {
      setJoinBusy(false)
    }
  }

  return (
    <div className="page-shell py-10">
      <Link to="/hackathons" className="text-sm text-slate-500 dark:text-slate-400 hover:text-purple-500 dark:hover:text-purple-300 font-mono">
        ← /hackathons
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
        {/* banner */}
        <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10">
          {h.bannerUrl ? (
            <img src={h.bannerUrl} alt={h.title} className="w-full h-64 md:h-80 object-cover" />
          ) : (
            <div className="w-full h-64 md:h-80 bg-gradient-to-br from-purple-600/50 via-fuchsia-600/30 to-cyan-500/50 dark:from-purple-800/60 dark:via-fuchsia-800/40 dark:to-cyan-700/50 flex items-center justify-center">
              <span className="font-mono text-7xl font-bold text-white/30">&lt;/&gt;</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className={`chip font-mono ${open ? 'border-cyan-400/50 bg-cyan-500/20 text-cyan-200' : 'border-white/30 bg-white/10 text-white/80'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${open ? 'bg-cyan-300 animate-pulse' : 'bg-white/50'}`} />
                {open ? 'REGISTRATION OPEN' : 'CLOSED'}
              </span>
              <span className="chip border-white/30 bg-white/10 text-white font-mono">{h.mode === 'online' ? '🌐 ONLINE' : '📍 OFFLINE'}</span>
              {data.isRegistered && <span className="chip border-purple-400/50 bg-purple-600/40 text-white font-mono">✓ REGISTERED</span>}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">{h.title}</h1>
            <p className="mt-2 text-white/70 text-sm md:text-base max-w-2xl">{h.description}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mt-6">
          {/* main column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass rounded-2xl p-6">
              <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-4">📋 Event details</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <InfoRow icon="🚀" label="Hackathon starts" value={formatDateTime(h.startDate)} />
                <InfoRow icon="🏁" label="Hackathon ends" value={formatDateTime(h.endDate)} />
                <InfoRow icon="⏰" label="Registration deadline" value={formatDateTime(h.registrationDeadline)} />
                <InfoRow icon="🤝" label="Team formation deadline" value={formatDateTime(h.teamFormationDeadline)} />
                <InfoRow icon="👥" label="Participants" value={`${h.participantCount ?? 0} registered`} />
                <InfoRow icon="🧑‍🤝‍🧑" label="Teams" value={`${h.teamCount ?? 0} formed`} />
                <InfoRow icon="👤" label="Max team size" value={`${h.teamSizeLimit} members`} />
                <InfoRow icon="🏆" label="Prize" value={h.prize || 'Glory + swag'} />
                {h.mode === 'offline' && <InfoRow icon="📍" label="Venue" value={h.venue || 'TBA'} />}
              </div>

              {(h.requiredSkills || []).length > 0 && (
                <div className="mt-5">
                  <p className="label">Required skills</p>
                  <div className="flex flex-wrap gap-2">
                    {h.requiredSkills.map((s) => (
                      <span key={s} className="chip border-purple-500/40 bg-purple-500/10 text-purple-600 dark:text-purple-300 font-mono">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* announcements */}
            <div className="glass rounded-2xl p-6">
              <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-4">📢 Announcements</h2>
              {announcements.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">No announcements yet. The host will post updates here.</p>
              ) : (
                <div className="space-y-4">
                  {announcements.map((a) => (
                    <div key={a._id} className="glass-soft rounded-xl p-4 border-l-2 !border-l-purple-500">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{a.title}</h3>
                        <span className="text-[11px] font-mono text-slate-400 shrink-0">{timeAgo(a.createdAt)}</span>
                      </div>
                      <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{a.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* side column */}
          <div className="space-y-6">
            <div className="glass rounded-2xl p-6 lg:sticky lg:top-24">
              <CountdownTimer deadline={h.registrationDeadline} label="Registration closes in" />
              <div className="mt-5 space-y-2.5">
                {data.isRegistered ? (
                  <>
                    <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3.5 text-sm text-cyan-700 dark:text-cyan-300 font-medium">
                      ✅ You&rsquo;re in! Now assemble your squad.
                    </div>
                    {data.myTeam ? (
                      <Link to={`/teams/${data.myTeam}`} className="btn-primary w-full">
                        View my team →
                      </Link>
                    ) : (
                      <Link to={`/find-teammates?hackathonId=${h._id}`} className="btn-primary w-full">
                        Find teammates →
                      </Link>
                    )}
                  </>
                ) : canRegister ? (
                  <button onClick={register} disabled={registering} className="btn-primary w-full !py-3">
                    {registering ? 'Registering…' : 'Register now 🚀'}
                  </button>
                ) : (
                  <div className="rounded-xl border border-slate-300 dark:border-white/10 bg-slate-500/10 p-3.5 text-sm text-slate-500 dark:text-slate-400">
                    Registration is closed for this hackathon.
                  </div>
                )}
                <Link to={`/find-teammates?hackathonId=${h._id}`} className="btn-secondary w-full">
                  Browse candidates
                </Link>
              </div>
              <p className="mt-4 font-mono text-[11px] text-slate-400 dark:text-slate-500 text-center">
                {formatDate(h.startDate)} → {formatDate(h.endDate)}
              </p>
            </div>

            {data.isRegistered && !data.myTeam && (
              <div className="glass rounded-2xl p-6">
                <h2 className="font-bold text-slate-900 dark:text-white mb-1">🔑 Join a friend&rsquo;s team</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Got an invite code? Drop it here to find their team and request to join.
                </p>
                <div className="flex gap-2">
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => { if (e.key === 'Enter') lookupCode() }}
                    placeholder="e.g. XK7Q2P"
                    maxLength={12}
                    className="input font-mono uppercase tracking-widest text-center"
                  />
                  <button onClick={lookupCode} disabled={codeBusy} className="btn-secondary shrink-0">
                    {codeBusy ? '…' : 'Find'}
                  </button>
                </div>
                {codeError && <p className="mt-2.5 text-xs text-red-500">{codeError}</p>}
                {codeTeam && (
                  <div className="mt-4 glass-soft rounded-xl p-4">
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">{codeTeam.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      👑 {codeTeam.owner?.name} · 👥 {codeTeam.memberCount}/{codeTeam.teamSizeLimit} members
                      {codeTeam.isOpen === false && ' · 🔒 closed'}
                    </p>
                    {codeTeam.description && (
                      <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{codeTeam.description}</p>
                    )}
                    {codeTeam.isMember ? (
                      <p className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 font-medium">✅ You&rsquo;re already in this team.</p>
                    ) : codeTeam.myOtherTeam ? (
                      <p className="mt-3 text-xs text-amber-600 dark:text-amber-400 font-medium">
                        ⚠ You&rsquo;re already in “{codeTeam.myOtherTeam.name}” for this hackathon.
                      </p>
                    ) : (
                      <button onClick={requestJoin} disabled={joinBusy || codeTeam.isOpen === false} className="btn-primary btn-sm w-full mt-3">
                        {joinBusy ? 'Sending…' : 'Request to join →'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
