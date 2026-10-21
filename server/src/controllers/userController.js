const User = require('../models/User');
const Notification = require('../models/Notification');
const { asyncHandler, httpError } = require('../middleware/errorHandler');

const HOST_FIELDS =
  'name email role organization hostStatus hostStatusNote isAdmin createdAt';

// Editable student profile fields per contract.
const EDITABLE_STUDENT_FIELDS = [
  'name',
  'college',
  'branch',
  'year',
  'skills',
  'github',
  'linkedin',
  'bio',
];

async function getMe(req, res) {
  const user = await User.findById(req.user.id);
  if (!user) throw httpError(404, 'User not found');
  return res.status(200).json({ user: user.toJSON() });
}

async function updateMe(req, res) {
  if (req.user.role !== 'student') {
    throw httpError(403, 'Only students can update their profile');
  }
  const updates = {};
  for (const field of EDITABLE_STUDENT_FIELDS) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }
  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true,
  });
  if (!user) throw httpError(404, 'User not found');
  return res.status(200).json({ user: user.toJSON() });
}

// ---- Admin: host approval queue (requireAdmin runs before these) ----

// GET /api/users/host-requests — pending hosts first, plus every host so the
// admin can also revoke an already-approved host.
async function listHostRequests(req, res) {
  const hosts = await User.find({ role: 'host' })
    .select(HOST_FIELDS)
    .sort({ createdAt: -1 });
  const pending = hosts.filter((h) => h.hostStatus === 'pending');
  return res.status(200).json({ pending, hosts });
}

async function decideHost(req, res, status) {
  const host = await User.findById(req.params.id);
  if (!host || host.role !== 'host') throw httpError(404, 'Host account not found');
  if (host.isAdmin) throw httpError(400, 'Admin accounts cannot be changed here.');
  host.hostStatus = status;
  host.hostStatusNote = status === 'rejected' ? String(req.body?.note || '').trim() : '';
  await host.save();

  await Notification.create({
    user: host._id,
    title:
      status === 'approved'
        ? 'Your host account was approved 🎉'
        : 'Your host account was not approved',
    body:
      status === 'approved'
        ? 'You can now log in and create hackathons on HackMate.'
        : 'Your host account request was reviewed and not approved. Contact the HackMate admin if you think this is a mistake.',
    type: 'host_approval',
    link: '/host',
  });

  return res.status(200).json({ user: host.toJSON() });
}

async function approveHost(req, res) {
  return decideHost(req, res, 'approved');
}

async function rejectHost(req, res) {
  return decideHost(req, res, 'rejected');
}

module.exports = {
  getMe: asyncHandler(getMe),
  updateMe: asyncHandler(updateMe),
  listHostRequests: asyncHandler(listHostRequests),
  approveHost: asyncHandler(approveHost),
  rejectHost: asyncHandler(rejectHost),
};
