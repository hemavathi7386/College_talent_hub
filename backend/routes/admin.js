const express = require('express');
const User = require('../models/User');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/admin/users
// @desc    Get all users with pagination and filtering
// @access  Admin only
router.get('/users', auth, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const query = {};
    
    // Filter by role if specified
    if (role && role !== 'all') {
      query.role = role;
    }
    
    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await User.countDocuments(query);
    
    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/admin/stats
// @desc    Get user statistics
// @access  Admin only
router.get('/stats', auth, adminOnly, async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const totalUsers = await User.countDocuments();
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });
    
    res.json({
      totalUsers,
      recentUsers,
      roleStats: stats
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/admin/users/:id
// @desc    Get user by ID
// @access  Admin only
router.get('/users/:id', auth, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user account
// @access  Admin only
router.delete('/users/:id', auth, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    
    // Prevent deleting other admins
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin accounts' });
    }
    
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/admin/users/:id/status
// @desc    Update user verification status
// @access  Admin only
router.put('/users/:id/status', auth, adminOnly, async (req, res) => {
  try {
    const { isVerified } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user information
// @access  Admin only
router.put('/users/:id', auth, adminOnly, async (req, res) => {
  try {
    const { name, email, department, company, skills } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (department) user.department = department;
    if (company) user.company = company;
    if (skills) user.skills = skills;
    
    await user.save();
    
    const updatedUser = await User.findById(req.params.id).select('-password');
    res.json(updatedUser);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
