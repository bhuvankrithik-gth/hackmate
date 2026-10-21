const mongoose = require('mongoose');

const { Schema } = mongoose;

const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

const skillSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    level: { type: String, enum: SKILL_LEVELS, default: 'Beginner' },
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, index: true, unique: true },
    passwordHash: { type: String, select: false }, // empty for Google-only accounts
    googleId: { type: String, unique: true, sparse: true, select: false },
    role: { type: String, enum: ['student', 'host'], required: true },
    // student profile
    college: { type: String, trim: true },
    branch: { type: String, trim: true },
    year: { type: Number, min: 1, max: 6 },
    skills: { type: [skillSchema], default: [] },
    github: { type: String, trim: true },
    linkedin: { type: String, trim: true },
    bio: { type: String, trim: true, maxlength: 1000 },
    // host profile
    organization: { type: String, trim: true },
    // Host approval gate: new host accounts start 'pending' and cannot log
    // in or create hackathons until an admin approves them. Students are
    // always 'approved' (the field is ignored for them). Existing hosts from
    // before this feature were backfilled to 'approved' by a db migration.
    hostStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved',
    },
    hostStatusNote: { type: String, trim: true }, // set on reject, shown to the host
    // Admins (approvers) — the demo host is promoted by a db migration and
    // additional admin emails can be listed in the ADMIN_EMAILS env var.
    isAdmin: { type: Boolean, default: false },
    // legal: when the user accepted the Terms of Service & Privacy Policy
    termsAcceptedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// (email has a field-level unique index declared above)

// Never leak the password hash through JSON responses.
function stripSecrets(doc, ret) {
  delete ret.passwordHash;
  delete ret.googleId;
  delete ret.__v;
  return ret;
}
userSchema.set('toJSON', { transform: stripSecrets });
userSchema.set('toObject', { transform: stripSecrets });

module.exports = mongoose.model('User', userSchema);
module.exports.SKILL_LEVELS = SKILL_LEVELS;
