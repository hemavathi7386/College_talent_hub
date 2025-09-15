const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (user) => {
  const payload = {
    user: {
      id: user.id,
      role: user.role
    }
  };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
};

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['student', 'faculty', 'recruiter', 'admin']).withMessage('Invalid role')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role, department, skills, rollNumber, company } = req.body;

    // Validate email format based on role
    if (!User.validateEmail(email, role)) {
      let message = '';
      switch (role) {
        case 'student':
          message = 'Students must use official university email (rollnumber@cutmap.ac.in)';
          break;
        case 'faculty':
          message = 'Faculty must use official university email (@cutmap.ac.in)';
          break;
        case 'recruiter':
          message = 'Please provide a valid email address';
          break;
        case 'admin':
          message = 'Please provide a valid email address';
          break;
      }
      return res.status(400).json({ message });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user object
    const userData = {
      name,
      email,
      password,
      role,
      skills: skills || []
    };

    // Add role-specific fields
    if (role === 'student' || role === 'faculty') {
      userData.department = department;
    }
    if (role === 'student') {
      userData.rollNumber = rollNumber;
    }
    if (role === 'recruiter') {
      userData.company = company;
    }

    user = new User(userData);
    await user.save();

    const token = generateToken(user);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        skills: user.skills
      }
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password').exists().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    console.log('Login attempt for:', email);

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('User found:', user.name, 'Role:', user.role);

    // Check password
    console.log('Comparing password for user:', email);
    const isMatch = await user.comparePassword(password);
    console.log('Password comparison result:', isMatch);
    if (!isMatch) {
      console.log('Password mismatch for:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('Password match successful for:', email);

    // Create JWT payload
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    // Generate token using the helper function
    const token = generateToken(user);
    
    console.log('Login successful for:', email, 'Role:', user.role);
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        company: user.company
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
