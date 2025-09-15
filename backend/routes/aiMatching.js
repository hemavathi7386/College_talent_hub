const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Job = require('../models/Job');
const embeddingService = require('../services/embeddingService');
const emailService = require('../services/emailService');
const path = require('path');

// @route   POST /api/ai/match-students
// @desc    Find matching students for a job using AI embeddings
// @access  Private (Recruiters only)
router.post('/match-students', auth, async (req, res) => {
  try {
    const { jobId, threshold = 0.75 } = req.body;

    // Verify user is a recruiter
    const user = await User.findById(req.user.id);
    if (user.role !== 'recruiter') {
      return res.status(403).json({ message: 'Access denied. Recruiters only.' });
    }

    // Get job details
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Generate job embedding
    const jobEmbeddingData = await embeddingService.jobToEmbedding({
      title: job.title,
      description: job.description,
      requiredSkills: job.requiredSkills || []
    });

    // Get all students with their profiles
    const students = await User.find({ 
      role: 'student',
      $or: [
        { 'skills.0': { $exists: true } },
        { 'experiences.0': { $exists: true } },
        { 'resume.filename': { $exists: true } }
      ]
    }).select('name email skills experiences resume department');

    if (students.length === 0) {
      return res.json({ 
        matches: [], 
        message: 'No students found with profiles to match' 
      });
    }

    // Generate embeddings for all students
    const studentEmbeddings = [];
    
    for (const student of students) {
      try {
        let resumePath = null;
        if (student.resume && student.resume.filename) {
          resumePath = path.join(__dirname, '../uploads/resumes', student.resume.filename);
        }

        const embeddingData = await embeddingService.studentToEmbedding({
          skills: student.skills || [],
          experiences: student.experiences || [],
          resumePath
        });

        studentEmbeddings.push({
          studentId: student._id,
          student: {
            id: student._id,
            name: student.name,
            email: student.email,
            department: student.department,
            skills: student.skills,
            experienceCount: student.experiences?.length || 0,
            hasResume: !!student.resume?.filename
          },
          embedding: embeddingData.embedding,
          metadata: embeddingData.metadata
        });
      } catch (error) {
        console.error(`Error processing student ${student._id}:`, error);
        // Continue with other students
      }
    }

    // Find matches using cosine similarity
    const matches = await embeddingService.findMatchingStudents(
      jobEmbeddingData.embedding,
      studentEmbeddings,
      threshold
    );

    // Enhance matches with student details
    const enhancedMatches = matches.map(match => {
      const studentData = studentEmbeddings.find(s => 
        s.studentId.toString() === match.studentId.toString()
      );
      
      return {
        ...match,
        student: studentData?.student,
        matchScore: Math.round(match.similarity * 100),
        matchLevel: getMatchLevel(match.similarity),
        job: {
          id: job._id,
          title: job.title,
          location: job.location,
          type: job.type,
          requiredSkills: job.requiredSkills
        },
        recruiterCompany: user.company
      };
    });

    // Send email notifications to matched students
    if (enhancedMatches.length > 0) {
      try {
        console.log(`Sending email notifications to ${enhancedMatches.length} matched students...`);
        const emailResults = await emailService.sendBulkJobMatchNotifications(enhancedMatches);
        console.log('Email notification results:', emailResults);
      } catch (emailError) {
        console.error('Error sending email notifications:', emailError);
        // Don't fail the API call if email fails
      }
    }

    res.json({
      jobId,
      jobTitle: job.title,
      totalStudents: students.length,
      matchesFound: enhancedMatches.length,
      threshold: threshold,
      matches: enhancedMatches,
      emailNotificationsSent: enhancedMatches.length
    });

  } catch (error) {
    console.error('AI matching error:', error);
    res.status(500).json({ 
      message: 'Error in AI matching process',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/ai/generate-student-embedding
// @desc    Generate or update embedding for a student
// @access  Private (Students only)
router.post('/generate-student-embedding', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied. Students only.' });
    }

    let resumePath = null;
    if (user.resume && user.resume.filename) {
      resumePath = path.join(__dirname, '../uploads/resumes', user.resume.filename);
    }

    const embeddingData = await embeddingService.studentToEmbedding({
      skills: user.skills || [],
      experiences: user.experiences || [],
      resumePath
    });

    // Store embedding in user profile
    user.aiEmbedding = {
      embedding: embeddingData.embedding,
      metadata: embeddingData.metadata,
      lastUpdated: new Date()
    };

    await user.save();

    res.json({
      message: 'AI profile embedding generated successfully',
      metadata: embeddingData.metadata
    });

  } catch (error) {
    console.error('Error generating student embedding:', error);
    res.status(500).json({ 
      message: 'Error generating AI profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/ai/student-matches/:studentId
// @desc    Get job matches for a specific student
// @access  Private
router.get('/student-matches/:studentId', auth, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { threshold = 0.75 } = req.query;

    // Verify access (student can only see their own matches, recruiters can see any)
    const currentUser = await User.findById(req.user.id);
    if (currentUser.role === 'student' && currentUser._id.toString() !== studentId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Generate student embedding
    let resumePath = null;
    if (student.resume && student.resume.filename) {
      resumePath = path.join(__dirname, '../uploads/resumes', student.resume.filename);
    }

    const studentEmbeddingData = await embeddingService.studentToEmbedding({
      skills: student.skills || [],
      experiences: student.experiences || [],
      resumePath
    });

    // Get all active jobs
    const jobs = await Job.find({ status: 'active' })
      .populate('postedBy', 'name company');

    const jobMatches = [];

    for (const job of jobs) {
      try {
        const jobEmbeddingData = await embeddingService.jobToEmbedding({
          title: job.title,
          description: job.description,
          requiredSkills: job.requiredSkills || []
        });

        const similarity = embeddingService.calculateCosineSimilarity(
          studentEmbeddingData.embedding,
          jobEmbeddingData.embedding
        );

        if (similarity >= threshold) {
          jobMatches.push({
            job: {
              id: job._id,
              title: job.title,
              company: job.postedBy?.company,
              location: job.location,
              type: job.type,
              requiredSkills: job.requiredSkills,
              postedDate: job.createdAt
            },
            similarity,
            matchScore: Math.round(similarity * 100),
            matchLevel: getMatchLevel(similarity)
          });
        }
      } catch (error) {
        console.error(`Error processing job ${job._id}:`, error);
      }
    }

    // Sort by similarity
    jobMatches.sort((a, b) => b.similarity - a.similarity);

    res.json({
      studentId,
      studentName: student.name,
      totalJobs: jobs.length,
      matchesFound: jobMatches.length,
      threshold: threshold,
      matches: jobMatches
    });

  } catch (error) {
    console.error('Error finding student matches:', error);
    res.status(500).json({ 
      message: 'Error finding job matches',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Helper function to determine match level
function getMatchLevel(similarity) {
  if (similarity >= 0.9) return 'Excellent';
  if (similarity >= 0.8) return 'Very Good';
  if (similarity >= 0.75) return 'Good';
  if (similarity >= 0.65) return 'Fair';
  return 'Poor';
}

module.exports = router;
