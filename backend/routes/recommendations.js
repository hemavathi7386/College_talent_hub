const express = require('express');
const router = express.Router();
const Recommendation = require('../models/Recommendation');
const Job = require('../models/Job');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { HfInference } = require('@huggingface/inference');

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY || 'hf_demo');

// Generate job recommendations for a student
router.post('/generate/:studentId', auth, async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await User.findById(studentId);
    
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Get all active jobs
    const jobs = await Job.find({ 
      deadline: { $gte: new Date() },
      status: 'active'
    });

    // Create student profile text
    const studentProfile = `${student.skills?.join(' ') || ''} ${student.experience?.join(' ') || ''} ${student.department || ''}`.trim();
    
    if (!studentProfile) {
      return res.json({ message: 'Student profile incomplete for recommendations' });
    }

    const recommendations = [];

    for (const job of jobs) {
      try {
        // Create job description text
        const jobText = `${job.title} ${job.description} ${job.requirements?.join(' ') || ''} ${job.skills?.join(' ') || ''}`.trim();
        
        // Calculate similarity using HuggingFace
        const similarity = await calculateSimilarity(studentProfile, jobText);
        
        if (similarity > 0.6) { // Lower threshold for more recommendations
          const reasons = [];
          
          // Check skill matches
          const studentSkills = student.skills || [];
          const jobSkills = job.skills || [];
          const skillMatches = studentSkills.filter(skill => 
            jobSkills.some(jobSkill => jobSkill.toLowerCase().includes(skill.toLowerCase()))
          );
          
          if (skillMatches.length > 0) reasons.push('skills_match');
          if (student.department === job.department) reasons.push('experience_match');
          
          const recommendation = new Recommendation({
            student: studentId,
            job: job._id,
            score: similarity,
            reasons,
            recommendedDate: new Date()
          });
          
          await recommendation.save();
          recommendations.push(recommendation);
        }
      } catch (error) {
        console.error(`Error processing job ${job._id}:`, error);
      }
    }

    res.json({ 
      message: `Generated ${recommendations.length} recommendations`,
      recommendations: recommendations.length
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recommendations for current user (student)
router.get('/my-recommendations', auth, async (req, res) => {
  try {
    const studentId = req.user.id;
    const { status = 'pending', limit = 10 } = req.query;
    
    const recommendations = await Recommendation.find({
      student: studentId,
      status
    })
    .populate('job')
    .sort({ score: -1, createdAt: -1 })
    .limit(parseInt(limit));
    
    res.json(recommendations);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update recommendation status
router.put('/:recommendationId/status', auth, async (req, res) => {
  try {
    const { recommendationId } = req.params;
    const { status } = req.body;
    
    const recommendation = await Recommendation.findById(recommendationId);
    
    if (!recommendation) {
      return res.status(404).json({ message: 'Recommendation not found' });
    }
    
    recommendation.status = status;
    
    if (status === 'viewed') recommendation.viewedAt = new Date();
    if (status === 'applied') recommendation.appliedAt = new Date();
    if (status === 'dismissed') recommendation.dismissedAt = new Date();
    
    await recommendation.save();
    
    res.json(recommendation);
  } catch (error) {
    console.error('Error updating recommendation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate daily recommendations for all students (cron job endpoint)
router.post('/generate-daily', async (req, res) => {
  try {
    const students = await User.find({ role: 'student' });
    let totalRecommendations = 0;
    
    for (const student of students) {
      try {
        // Clear old pending recommendations (older than 7 days)
        await Recommendation.deleteMany({
          student: student._id,
          status: 'pending',
          createdAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        });
        
        // Generate new recommendations
        const jobs = await Job.find({ 
          deadline: { $gte: new Date() },
          status: 'active'
        });

        const studentProfile = `${student.skills?.join(' ') || ''} ${student.experience?.join(' ') || ''} ${student.department || ''}`.trim();
        
        if (!studentProfile) continue;

        for (const job of jobs.slice(0, 5)) { // Limit to 5 jobs per student per day
          try {
            const jobText = `${job.title} ${job.description} ${job.requirements?.join(' ') || ''} ${job.skills?.join(' ') || ''}`.trim();
            const similarity = await calculateSimilarity(studentProfile, jobText);
            
            if (similarity > 0.65) {
              // Check if recommendation already exists
              const existingRec = await Recommendation.findOne({
                student: student._id,
                job: job._id,
                recommendedDate: {
                  $gte: new Date(new Date().setHours(0, 0, 0, 0))
                }
              });
              
              if (!existingRec) {
                const reasons = [];
                const studentSkills = student.skills || [];
                const jobSkills = job.skills || [];
                const skillMatches = studentSkills.filter(skill => 
                  jobSkills.some(jobSkill => jobSkill.toLowerCase().includes(skill.toLowerCase()))
                );
                
                if (skillMatches.length > 0) reasons.push('skills_match');
                if (student.department === job.department) reasons.push('experience_match');
                
                const recommendation = new Recommendation({
                  student: student._id,
                  job: job._id,
                  score: similarity,
                  reasons,
                  recommendedDate: new Date()
                });
                
                await recommendation.save();
                totalRecommendations++;
              }
            }
          } catch (error) {
            console.error(`Error processing job ${job._id} for student ${student._id}:`, error);
          }
        }
      } catch (error) {
        console.error(`Error generating recommendations for student ${student._id}:`, error);
      }
    }
    
    res.json({ 
      message: `Generated ${totalRecommendations} daily recommendations`,
      totalRecommendations
    });
  } catch (error) {
    console.error('Error generating daily recommendations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to calculate similarity
async function calculateSimilarity(text1, text2) {
  try {
    if (!text1 || !text2) return 0;
    
    // Simple text similarity for demo - in production use HuggingFace embeddings
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];
    
    return intersection.length / union.length;
  } catch (error) {
    console.error('Error calculating similarity:', error);
    return 0;
  }
}

module.exports = router;
