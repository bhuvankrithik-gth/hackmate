const Team = require('../models/Team');
const TeamRequest = require('../models/TeamRequest');
const { createNotification } = require('../services/notificationService');
const { asyncHandler, httpError } = require('../middleware/errorHandler');
const {
  _loadTeamWithHackathon,
  _isMember,
  _teamFormationClosed,
} = require('./teamController');

const POPULATE = [
  { path: 'team', select: 'name hackathon isOpen' },
  { path: 'fromUser', select: 'name email college branch year skills github linkedin' },
  { path: 'toUser', select: 'name email college branch year skills github linkedin' },
];

function applyPopulate(query) {
  for (const p of POPULATE) query = query.populate(p);
  return query;
}

// POST /api/requests (student) — invite toUser to join teamId
async function createRequest(req, res) {
  const { teamId, toUserId, message } = req.body;

  if (String(toUserId) === String(req.user.id)) {
    throw httpError(400, 'You cannot send a team request to yourself');
  }

  const team = await _loadTeamWithHackathon(teamId);

  if (!_isMember(team, req.user.id)) {
    throw httpError(403, 'Only team members can send invites for this team');
  }
  if (!team.isOpen) throw httpError(400, 'This team is closed to new members');

  const teamSizeLimit = team.hackathon.teamSizeLimit || 4;
  if (team.members.length >= teamSizeLimit) {
    throw httpError(400, 'This team is already full');
  }

  if (_teamFormationClosed(team.hackathon)) {
    throw httpError(400, 'Team formation is closed for this hackathon');
  }

  const targetRegistered = team.hackathon.participants.some(
    (p) => String(p._id || p) === String(toUserId)
  );
  if (!targetRegistered) {
    throw httpError(400, 'The invited user is not registered in this hackathon');
  }

  if (_isMember(team, toUserId)) {
    throw httpError(400, 'This user is already in the team');
  }

  const duplicate = await TeamRequest.findOne({
    team: teamId,
    toUser: toUserId,
    status: 'pending',
  });
  if (duplicate) throw httpError(409, 'A pending request to this user already exists');

  let request;
  try {
    request = await TeamRequest.create({
      team: teamId,
      fromUser: req.user.id,
      toUser: toUserId,
      message,
    });
  } catch (err) {
    if (err.code === 11000) {
      throw httpError(409, 'A pending request to this user already exists');
    }
    throw err;
  }

  await createNotification({
    user: toUserId,
    title: `New team invite: ${team.name}`,
    body: `You have been invited to join the team "${team.name}".`,
    type: 'team_request',
    link: '/requests',
  });

  const populated = await applyPopulate(TeamRequest.findById(request._id));
  return res.status(201).json({ request: populated });
}

// GET /api/requests?tab=sent|received (student)
async function listRequests(req, res) {
  const { tab } = req.query;
  const filter = {};
  if (tab === 'sent') filter.fromUser = req.user.id;
  else if (tab === 'received') filter.toUser = req.user.id;
  else filter.$or = [{ fromUser: req.user.id }, { toUser: req.user.id }];

  const requests = await applyPopulate(
    TeamRequest.find(filter).sort({ createdAt: -1 })
  );
  return res.status(200).json({ requests });
}

// PUT /api/requests/:id/accept (toUser only)
async function acceptRequest(req, res) {
  const request = await TeamRequest.findById(req.params.id);
  if (!request) throw httpError(404, 'Request not found');
  if (String(request.toUser) !== String(req.user.id)) {
    throw httpError(403, 'Only the invited user can accept this request');
  }
  if (request.status !== 'pending') {
    throw httpError(400, `This request has already been ${request.status}`);
  }

  const team = await _loadTeamWithHackathon(request.team);

  if (_teamFormationClosed(team.hackathon)) {
    throw httpError(400, 'Team formation is closed for this hackathon');
  }

  const teamSizeLimit = team.hackathon.teamSizeLimit || 4;
  if (team.members.length >= teamSizeLimit) {
    throw httpError(400, 'This team is already full');
  }
  if (_isMember(team, req.user.id)) {
    throw httpError(400, 'You are already in this team');
  }

  const otherTeam = await Team.findOne({
    hackathon: team.hackathon._id,
    members: req.user.id,
  });
  if (otherTeam) {
    throw httpError(400, 'You are already in a team for this hackathon');
  }

  team.members.push(req.user.id);
  if (team.members.length >= teamSizeLimit) team.isOpen = false; // auto-close when full
  await team.save();

  request.status = 'accepted';
  await request.save();

  // Notify the inviter…
  await createNotification({
    user: request.fromUser,
    title: 'Invite accepted',
    body: `Your invite to "${team.name}" was accepted.`,
    type: 'request_accepted',
    link: `/teams/${team._id}`,
  });
  // …the new member…
  await createNotification({
    user: req.user.id,
    title: `You joined ${team.name}`,
    body: `Welcome to team "${team.name}".`,
    type: 'team_joined',
    link: `/teams/${team._id}`,
  });
  // …and the team that a new member joined.
  const User = require('../models/User');
  const joiner = await User.findById(req.user.id).select('name');
  const joinerName = joiner ? joiner.name : 'A new member';
  const others = team.members.filter((m) => String(m._id || m) !== String(req.user.id));
  for (const memberId of others) {
    await createNotification({
      user: memberId,
      title: `New teammate joined ${team.name}`,
      body: `${joinerName} joined your team.`,
      type: 'team_joined',
      link: `/teams/${team._id}`,
    });
  }

  const populated = await applyPopulate(TeamRequest.findById(request._id));
  return res.status(200).json({ request: populated });
}

// PUT /api/requests/:id/decline (toUser only)
async function declineRequest(req, res) {
  const request = await TeamRequest.findById(req.params.id);
  if (!request) throw httpError(404, 'Request not found');
  if (String(request.toUser) !== String(req.user.id)) {
    throw httpError(403, 'Only the invited user can decline this request');
  }
  if (request.status !== 'pending') {
    throw httpError(400, `This request has already been ${request.status}`);
  }

  request.status = 'declined';
  await request.save();

  const team = await Team.findById(request.team).select('name');
  await createNotification({
    user: request.fromUser,
    title: 'Invite declined',
    body: `Your invite to join "${team ? team.name : 'the team'}" was declined.`,
    type: 'request_declined',
    link: '/requests',
  });

  const populated = await applyPopulate(TeamRequest.findById(request._id));
  return res.status(200).json({ request: populated });
}

// DELETE /api/requests/:id (fromUser only, pending only) — cancel
async function cancelRequest(req, res) {
  const request = await TeamRequest.findById(req.params.id);
  if (!request) throw httpError(404, 'Request not found');
  if (String(request.fromUser) !== String(req.user.id)) {
    throw httpError(403, 'Only the sender can cancel this request');
  }
  if (request.status !== 'pending') {
    throw httpError(400, 'Only pending requests can be cancelled');
  }
  await request.deleteOne();
  return res.status(200).json({ message: 'Request cancelled' });
}

module.exports = {
  createRequest: asyncHandler(createRequest),
  listRequests: asyncHandler(listRequests),
  acceptRequest: asyncHandler(acceptRequest),
  declineRequest: asyncHandler(declineRequest),
  cancelRequest: asyncHandler(cancelRequest),
};
