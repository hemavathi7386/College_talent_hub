const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['job_application', 'profile_view', 'chat_message', 'recommendation_view', 'competition_participation'],
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },
  competitionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Competition'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for analytics queries
analyticsSchema.index({ type: 1, timestamp: -1 });
analyticsSchema.index({ user: 1, timestamp: -1 });
analyticsSchema.index({ timestamp: -1 });

module.exports = mongoose.model('Analytics', analyticsSchema);
