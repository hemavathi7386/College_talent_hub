const express = require('express');
const router = express.Router();
const CompetitionResult = require('../models/CompetitionResult');
const User = require('../models/User');
const Competition = require('../models/Competition');
const { auth } = require('../middleware/auth');

// Get overall leaderboard
router.get('/overall', auth, async (req, res) => {
  try {
    const { limit = 50, department } = req.query;
    
    let matchCondition = {};
    if (department) {
      const users = await User.find({ department, role: 'student' }).select('_id');
      matchCondition.student = { $in: users.map(u => u._id) };
    }
    
    const leaderboard = await CompetitionResult.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: '$student',
          totalPoints: { $sum: '$points' },
          totalCompetitions: { $sum: 1 },
          firstPlaces: {
            $sum: { $cond: [{ $eq: ['$rank', 1] }, 1, 0] }
          },
          secondPlaces: {
            $sum: { $cond: [{ $eq: ['$rank', 2] }, 1, 0] }
          },
          thirdPlaces: {
            $sum: { $cond: [{ $eq: ['$rank', 3] }, 1, 0] }
          },
          averageScore: { $avg: '$score' },
          achievements: { $push: '$achievements' }
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
          studentId: '$_id',
          name: '$student.name',
          email: '$student.email',
          department: '$student.department',
          totalPoints: 1,
          totalCompetitions: 1,
          firstPlaces: 1,
          secondPlaces: 1,
          thirdPlaces: 1,
          averageScore: { $round: ['$averageScore', 2] },
          achievements: {
            $reduce: {
              input: '$achievements',
              initialValue: [],
              in: { $concatArrays: ['$$value', '$$this'] }
            }
          }
        }
      },
      { $sort: { totalPoints: -1, averageScore: -1 } },
      { $limit: parseInt(limit) }
    ]);
    
    // Add rank to each entry
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));
    
    res.json(rankedLeaderboard);
  } catch (error) {
    console.error('Error fetching overall leaderboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get category-wise leaderboard
router.get('/category/:category', auth, async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 20 } = req.query;
    
    const leaderboard = await CompetitionResult.aggregate([
      { $match: { category } },
      {
        $group: {
          _id: '$student',
          totalPoints: { $sum: '$points' },
          totalCompetitions: { $sum: 1 },
          bestRank: { $min: '$rank' },
          averageScore: { $avg: '$score' },
          achievements: { $push: '$achievements' }
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
          studentId: '$_id',
          name: '$student.name',
          email: '$student.email',
          department: '$student.department',
          totalPoints: 1,
          totalCompetitions: 1,
          bestRank: 1,
          averageScore: { $round: ['$averageScore', 2] },
          achievements: {
            $reduce: {
              input: '$achievements',
              initialValue: [],
              in: { $concatArrays: ['$$value', '$$this'] }
            }
          }
        }
      },
      { $sort: { totalPoints: -1, bestRank: 1 } },
      { $limit: parseInt(limit) }
    ]);
    
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));
    
    res.json(rankedLeaderboard);
  } catch (error) {
    console.error('Error fetching category leaderboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student's ranking and stats
router.get('/my-stats', auth, async (req, res) => {
  try {
    const studentId = req.user.id;
    
    // Get student's overall stats
    const stats = await CompetitionResult.aggregate([
      { $match: { student: studentId } },
      {
        $group: {
          _id: null,
          totalPoints: { $sum: '$points' },
          totalCompetitions: { $sum: 1 },
          firstPlaces: {
            $sum: { $cond: [{ $eq: ['$rank', 1] }, 1, 0] }
          },
          secondPlaces: {
            $sum: { $cond: [{ $eq: ['$rank', 2] }, 1, 0] }
          },
          thirdPlaces: {
            $sum: { $cond: [{ $eq: ['$rank', 3] }, 1, 0] }
          },
          averageScore: { $avg: '$score' },
          bestRank: { $min: '$rank' },
          achievements: { $push: '$achievements' }
        }
      }
    ]);
    
    if (stats.length === 0) {
      return res.json({
        totalPoints: 0,
        totalCompetitions: 0,
        overallRank: null,
        departmentRank: null,
        message: 'No competition results found'
      });
    }
    
    const studentStats = stats[0];
    
    // Get overall rank
    const overallRank = await CompetitionResult.aggregate([
      {
        $group: {
          _id: '$student',
          totalPoints: { $sum: '$points' }
        }
      },
      { $sort: { totalPoints: -1 } },
      {
        $group: {
          _id: null,
          students: { $push: { student: '$_id', points: '$totalPoints' } }
        }
      }
    ]);
    
    let overallPosition = null;
    if (overallRank.length > 0) {
      const position = overallRank[0].students.findIndex(s => s.student.toString() === studentId);
      overallPosition = position !== -1 ? position + 1 : null;
    }
    
    // Get department rank
    const student = await User.findById(studentId);
    const departmentUsers = await User.find({ 
      department: student.department, 
      role: 'student' 
    }).select('_id');
    
    const departmentRank = await CompetitionResult.aggregate([
      { 
        $match: { 
          student: { $in: departmentUsers.map(u => u._id) }
        }
      },
      {
        $group: {
          _id: '$student',
          totalPoints: { $sum: '$points' }
        }
      },
      { $sort: { totalPoints: -1 } },
      {
        $group: {
          _id: null,
          students: { $push: { student: '$_id', points: '$totalPoints' } }
        }
      }
    ]);
    
    let departmentPosition = null;
    if (departmentRank.length > 0) {
      const position = departmentRank[0].students.findIndex(s => s.student.toString() === studentId);
      departmentPosition = position !== -1 ? position + 1 : null;
    }
    
    res.json({
      ...studentStats,
      overallRank: overallPosition,
      departmentRank: departmentPosition,
      achievements: studentStats.achievements.flat()
    });
  } catch (error) {
    console.error('Error fetching student stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add competition result
router.post('/add-result', auth, async (req, res) => {
  try {
    const { competitionId, studentId, rank, score, category, achievements } = req.body;
    
    // Calculate points based on rank
    let points = 0;
    switch (rank) {
      case 1: points = 100; break;
      case 2: points = 75; break;
      case 3: points = 50; break;
      default: points = Math.max(25 - (rank - 4) * 5, 10);
    }
    
    // Bonus points for achievements
    if (achievements && achievements.length > 0) {
      points += achievements.length * 10;
    }
    
    const result = new CompetitionResult({
      student: studentId,
      competition: competitionId,
      rank,
      score,
      points,
      category,
      achievements: achievements || []
    });
    
    await result.save();
    
    res.json(result);
  } catch (error) {
    console.error('Error adding competition result:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get available categories
router.get('/categories', auth, async (req, res) => {
  try {
    const categories = await CompetitionResult.distinct('category');
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
