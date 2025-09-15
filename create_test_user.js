const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/college_talent_hub', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'faculty', 'recruiter'], required: true },
  department: { type: String },
  year: { type: Number },
  skills: [String],
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

async function createTestUsers() {
  try {
    // Delete existing test users
    await User.deleteMany({ email: { $in: ['faculty@cutmap.ac.in', 'student@cutmap.ac.in'] } });
    
    // Create faculty user
    const faculty = new User({
      name: 'Test Faculty',
      email: 'faculty@cutmap.ac.in',
      password: 'password123',
      role: 'faculty',
      department: 'Computer Science'
    });
    
    // Create student user
    const student = new User({
      name: 'Test Student',
      email: 'student@cutmap.ac.in',
      password: 'password123',
      role: 'student',
      department: 'Computer Science',
      year: 3,
      skills: ['JavaScript', 'React', 'Node.js']
    });
    
    await faculty.save();
    await student.save();
    
    console.log('Test users created successfully!');
    console.log('Faculty: faculty@cutmap.ac.in / password123');
    console.log('Student: student@cutmap.ac.in / password123');
    
    // Test password comparison
    const testFaculty = await User.findOne({ email: 'faculty@cutmap.ac.in' });
    const passwordMatch = await testFaculty.comparePassword('password123');
    console.log('Password comparison test:', passwordMatch);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating test users:', error);
    process.exit(1);
  }
}

createTestUsers();
