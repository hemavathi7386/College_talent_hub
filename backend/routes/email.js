const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const emailService = require('../services/emailService');
const User = require('../models/User');

const router = express.Router();

// @route   POST /api/email/test
// @desc    Test email configuration
// @access  Private (Admin only)
router.post('/test', [auth, authorize('admin')], async (req, res) => {
  try {
    const result = await emailService.testEmailConfig();
    res.json(result);
  } catch (error) {
    console.error('Email test error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   POST /api/email/test-send
// @desc    Send test email to admin
// @access  Private (Admin only)
router.post('/test-send', [auth, authorize('admin')], async (req, res) => {
  try {
    const testEmailData = {
      title: 'Test Job Posting',
      description: 'This is a test job posting to verify email functionality.',
      location: 'Test Location',
      type: 'Full-time',
      salary: 'Competitive',
      requiredSkills: ['JavaScript', 'Node.js']
    };

    const testRecruiterData = {
      name: 'Test Recruiter',
      company: 'Test Company'
    };

    // Send test job notification to admin only
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      return res.status(404).json({ success: false, error: 'Admin user not found' });
    }

    const result = await emailService.sendJobPostingNotification(testEmailData, testRecruiterData);
    
    res.json({
      success: true,
      message: 'Test email sent successfully',
      details: result
    });
  } catch (error) {
    console.error('Test email send error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET /api/email/stats
// @desc    Get email statistics
// @access  Private (Admin only)
router.get('/stats', [auth, authorize('admin')], async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const studentCount = await User.countDocuments({ role: 'student' });
    const facultyCount = await User.countDocuments({ role: 'faculty' });
    const recruiterCount = await User.countDocuments({ role: 'recruiter' });

    res.json({
      success: true,
      stats: {
        totalUsers,
        studentCount,
        facultyCount,
        recruiterCount,
        emailConfig: {
          host: process.env.EMAIL_HOST,
          port: process.env.EMAIL_PORT,
          user: process.env.EMAIL_USER
        }
      }
    });
  } catch (error) {
    console.error('Email stats error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
