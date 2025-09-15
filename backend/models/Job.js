const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
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
  company: {
    type: String,
    required: true,
    trim: true
  },
  recruiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['job', 'internship', 'freelance'],
    required: true
  },
  requiredSkills: [{
    type: String,
    required: true,
    trim: true
  }],
  location: {
    type: String,
    required: true,
    trim: true
  },
  salary: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'INR'
    }
  },
  duration: {
    type: String, // For internships/freelance
    default: ''
  },
  applicationDeadline: {
    type: Date,
    required: true
  },
  applicants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['applied', 'shortlisted', 'rejected', 'selected'],
      default: 'applied'
    },
    coverLetter: String
  }],
  requirements: {
    experience: String,
    education: String,
    other: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Virtual for applicant count
jobSchema.virtual('applicantCount').get(function() {
  return this.applicants.length;
});

// Check if application is open
jobSchema.virtual('isApplicationOpen').get(function() {
  return new Date() < this.applicationDeadline && this.isActive;
});

// Method to check skill match percentage
jobSchema.methods.calculateSkillMatch = function(userSkills) {
  if (!userSkills || userSkills.length === 0) return 0;
  if (!this.requiredSkills || this.requiredSkills.length === 0) return 0;

  const matchingSkills = this.requiredSkills.filter(skill =>
    userSkills.some(userSkill =>
      userSkill.toLowerCase().includes(skill.toLowerCase()) ||
      skill.toLowerCase().includes(userSkill.toLowerCase())
    )
  );

  return Math.round((matchingSkills.length / this.requiredSkills.length) * 100);
};

module.exports = mongoose.model('Job', jobSchema);
