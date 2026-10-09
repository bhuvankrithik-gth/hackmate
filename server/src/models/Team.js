const mongoose = require('mongoose');

const { Schema } = mongoose;

const teamSchema = new Schema(
  {
    hackathon: { type: Schema.Types.ObjectId, ref: 'Hackathon', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, trim: true, maxlength: 1000 },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: { type: [{ type: Schema.Types.ObjectId, ref: 'User' }], default: [], index: true },
    missingSkills: {
      type: [{ name: { type: String, required: true, trim: true } }],
      default: [],
      validate: {
        validator: (v) => v.length <= 10,
        message: 'missingSkills cannot exceed 10 entries',
      },
    },
    isOpen: { type: Boolean, default: true },
  },
  { timestamps: true }
);

teamSchema.index({ 'missingSkills.name': 1 });

module.exports = mongoose.model('Team', teamSchema);
