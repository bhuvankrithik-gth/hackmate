const Team = require('../models/Team');
const TeamRequest = require('../models/TeamRequest');
const Hackathon = require('../models/Hackathon');
const User = require('../models/User');
const { asyncHandler, httpError } = require('../middleware/errorHandler');
const { generateUniqueJoinCode } = require('../utils/joinCode');

const MEMBER_PUBLIC_FIELDS = 'name email college branch year skills github linkedin';

function teamFormationClosed(hackathon, now = new Date()) {
  return now > hackathon.teamFormationDeadline;
}

async function loadTeamWithHackathon(teamId) {
  const team = await Team.findById(teamId).populate('hackathon');
  if (!team) throw httpError(404, 'Team not found');
  if (!team.hackathon) throw httpError(404, 'Hackathon not found');
  return team;
}

function isMember(team, userId) {
  return team.members.some((m) => String(m._id || m) === String(userId));
}

// POST /api/teams (student)
async function createTeam(req, res) {
  const { hackathonId, name, description, missingSkills } = req.body;

  const hackathon = await Hackathon.findById(hackathonId);
  if (!hackathon) throw httpError(404, 'Hackathon not found');

  const registered = hackathon.participants.some(
    (p) => String(p._id || p) === String(req.user.id)
  );
  if (!registered) throw httpError(400, 'You must register for the hackathon first');

  if (teamFormationClosed(hackathon)) {
    throw httpError(400, 'Team formation is closed for this hackathon');
  }

  const existing = await Team.findOne({ hackathon: hackathonId, members: req.user.id });
  if (existing) throw httpError(400, 'You are already in a team for this hackathon');

  if (missingSkills && missingSkills.length > 10) {
    throw httpError(400, 'missingSkills cannot exceed 10 entries');
  }

  const team = await Team.create({
    hackathon: hackathonId,
    name,
    description,
    owner: req.user.id,
    members: [req.user.id],
    missingSkills: missingSkills || [],
    joinCode: await generateUniqueJoinCode(Team),
  });

  const populated = await team.populate('members', MEMBER_PUBLIC_FIELDS);
  return res.status(201).json({ team: populated });
}

// GET /api/teams/my?hackathonId= (student)
async function myTeams(req, res) {
  const filter = { members: req.user.id };
  if (req.query.hackathonId) filter.hackathon = req.query.hackathonId;
  const teams = await Team.find(filter)
    .populate('hackathon', 'title teamSizeLimit registrationDeadline teamFormationDeadline')
    .populate('members', MEMBER_PUBLIC_FIELDS)
    .sort({ createdAt: -1 });
  return res.status(200).json({ teams });
}

// GET /api/teams/:id
async function getTeam(req, res) {
  const team = await Team.findById(req.params.id)
    .populate('members', MEMBER_PUBLIC_FIELDS)
    .populate('owner', 'name email')
    .populate('hackathon', 'title teamSizeLimit');
  if (!team) throw httpError(404, 'Team not found');

  const teamSizeLimit = team.hackathon ? team.hackathon.teamSizeLimit : 4;
  const memberSkillNames = new Set();
  for (const m of team.members) {
    for (const s of m.skills || []) memberSkillNames.add(s.name.toLowerCase());
  }
  const missingNames = (team.missingSkills || []).map((s) => s.name);
  const skillGap = missingNames.filter((n) => !memberSkillNames.has(n.toLowerCase()));
  const openSpots = Math.max(0, teamSizeLimit - team.members.length);

  const obj = team.toObject();
  return res.status(200).json({ team: { ...obj, openSpots, skillGap } });
}

// PUT /api/teams/:id (owner only)
async function updateTeam(req, res) {
  const team = await Team.findById(req.params.id);
  if (!team) throw httpError(404, 'Team not found');
  if (String(team.owner) !== String(req.user.id)) {
    throw httpError(403, 'Only the team owner can update the team');
  }
  const { name, description, missingSkills } = req.body;
  if (name !== undefined) team.name = name;
  if (description !== undefined) team.description = description;
  if (missingSkills !== undefined) {
    if (missingSkills.length > 10) throw httpError(400, 'missingSkills cannot exceed 10 entries');
    team.missingSkills = missingSkills;
  }
  await team.save();
  const populated = await team.populate('members', MEMBER_PUBLIC_FIELDS);
  return res.status(200).json({ team: populated });
}

// POST /api/teams/:id/close (owner)
async function closeTeam(req, res) {
  const team = await Team.findById(req.params.id);
  if (!team) throw httpError(404, 'Team not found');
  if (String(team.owner) !== String(req.user.id)) {
    throw httpError(403, 'Only the team owner can close the team');
  }
  team.isOpen = false;
  await team.save();
  return res.status(200).json({ team });
}

// DELETE /api/teams/:id (owner only)
async function deleteTeam(req, res) {
  const team = await Team.findById(req.params.id);
  if (!team) throw httpError(404, 'Team not found');
  if (String(team.owner) !== String(req.user.id)) {
    throw httpError(403, 'Only the team owner can delete the team');
  }
  await TeamRequest.deleteMany({ team: team._id });
  await team.deleteOne();
  return res.status(200).json({ message: 'Team deleted' });
}

