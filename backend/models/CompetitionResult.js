const mongoose = require('mongoose');

const competitionResultSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  competition: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Competition',
    required: true
  },
  rank: {
    type: Number,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  points: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  achievements: [{
    type: String,
    enum: ['first_place', 'second_place', 'third_place', 'participation', 'best_innovation', 'best_presentation']
  }],
  submissionUrl: {
    type: String
  },
  feedback: {
    type: String
  }
}, {
  timestamps: true
});

// Index for leaderboards
competitionResultSchema.index({ student: 1, points: -1 });
competitionResultSchema.index({ competition: 1, rank: 1 });
competitionResultSchema.index({ category: 1, points: -1 });

module.exports = mongoose.model('CompetitionResult', competitionResultSchema);
