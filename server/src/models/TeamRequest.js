const mongoose = require('mongoose');

const { Schema } = mongoose;

const teamRequestSchema = new Schema(
  {
    team: { type: Schema.Types.ObjectId, ref: 'Team', required: true, index: true },
    fromUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    toUser: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    message: { type: String, trim: true, maxlength: 500 },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending',
      index: true,
    },
  },
  { timestamps: true }
);

// (team, toUser, status have field-level indexes declared above)
// Prevent duplicate *pending* invites: a team may re-invite someone only after
// the earlier request was accepted/declined/cancelled.
teamRequestSchema.index(
  { team: 1, toUser: 1 },
  { unique: true, partialFilterExpression: { status: 'pending' } }
);

module.exports = mongoose.model('TeamRequest', teamRequestSchema);
