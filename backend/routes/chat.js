const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Message = require('../models/Message');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Get conversation history between two users
router.get('/conversation/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;
    
    const conversationId = [currentUserId, userId].sort().join('_');
    
    const messages = await Message.find({ conversationId })
      .populate('sender', 'name email role')
      .populate('receiver', 'name email role')
      .sort({ createdAt: 1 })
      .limit(100);
    
    res.json(messages);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all conversations for current user
router.get('/conversations', auth, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    
    // Get all unique conversations
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: new mongoose.Types.ObjectId(currentUserId) },
            { receiver: new mongoose.Types.ObjectId(currentUserId) }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiver', new mongoose.Types.ObjectId(currentUserId)] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'lastMessage.sender',
          foreignField: '_id',
          as: 'senderInfo'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'lastMessage.receiver',
          foreignField: '_id',
          as: 'receiverInfo'
        }
      }
    ]);
    
    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get users available for chat - all users can chat with each other
router.get('/available-users', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    let availableUsers = [];
    
    if (currentUser.role === 'student') {
      // Students can chat with everyone (other students, recruiters, and faculty)
      availableUsers = await User.find({
        _id: { $ne: req.user.id }, // Exclude current user
        role: { $in: ['student', 'recruiter', 'faculty'] }
      }).select('name email role department skills');
    } else if (currentUser.role === 'recruiter') {
      // Recruiters can chat with students and faculty
      availableUsers = await User.find({
        _id: { $ne: req.user.id }, // Exclude current user
        role: { $in: ['student', 'faculty'] }
      }).select('name email role department skills');
    } else if (currentUser.role === 'faculty') {
      // Faculty can chat with students and recruiters
      availableUsers = await User.find({
        _id: { $ne: req.user.id }, // Exclude current user
        role: { $in: ['student', 'recruiter'] }
      }).select('name email role department skills');
    } else if (currentUser.role === 'admin') {
      // Admin can chat with everyone
      availableUsers = await User.find({
        _id: { $ne: req.user.id }, // Exclude current user
        role: { $in: ['student', 'recruiter', 'faculty'] }
      }).select('name email role department skills');
    }
    
    res.json(availableUsers);
  } catch (error) {
    console.error('Error fetching available users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark messages as read
router.put('/mark-read/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;
    
    await Message.updateMany(
      { sender: userId, receiver: currentUserId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a message
router.delete('/message/:messageId', auth, async (req, res) => {
  try {
    const { messageId } = req.params;
    const currentUserId = req.user.id;
    
    // Find the message and verify the user is the sender
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Only allow the sender to delete their own messages
    if (message.sender.toString() !== currentUserId) {
      return res.status(403).json({ message: 'You can only delete your own messages' });
    }
    
    await Message.findByIdAndDelete(messageId);
    
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear entire conversation
router.delete('/conversation/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;
    
    const conversationId = [currentUserId, userId].sort().join('_');
    
    // Delete all messages in this conversation
    const result = await Message.deleteMany({ conversationId });
    
    res.json({ 
      message: 'Conversation cleared successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error clearing conversation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
