const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, skills, achievements, department, company } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update allowed fields
    if (name) user.name = name;
    if (skills) user.skills = skills;
    if (achievements) user.achievements = achievements;
    if (department && (user.role === 'student' || user.role === 'faculty')) {
      user.department = department;
    }
    if (company && user.role === 'recruiter') {
      user.company = company;
    }

    await user.save();

    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/users/students
// @desc    Get all students (for recruiters and faculty)
// @access  Private
router.get('/students', auth, async (req, res) => {
  try {
    console.log('Students API called by user:', req.user.email, 'Role:', req.user.role);
    
    if (req.user.role === 'student') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const department = req.query.department;
    const skills = req.query.skills;

    let query = { role: 'student' };
    if (department && department !== 'all') {
      query.department = department;
    }
    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim());
      query.skills = { $in: skillsArray };
    }

    console.log('Query for students:', query);

    const students = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    console.log('Found students:', students.length, 'Total in DB:', total);
    console.log('Student names:', students.map(s => s.name));

    res.json({
      students,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Students API error:', error.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;