// GET /api/teams/search/candidates?hackathonId=&teamId=&skill=&search=&college=&sort=match
async function searchCandidates(req, res) {
  const { hackathonId, teamId, skill, search, college, sort } = req.query;
  if (!hackathonId) throw httpError(400, 'hackathonId is required');
  if (!teamId) throw httpError(400, 'teamId is required');

  const team = await loadTeamWithHackathon(teamId);
  if (String(team.hackathon._id) !== String(hackathonId)) {
    throw httpError(400, 'Team does not belong to this hackathon');
  }
  if (!isMember(team, req.user.id)) {
    throw httpError(403, 'Only team members can search candidates');
  }

  const registered = team.hackathon.participants.some(
    (p) => String(p._id || p) === String(req.user.id)
  );
  if (!registered) throw httpError(403, 'You must be registered in the hackathon');

  const memberIds = new Set(team.members.map((m) => String(m._id || m)));
  memberIds.add(String(req.user.id)); // exclude the requester too

  const missingNames = (team.missingSkills || []).map((s) => s.name);
  const missingLower = missingNames.map((n) => n.toLowerCase());
  const totalMissing = missingLower.length;

  const filter = {
    _id: { $in: team.hackathon.participants, $nin: [...memberIds] },
    role: 'student',
  };
  if (college) filter.college = new RegExp(college.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  if (search) {
    const rx = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: rx }, { email: rx }, { college: rx }];
  }
  if (skill) {
    filter['skills.name'] = new RegExp(
      `^${skill.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
      'i'
    );
  }

  const users = await User.find(filter).select(MEMBER_PUBLIC_FIELDS).lean();

  const candidates = users.map((user) => {
    const userSkillNames = (user.skills || []).map((s) => s.name);
    const userSkillLower = new Set(userSkillNames.map((n) => n.toLowerCase()));
    const matchedSkills = missingNames.filter((n) => userSkillLower.has(n.toLowerCase()));
    const missingSkills = missingNames.filter((n) => !userSkillLower.has(n.toLowerCase()));
    const matchPercent =
      totalMissing === 0 ? 0 : Math.round((matchedSkills.length / totalMissing) * 100);
    return { user, matchPercent, matchedSkills, missingSkills };
  });

  if (sort === 'name') {
    candidates.sort((a, b) => a.user.name.localeCompare(b.user.name));
  } else {
    // default: sort=match — highest match first
    candidates.sort((a, b) => b.matchPercent - a.matchPercent);
  }

  return res.status(200).json({ candidates });
}

// GET /api/teams/by-code/:code (student) — look up a team by its invite code
async function getTeamByCode(req, res) {
  const code = String(req.params.code || '').trim().toUpperCase();
  if (!code) throw httpError(400, 'Invite code is required');

  const team = await Team.findOne({ joinCode: code })
    .populate('hackathon', 'title status teamSizeLimit')
    .populate('owner', 'name')
    .select('name description hackathon owner members isOpen joinCode');
  if (!team) throw httpError(404, 'No team found with that invite code');

  const teamSizeLimit = team.hackathon ? team.hackathon.teamSizeLimit : 4;
  const isMember = team.members.some((m) => String(m._id || m) === String(req.user.id));
  const otherTeam = await Team.findOne({
    hackathon: team.hackathon._id,
    members: req.user.id,
  }).select('_id name');

  return res.status(200).json({
    team: {
      _id: team._id,
      name: team.name,
      description: team.description,
      hackathon: team.hackathon,
      owner: team.owner,
      memberCount: team.members.length,
      teamSizeLimit,
      isOpen: team.isOpen,
      joinCode: team.joinCode,
      isMember,
      myOtherTeam: otherTeam,
    },
  });
}

// POST /api/teams/:id/regenerate-code (owner only)
async function regenerateJoinCode(req, res) {
  const team = await Team.findById(req.params.id);
  if (!team) throw httpError(404, 'Team not found');
  if (String(team.owner) !== String(req.user.id)) {
    throw httpError(403, 'Only the team owner can regenerate the invite code');
  }
  team.joinCode = await generateUniqueJoinCode(Team);
  await team.save();
  return res.status(200).json({ joinCode: team.joinCode });
}

module.exports = {
  createTeam: asyncHandler(createTeam),
  myTeams: asyncHandler(myTeams),
  getTeam: asyncHandler(getTeam),
  getTeamByCode: asyncHandler(getTeamByCode),
  regenerateJoinCode: asyncHandler(regenerateJoinCode),
  updateTeam: asyncHandler(updateTeam),
  closeTeam: asyncHandler(closeTeam),
  deleteTeam: asyncHandler(deleteTeam),
  searchCandidates: asyncHandler(searchCandidates),
  // exported for requestController reuse
  _loadTeamWithHackathon: loadTeamWithHackathon,
  _isMember: isMember,
  _teamFormationClosed: teamFormationClosed,
};
