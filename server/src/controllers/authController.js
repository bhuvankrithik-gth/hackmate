const bcrypt = require('bcrypt');
const User = require('../models/User');
const { signToken } = require('../middleware/auth');
const { asyncHandler, httpError } = require('../middleware/errorHandler');

const BCRYPT_ROUNDS = 12;
const SAFE_USER_FIELDS =
  'name email role college branch year skills github linkedin bio organization createdAt';

async function registerStudent(req, res) {
  const { name, email, password, college, branch, year, skills, github, linkedin, bio } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw httpError(409, 'An account with this email already exists');

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const user = await User.create({
    name,
    email,
    passwordHash,
    role: 'student',
    college,
    branch,
    year,
    skills: skills || [],
    github,
    linkedin,
    bio,
  });

  const token = signToken(user);
  return res.status(201).json({ token, user: user.toJSON() });
}

async function registerHost(req, res) {
  const { name, organization, email, password } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw httpError(409, 'An account with this email already exists');

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const user = await User.create({
    name,
    email,
    passwordHash,
    role: 'host',
    organization,
  });

  const token = signToken(user);
  return res.status(201).json({ token, user: user.toJSON() });
}

async function login(req, res) {
  const { email, password } = req.body;

  const user = await User.findOne({ email: String(email).toLowerCase() }).select(
    `+passwordHash ${SAFE_USER_FIELDS}`
  );
  if (!user) throw httpError(401, 'Invalid email or password');

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw httpError(401, 'Invalid email or password');

  const token = signToken(user);
  const safe = user.toObject();
  delete safe.passwordHash;
  return res.status(200).json({ token, user: safe });
}

async function me(req, res) {
  const user = await User.findById(req.user.id);
  if (!user) throw httpError(404, 'User not found');
  return res.status(200).json({ user: user.toJSON() });
}

module.exports = {
  registerStudent: asyncHandler(registerStudent),
  registerHost: asyncHandler(registerHost),
  login: asyncHandler(login),
  me: asyncHandler(me),
};
