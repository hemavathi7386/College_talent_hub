const express = require('express');
const { body, validationResult } = require('express-validator');
const Job = require('../models/Job');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');
const { createJobNotification } = require('../utils/notifications');
const emailService = require('../services/emailService');

const router = express.Router();

// @route   POST /api/jobs
// @desc    Create a job/internship (Recruiters only)
// @access  Private (Recruiter)
router.post('/', [auth, authorize('recruiter'), [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('company').notEmpty().withMessage('Company is required'),
  body('type').isIn(['job', 'internship', 'freelance']).withMessage('Invalid job type'),
  body('requiredSkills').isArray({ min: 1 }).withMessage('At least one skill is required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('applicationDeadline').isISO8601().withMessage('Valid application deadline is required')
]], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      company,
      type,
      requiredSkills,
      location,
      salary,
      duration,
      applicationDeadline,
      requirements
    } = req.body;

    const job = new Job({
      title,
      description,
      company,
      recruiter: req.user.id,
      type,
      requiredSkills,
      location,
      salary,
      duration,
      applicationDeadline,
      requirements
    });

    await job.save();
    await job.populate('recruiter', 'name email company');

    // Create notifications for all students about new job posting
    await createJobNotification(job, req.user);

    // Send email notifications to all students in background
    setTimeout(async () => {
      try {
        await emailService.sendJobPostingNotification(job, req.user);
      } catch (error) {
        console.error('Error sending job posting emails:', error);
      }
    }, 100);

    // Find matching students based on skills
    const matchingStudents = await User.find({
      role: 'student',
      skills: { $in: requiredSkills }
    }).select('name email skills department');

    res.status(201).json({
      job,
      suggestedStudents: matchingStudents.map(student => ({
        ...student.toObject(),
        skillMatch: job.calculateSkillMatch(student.skills)
      })).filter(student => student.skillMatch > 0)
      .sort((a, b) => b.skillMatch - a.skillMatch)
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/jobs
// @desc    Get jobs based on user role
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const type = req.query.type;

    let query = { isActive: true };
    if (type) {
      query.type = type;
    }

    // If recruiter, show only their jobs
    if (req.user.role === 'recruiter') {
      query.recruiter = req.user.id;
    }

    let jobs = await Job.find(query)
      .populate('recruiter', 'name email company')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // For students, calculate skill match and filter eligible jobs
    if (req.user.role === 'student') {
      jobs = jobs.map(job => ({
        ...job.toObject(),
        skillMatch: job.calculateSkillMatch(req.user.skills),
        isEligible: job.calculateSkillMatch(req.user.skills) > 30 // 30% minimum match
      })).filter(job => job.isEligible)
      .sort((a, b) => b.skillMatch - a.skillMatch);
    }

    const total = await Job.countDocuments(query);

    res.json({
      jobs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/jobs/:id
// @desc    Get job by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('recruiter', 'name email company')
      .populate('applicants.user', 'name email department skills rollNumber');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    let response = job.toObject();

    // Add skill match for students
    if (req.user.role === 'student') {
      response.skillMatch = job.calculateSkillMatch(req.user.skills);
      response.isEligible = response.skillMatch > 30;
    }

    res.json(response);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST /api/jobs/:id/apply
// @desc    Apply for job (Students only)
// @access  Private (Student)
router.post('/:id/apply', [auth, authorize('student'), [
  body('coverLetter').optional().isString()
]], async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if application is open
    if (!job.isApplicationOpen) {
      return res.status(400).json({ message: 'Application deadline has passed' });
    }

    // Check if already applied
    const alreadyApplied = job.applicants.some(
      applicant => applicant.user.toString() === req.user.id
    );

    if (alreadyApplied) {
      return res.status(400).json({ message: 'Already applied for this job' });
    }

    // Check skill match eligibility
    const skillMatch = job.calculateSkillMatch(req.user.skills);
    if (skillMatch < 30) {
      return res.status(400).json({ 
        message: 'You do not meet the minimum skill requirements for this job',
        skillMatch 
      });
    }

    job.applicants.push({
      user: req.user.id,
      coverLetter: req.body.coverLetter || ''
    });

    await job.save();

    res.json({ 
      message: 'Application submitted successfully',
      skillMatch 
    });
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/jobs/:jobId/applicants/:applicantId
// @desc    Update applicant status (Recruiters only)
// @access  Private (Recruiter)
router.put('/:jobId/applicants/:applicantId', [auth, authorize('recruiter'), [
  body('status').isIn(['applied', 'shortlisted', 'rejected', 'selected']).withMessage('Invalid status')
]], async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user is the recruiter
    if (job.recruiter.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const applicant = job.applicants.id(req.params.applicantId);
    if (!applicant) {
      return res.status(404).json({ message: 'Applicant not found' });
    }

    applicant.status = req.body.status;
    await job.save();

    res.json({ message: 'Applicant status updated successfully' });
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Job or applicant not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/jobs/:id
// @desc    Update job (Recruiter only)
// @access  Private (Recruiter)
router.put('/:id', [auth, authorize('recruiter')], async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user is the recruiter
    if (job.recruiter.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to update this job' });
    }

    const updates = req.body;
    Object.keys(updates).forEach(key => {
      if (key !== 'recruiter' && key !== 'applicants') {
        job[key] = updates[key];
      }
    });

    await job.save();
    await job.populate('recruiter', 'name email company');

    res.json(job);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/jobs/:id
// @desc    Delete job (Recruiter only)
// @access  Private (Recruiter)
router.delete('/:id', [auth, authorize('recruiter')], async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user is the recruiter
    if (job.recruiter.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to delete this job' });
    }

    await Job.findByIdAndDelete(req.params.id);

    res.json({ message: 'Job removed successfully' });
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;
