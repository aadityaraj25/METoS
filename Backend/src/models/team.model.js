const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Team name is required'],
    trim: true,
  },
  leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  college: {
    type: String,
    required: [true, 'College is required'],
    trim: true,
  },
  problemStatement: {
    type: String,
    required: [true, 'Problem statement is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  maxMembers: {
    type: Number,
    default: 6,
  },
  isOpen: {
    type: Boolean,
    default: true,
  },
  status: {
    type: String,
    enum: ['recruiting', 'locked', 'cancelled'],
    default: 'recruiting',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Team', teamSchema);
