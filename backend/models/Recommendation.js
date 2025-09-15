const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  reasons: [{
    type: String,
    enum: ['skills_match', 'experience_match', 'location_match', 'interest_match', 'previous_applications']
  }],
  status: {
    type: String,
    enum: ['pending', 'viewed', 'applied', 'dismissed'],
    default: 'pending'
  },
  viewedAt: {
    type: Date
  },
  appliedAt: {
    type: Date
  },
  dismissedAt: {
    type: Date
  },
  recommendedDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient querying
recommendationSchema.index({ student: 1, recommendedDate: -1 });
recommendationSchema.index({ job: 1 });
recommendationSchema.index({ score: -1 });

module.exports = mongoose.model('Recommendation', recommendationSchema);
