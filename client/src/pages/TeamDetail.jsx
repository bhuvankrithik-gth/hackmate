import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import api, { apiError } from '../api/axios.js'
import { useAuth } from '../context/AuthContext.jsx'
import { skillNames, formatDateTime } from '../utils/format.js'
import { PageSpinner } from '../components/ProtectedRoute.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Modal from '../components/Modal.jsx'
import SkillPicker from '../components/SkillPicker.jsx'

function MemberCard({ m, isOwner, isMe }) {
  return (
    <div className="glass-soft rounded-xl p-4 flex gap-3 items-start">
      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-white font-bold shrink-0">
        {(m.name || '?').charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{m.name}</p>
          {isOwner && <span className="chip border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-300 !text-[10px]">👑 owner</span>}
          {isMe && <span className="chip border-cyan-500/40 bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 !text-[10px]">you</span>}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{m.college}{m.branch ? ` · ${m.branch}` : ''}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {(m.skills || []).map((s) => (
            <span key={s.name} className="chip border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-300 !text-[10px]">
              {s.name} <span className="opacity-60">· {s.level}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function TeamDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [team, setTeam] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', description: '', missingSkills: [] })
  const [saving, setSaving] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null) // 'close' | 'delete'
  const [codeBusy, setCodeBusy] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/teams/${id}`)
      setTeam(data.team)
    } catch (err) {
      toast.error(apiError(err, 'Could not load team.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (loading) return <PageSpinner />
  if (!team) {
    return (
      <div className="page-shell py-16">
        <EmptyState icon="👻" title="Team not found" message="It may have been deleted." actionLabel="Find teammates" actionTo="/find-teammates" />
      </div>
    )
  }

  const isOwner = team.owner === user?._id || team.owner?._id === user?._id
  const members = team.members || []
  const openSpots = team.openSpots ?? Math.max(0, (team.maxSize || members.length) - members.length)
  const skillGap = team.skillGap || []

  const openEdit = () => {
    setEditForm({
      name: team.name || '',
      description: team.description || '',
      missingSkills: (team.missingSkills || []).map((s) => (typeof s === 'string' ? { name: s } : { name: s.name })),
    })
    setEditOpen(true)
  }

  const saveEdit = async (e) => {
    e.preventDefault()
    if (!editForm.name.trim()) {
      toast.error('Team name is required.')
      return
    }
    setSaving(true)
    try {
      const { data } = await api.put(`/teams/${id}`, {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        missingSkills: editForm.missingSkills.map((s) => ({ name: s.name })),
      })
      setTeam(data.team || data)
      toast.success('Team updated ✏️')
      setEditOpen(false)
    } catch (err) {
      toast.error(apiError(err, 'Could not update team.'))
    } finally {
      setSaving(false)
    }
  }

  const doConfirm = async () => {
    try {
      if (confirmAction === 'close') {
        await api.post(`/teams/${id}/close`)
        toast.success('Team closed 🔒 — no more requests accepted.')
        load()
      } else if (confirmAction === 'delete') {
        await api.delete(`/teams/${id}`)
        toast.success('Team disbanded.')
        navigate('/find-teammates')
      }
    } catch (err) {
      toast.error(apiError(err, 'Action failed.'))
    } finally {
      setConfirmAction(null)
    }
  }

  return (
    <div className="page-shell py-10">
      <Link to="/find-teammates" className="text-sm text-slate-500 dark:text-slate-400 hover:text-purple-500 dark:hover:text-purple-300 font-mono">
        ← /find-teammates
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
        <div className="glass rounded-3xl p-6 md:p-8 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-purple-500/20 blur-[80px] rounded-full" aria-hidden />
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{team.name}</h1>
                {team.isOpen === false ? (
                  <span className="chip border-red-500/40 bg-red-500/10 text-red-500">🔒 closed</span>
                ) : (
                  <span className="chip border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">● recruiting</span>
                )}
              </div>
              {team.description && <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-2xl">{team.description}</p>}
              <p className="mt-2 font-mono text-xs text-slate-400">
                {team.hackathon?.title ? (
                  <>competing in <Link to={`/hackathons/${team.hackathon._id || team.hackathon}`} className="text-purple-500 dark:text-purple-300 hover:underline">{team.hackathon.title}</Link></>
                ) : null}
              </p>
            </div>
            {isOwner && (
              <div className="flex flex-wrap gap-2">
                <button onClick={openEdit} className="btn-secondary btn-sm">✏️ Edit</button>
                {team.isOpen !== false && (
                  <button onClick={() => setConfirmAction('close')} className="btn-secondary btn-sm">🔒 Close team</button>
                )}
                <button onClick={() => setConfirmAction('delete')} className="btn-danger btn-sm">🗑 Disband</button>
              </div>
            )}
          </div>

          {/* stats strip */}
          <div className="relative grid grid-cols-3 gap-3 mt-6 max-w-lg">
            {[
              [`${members.length}`, 'members'],
              [`${openSpots}`, 'open spots'],
              [`${skillGap.length}`, 'skill gaps'],
            ].map(([v, l]) => (
              <div key={l} className="glass-soft rounded-xl p-3 text-center">
                <p className="font-mono text-2xl font-bold gradient-text">{v}</p>
                <p className="text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400">{l}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mt-6">
          {/* members */}
          <div className="lg:col-span-2">
            <div className="glass rounded-2xl p-6">
              <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-4">👥 Members ({members.length})</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {members.map((m) => (
                  <MemberCard
                    key={m._id}
                    m={m}
                    isOwner={String(m._id) === String(team.owner?._id || team.owner)}
                    isMe={String(m._id) === String(user?._id)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* skill gap */}
          <div className="space-y-6">
            {isOwner && team.joinCode && (
              <div className="glass rounded-2xl p-6 border-dashed">
                <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-1">🔑 Team invite code</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Share this with friends — they enter it on the hackathon page to request a spot.
                </p>
                <div className="rounded-xl bg-slate-900 dark:bg-black/40 py-4 text-center">
                  <span className="font-mono text-3xl font-bold tracking-[0.35em] text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-300">
                    {team.joinCode}
                  </span>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(team.joinCode)
                      toast.success('Code copied 📋')
                    }}
                    className="btn-secondary btn-sm flex-1"
                  >
                    📋 Copy
                  </button>
                  <button
                    disabled={codeBusy}
                    onClick={async () => {
                      if (!window.confirm('Generate a new code? The old one will stop working.')) return
                      setCodeBusy(true)
                      try {
                        const { data } = await api.post(`/teams/${id}/regenerate-code`)
                        setTeam({ ...team, joinCode: data.joinCode })
                        toast.success('New code generated 🔄')
                      } catch (err) {
                        toast.error(apiError(err, 'Could not regenerate the code.'))
                      } finally {
                        setCodeBusy(false)
                      }
                    }}
                    className="btn-secondary btn-sm flex-1"
                  >
                    {codeBusy ? '…' : '🔄 New code'}
                  </button>
                </div>
              </div>
            )}

            <div className="glass rounded-2xl p-6">
              <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-1">🎯 Skill gap</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Missing skills no member covers yet.</p>
              {skillGap.length === 0 ? (
                <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">✅ No gaps — this squad is stacked.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {skillGap.map((s) => (
                    <span key={s} className="chip border-orange-500/40 bg-orange-500/10 text-orange-600 dark:text-orange-300 font-mono">
                      ⚠ {s}
                    </span>
                  ))}
                </div>
              )}
              {isOwner && team.isOpen !== false && (
                <Link
                  to={`/find-teammates?hackathonId=${team.hackathon?._id || team.hackathon}&teamId=${team._id}`}
                  className="btn-primary btn-sm w-full mt-5"
                >
                  Find teammates →
                </Link>
              )}
            </div>

            {(team.missingSkills || []).length > 0 && (
              <div className="glass rounded-2xl p-6">
                <h2 className="font-bold text-slate-900 dark:text-white mb-3 text-sm">📌 Declared missing skills</h2>
                <div className="flex flex-wrap gap-2">
                  {(team.missingSkills || []).map((s) => (
                    <span key={s.name || s} className="chip border-slate-300 dark:border-white/10 text-slate-500 dark:text-slate-400 font-mono">
                      {s.name || s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* edit modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit team" wide>
        <form onSubmit={saveEdit} className="space-y-4">
          <div>
            <label className="label">Team name *</label>
            <input className="input" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={3} value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
          </div>
          <SkillPicker label="Missing skills (max 10)" value={editForm.missingSkills} onChange={(v) => setEditForm({ ...editForm, missingSkills: v })} withLevel={false} />
          <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Saving…' : 'Save changes'}</button>
        </form>
      </Modal>

      {/* confirm modal */}
      <Modal open={Boolean(confirmAction)} onClose={() => setConfirmAction(null)} title={confirmAction === 'close' ? 'Close team?' : 'Disband team?'}>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
          {confirmAction === 'close'
            ? 'Closing stops all new join requests. Your members stay, but the team will no longer appear as recruiting.'
            : 'Disbanding deletes this team permanently. Members will need to find new teams.'}
        </p>
        <div className="flex gap-2">
          <button onClick={() => setConfirmAction(null)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={doConfirm} className={confirmAction === 'delete' ? 'btn-danger flex-1' : 'btn-primary flex-1'}>
            {confirmAction === 'close' ? 'Close team 🔒' : 'Disband 🗑'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
