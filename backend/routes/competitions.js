const express = require('express');
const { body, validationResult } = require('express-validator');
const Competition = require('../models/Competition');
const { auth, authorize } = require('../middleware/auth');
const { createCompetitionNotification } = require('../utils/notifications');
const emailService = require('../services/emailService');

const router = express.Router();

// @route   POST /api/competitions
// @desc    Create a competition (Faculty only)
// @access  Private (Faculty)
router.post('/', [auth, authorize('faculty'), [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('registrationDeadline').isISO8601().withMessage('Valid registration deadline is required')
]], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      date,
      registrationDeadline,
      maxParticipants,
      category,
      prizes,
      rules
    } = req.body;

    const competition = new Competition({
      title,
      description,
      organizer: req.user.id,
      date,
      registrationDeadline,
      maxParticipants: maxParticipants || 100,
      category: category || 'technical',
      prizes: prizes || [],
      rules: rules || ''
    });

    await competition.save();
    await competition.populate('organizer', 'name email department');

    // Create notifications for all students about new competition
    await createCompetitionNotification(competition, req.user);

    // Send email notifications to all students in background
    setTimeout(async () => {
      try {
        await emailService.sendCompetitionNotification(competition, req.user);
      } catch (error) {
        console.error('Error sending competition emails:', error);
      }
    }, 100);

    res.status(201).json(competition);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/competitions
// @desc    Get all competitions
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const category = req.query.category;

    let query = { isActive: true };
    if (category) {
      query.category = category;
    }

    const competitions = await Competition.find(query)
      .populate('organizer', 'name email department')
      .populate('participants.user', 'name email department rollNumber')
      .sort({ date: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Competition.countDocuments(query);

    res.json({
      competitions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/competitions/:id
// @desc    Get competition by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id)
      .populate('organizer', 'name email department')
      .populate('participants.user', 'name email department rollNumber');

    if (!competition) {
      return res.status(404).json({ message: 'Competition not found' });
    }

    res.json(competition);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Competition not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST /api/competitions/:id/register
// @desc    Register for competition (Students only)
// @access  Private (Student)
router.post('/:id/register', [auth, authorize('student')], async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id);

    if (!competition) {
      return res.status(404).json({ message: 'Competition not found' });
    }

    // Check if registration is open
    if (!competition.isRegistrationOpen) {
      return res.status(400).json({ message: 'Registration is closed' });
    }

    // Check if already registered
    const alreadyRegistered = competition.participants.some(
      participant => participant.user.toString() === req.user.id
    );

    if (alreadyRegistered) {
      return res.status(400).json({ message: 'Already registered for this competition' });
    }

    // Check if competition is full
    if (competition.participants.length >= competition.maxParticipants) {
      return res.status(400).json({ message: 'Competition is full' });
    }

    competition.participants.push({ user: req.user.id });
    await competition.save();

    res.json({ message: 'Successfully registered for competition' });
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Competition not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/competitions/:id/register
// @desc    Unregister from competition (Students only)
// @access  Private (Student)
router.delete('/:id/register', [auth, authorize('student')], async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id);

    if (!competition) {
      return res.status(404).json({ message: 'Competition not found' });
    }

    const participantIndex = competition.participants.findIndex(
      participant => participant.user.toString() === req.user.id
    );

    if (participantIndex === -1) {
      return res.status(400).json({ message: 'Not registered for this competition' });
    }

    competition.participants.splice(participantIndex, 1);
    await competition.save();

    res.json({ message: 'Successfully unregistered from competition' });
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Competition not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/competitions/:id
// @desc    Update competition (Organizer only)
// @access  Private (Faculty - Organizer)
router.put('/:id', [auth, authorize('faculty')], async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id);

    if (!competition) {
      return res.status(404).json({ message: 'Competition not found' });
    }

    // Check if user is the organizer
    if (competition.organizer.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to update this competition' });
    }

    const updates = req.body;
    Object.keys(updates).forEach(key => {
      competition[key] = updates[key];
    });

    await competition.save();
    await competition.populate('organizer', 'name email department');

    res.json(competition);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Competition not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;
