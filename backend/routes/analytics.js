const express = require('express');
const router = express.Router();
const Analytics = require('../models/Analytics');
const User = require('../models/User');
const Job = require('../models/Job');
const Competition = require('../models/Competition');
const CompetitionResult = require('../models/CompetitionResult');
const { auth } = require('../middleware/auth');

// Track analytics event
router.post('/track', auth, async (req, res) => {
  try {
    const { type, targetUser, jobId, competitionId, metadata } = req.body;
    
    const analytics = new Analytics({
      type,
      user: req.user.id,
      targetUser,
      jobId,
      competitionId,
      metadata
    });
    
    await analytics.save();
    res.json({ message: 'Event tracked successfully' });
  } catch (error) {
    console.error('Error tracking analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recruiter analytics dashboard
router.get('/recruiter-dashboard', auth, async (req, res) => {
  try {
    const recruiterId = req.user.id;
    const { timeframe = '30' } = req.query; // days
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeframe));
    
    // Get recruiter's posted jobs
    const recruiterJobs = await Job.find({ postedBy: recruiterId });
    const jobIds = recruiterJobs.map(job => job._id);
    
    // Job application analytics
    const applicationStats = await Analytics.aggregate([
      {
        $match: {
          type: 'job_application',
          jobId: { $in: jobIds },
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            jobId: '$jobId'
          },
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'jobs',
          localField: '_id.jobId',
          foreignField: '_id',
          as: 'job'
        }
      },
      { $unwind: '$job' },
      {
        $group: {
          _id: '$_id.date',
          totalApplications: { $sum: '$count' },
          jobApplications: {
            $push: {
              jobTitle: '$job.title',
              applications: '$count'
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Profile view analytics
    const profileViews = await Analytics.aggregate([
      {
        $match: {
          type: 'profile_view',
          targetUser: { $in: await User.find({ role: 'student' }).distinct('_id') },
          user: recruiterId,
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Top performing jobs
    const topJobs = await Analytics.aggregate([
      {
        $match: {
          type: 'job_application',
          jobId: { $in: jobIds },
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$jobId',
          applications: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'jobs',
          localField: '_id',
          foreignField: '_id',
          as: 'job'
        }
      },
      { $unwind: '$job' },
      {
        $project: {
          jobTitle: '$job.title',
          applications: 1,
          department: '$job.department',
          postedDate: '$job.createdAt'
        }
      },
      { $sort: { applications: -1 } },
      { $limit: 10 }
    ]);
    
    // Student engagement metrics
    const studentEngagement = await Analytics.aggregate([
      {
        $match: {
          user: recruiterId,
          type: { $in: ['profile_view', 'chat_message'] },
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$targetUser',
          interactions: { $sum: 1 },
          lastInteraction: { $max: '$timestamp' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      {
        $project: {
          studentName: '$student.name',
          studentEmail: '$student.email',
          department: '$student.department',
          interactions: 1,
          lastInteraction: 1
        }
      },
      { $sort: { interactions: -1 } },
      { $limit: 20 }
    ]);
    
    res.json({
      applicationStats,
      profileViews,
      topJobs,
      studentEngagement,
      summary: {
        totalJobs: recruiterJobs.length,
        totalApplications: applicationStats.reduce((sum, day) => sum + day.totalApplications, 0),
        totalProfileViews: profileViews.reduce((sum, day) => sum + day.count, 0),
        activeStudents: studentEngagement.length
      }
    });
  } catch (error) {
    console.error('Error fetching recruiter analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get faculty analytics dashboard
router.get('/faculty-dashboard', auth, async (req, res) => {
  try {
    const facultyId = req.user.id;
    const { timeframe = '30' } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeframe));
    
    const faculty = await User.findById(facultyId);
    
    // Get students in faculty's department
    const departmentStudents = await User.find({
      role: 'student',
      department: faculty.department
    });
    const studentIds = departmentStudents.map(s => s._id);
    
    // Competition participation analytics
    const competitionStats = await CompetitionResult.aggregate([
      {
        $match: {
          student: { $in: studentIds },
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            category: '$category'
          },
          participants: { $sum: 1 },
          averageScore: { $avg: '$score' }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          totalParticipants: { $sum: '$participants' },
          categories: {
            $push: {
              category: '$_id.category',
              participants: '$participants',
              averageScore: '$averageScore'
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Student performance trends
    const performanceTrends = await CompetitionResult.aggregate([
      {
        $match: {
          student: { $in: studentIds },
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$student',
          totalPoints: { $sum: '$points' },
          averageScore: { $avg: '$score' },
          competitions: { $sum: 1 },
          bestRank: { $min: '$rank' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      {
        $project: {
          studentName: '$student.name',
          studentEmail: '$student.email',
          totalPoints: 1,
          averageScore: { $round: ['$averageScore', 2] },
          competitions: 1,
          bestRank: 1
        }
      },
      { $sort: { totalPoints: -1 } }
    ]);
    
    // Skill development analytics
    const skillAnalytics = await User.aggregate([
      {
        $match: {
          _id: { $in: studentIds }
        }
      },
      {
        $unwind: '$skills'
      },
      {
        $group: {
          _id: '$skills',
          studentCount: { $sum: 1 }
        }
      },
      { $sort: { studentCount: -1 } },
      { $limit: 15 }
    ]);
    
    // Job application success rate
    const jobApplications = await Analytics.aggregate([
      {
        $match: {
          type: 'job_application',
          user: { $in: studentIds },
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$user',
          applications: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      {
        $project: {
          studentName: '$student.name',
          applications: 1
        }
      },
      { $sort: { applications: -1 } }
    ]);
    
    res.json({
      competitionStats,
      performanceTrends,
      skillAnalytics,
      jobApplications,
      summary: {
        totalStudents: departmentStudents.length,
        activeStudents: performanceTrends.length,
        totalCompetitions: competitionStats.reduce((sum, day) => sum + day.totalParticipants, 0),
        averageDepartmentScore: performanceTrends.length > 0 
          ? (performanceTrends.reduce((sum, s) => sum + s.averageScore, 0) / performanceTrends.length).toFixed(2)
          : 0
      }
    });
  } catch (error) {
    console.error('Error fetching faculty analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get system-wide analytics (admin only)
router.get('/system-overview', auth, async (req, res) => {
  try {
    const { timeframe = '30' } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeframe));
    
    // User activity overview
    const userActivity = await Analytics.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            type: '$type'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          activities: {
            $push: {
              type: '$_id.type',
              count: '$count'
            }
          },
          totalActivity: { $sum: '$count' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // User registration trends
    const userRegistrations = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            role: '$role'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          registrations: {
            $push: {
              role: '$_id.role',
              count: '$count'
            }
          },
          totalRegistrations: { $sum: '$count' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Platform engagement metrics
    const engagementMetrics = await Analytics.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: '$user' }
        }
      },
      {
        $project: {
          type: '$_id',
          count: 1,
          uniqueUsers: { $size: '$uniqueUsers' }
        }
      }
    ]);
    
    res.json({
      userActivity,
      userRegistrations,
      engagementMetrics,
      summary: {
        totalUsers: await User.countDocuments(),
        totalJobs: await Job.countDocuments(),
        totalCompetitions: await Competition.countDocuments(),
        totalActivity: userActivity.reduce((sum, day) => sum + day.totalActivity, 0)
      }
    });
  } catch (error) {
    console.error('Error fetching system analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
