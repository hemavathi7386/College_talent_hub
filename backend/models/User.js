const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['student', 'faculty', 'recruiter', 'admin'],
    required: true
  },
  department: {
    type: String,
    required: function() {
      return this.role === 'student' || this.role === 'faculty';
    }
  },
  skills: [{
    type: String,
    trim: true
  }],
  achievements: [{
    title: String,
    description: String,
    date: Date
  }],
  rollNumber: {
    type: String,
    required: function() {
      return this.role === 'student';
    }
  },
  company: {
    type: String,
    required: function() {
      return this.role === 'recruiter';
    }
  },
  profilePicture: {
    type: String,
    default: ''
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  resume: {
    filename: String,
    originalName: String,
    path: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  },
  experiences: [{
    title: {
      type: String,
      required: true
    },
    company: {
      type: String,
      required: true
    },
    location: String,
    startDate: {
      type: Date,
      required: true
    },
    endDate: Date,
    current: {
      type: Boolean,
      default: false
    },
    description: String,
    skills: [String]
  }],
  // Contact Information
  personalEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  // Social Links
  linkedinUrl: {
    type: String,
    trim: true
  },
  githubUrl: {
    type: String,
    trim: true
  },
  portfolioUrl: {
    type: String,
    trim: true
  },
  aiEmbedding: {
    embedding: [Number],
    metadata: {
      skills: [String],
      experienceCount: Number,
      hasResume: Boolean,
      generatedAt: Date
    },
    lastUpdated: { type: Date, default: Date.now }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Email validation method
userSchema.statics.validateEmail = function(email, role) {
  const studentPattern = /^[a-zA-Z0-9]+@cutmap\.ac\.in$/;
  const facultyPattern = /^[a-zA-Z0-9._%+-]+@cutmap\.ac\.in$/;
  const recruiterPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const adminPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // Any valid email for admin

  switch (role) {
    case 'student':
      return studentPattern.test(email);
    case 'faculty':
      return facultyPattern.test(email);
    case 'recruiter':
      return recruiterPattern.test(email);
    case 'admin':
      return adminPattern.test(email);
    default:
      return false;
  }
};

module.exports = mongoose.model('User', userSchema);
