const mongoose = require('mongoose');

const competitionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  registrationDeadline: {
    type: Date,
    required: true
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    registeredAt: {
      type: Date,
      default: Date.now
    }
  }],
  maxParticipants: {
    type: Number,
    default: 100
  },
  category: {
    type: String,
    enum: ['technical', 'cultural', 'sports', 'academic', 'other'],
    default: 'technical'
  },
  prizes: [{
    position: String,
    prize: String
  }],
  rules: {
    type: String,
    default: ''
  },
  externalLink: {
    type: String,
    default: '',
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty strings
        return /^https?:\/\/.+/.test(v);
      },
      message: 'External link must be a valid URL starting with http:// or https://'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for participant count
competitionSchema.virtual('participantCount').get(function() {
  return this.participants.length;
});

// Check if registration is open
competitionSchema.virtual('isRegistrationOpen').get(function() {
  return new Date() < this.registrationDeadline && this.isActive;
});

module.exports = mongoose.model('Competition', competitionSchema);
