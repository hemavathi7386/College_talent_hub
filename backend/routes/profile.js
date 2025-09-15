const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   PUT /api/profile/experience
// @desc    Add experience to user profile
// @access  Private
router.put('/experience', [
  auth,
  body('title').notEmpty().withMessage('Job title is required'),
  body('company').notEmpty().withMessage('Company name is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, company, location, startDate, endDate, current, description, skills } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newExperience = {
      title,
      company,
      location,
      startDate,
      endDate: current ? null : endDate,
      current,
      description,
      skills: skills || []
    };

    user.experiences.push(newExperience);
    await user.save();

    res.json({
      message: 'Experience added successfully',
      experiences: user.experiences
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/profile/experience/:id
// @desc    Delete user experience
// @access  Private
router.delete('/experience/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.experiences = user.experiences.filter(exp => exp._id.toString() !== req.params.id);
    await user.save();

    res.json({ message: 'Experience deleted successfully', experiences: user.experiences });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/profile/achievement
// @desc    Add user achievement
// @access  Private
router.put('/achievement', auth, async (req, res) => {
  try {
    const { title, description, date } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Achievement title is required' });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newAchievement = {
      title,
      description,
      date: date ? new Date(date) : new Date()
    };

    user.achievements.push(newAchievement);
    await user.save();

    res.json({ message: 'Achievement added successfully', achievements: user.achievements });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/profile/achievement/:index
// @desc    Delete user achievement
// @access  Private
router.delete('/achievement/:index', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const index = parseInt(req.params.index);
    if (index < 0 || index >= user.achievements.length) {
      return res.status(400).json({ message: 'Invalid achievement index' });
    }

    user.achievements.splice(index, 1);
    await user.save();

    res.json({ message: 'Achievement deleted successfully', achievements: user.achievements });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/profile/me
// @desc    Get current user profile with experiences and resume
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
