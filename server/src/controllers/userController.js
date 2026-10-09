const User = require('../models/User');
const { asyncHandler, httpError } = require('../middleware/errorHandler');

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

module.exports = {
  getMe: asyncHandler(getMe),
  updateMe: asyncHandler(updateMe),
};
