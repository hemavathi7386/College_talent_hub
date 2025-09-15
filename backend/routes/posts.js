const express = require('express');
const { body, validationResult } = require('express-validator');
const Post = require('../models/Post');
const { auth } = require('../middleware/auth');
const { createPostNotification } = require('../utils/notifications');
const emailService = require('../services/emailService');

const router = express.Router();

// @route   POST /api/posts
// @desc    Create a post
// @access  Private
router.post('/', [auth, [
  body('description').notEmpty().withMessage('Description is required')
]], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { description, media, mediaType, tags } = req.body;

    const post = new Post({
      user: req.user.id,
      description,
      media: media || '',
      mediaType: mediaType || '',
      tags: tags || []
    });

    await post.save();
    await post.populate('user', 'name email role department');

    // Create notifications for all students if post is from faculty/recruiter
    await createPostNotification(post, req.user);

    // Send email notifications to all users in background
    setTimeout(async () => {
      try {
        await emailService.sendPostNotification(post, req.user);
      } catch (error) {
        console.error('Error sending post emails:', error);
      }
    }, 100);

    res.status(201).json(post);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/posts
// @desc    Get all posts
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .populate('user', 'name email role department profilePicture')
      .populate('comments.user', 'name email role department')
      .populate('likes.user', 'name email role department')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments();

    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/posts/:id
// @desc    Get post by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'name email role department profilePicture')
      .populate('comments.user', 'name email role department')
      .populate('likes.user', 'name email role department');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/posts/:id/like
// @desc    Like/Unlike a post
// @access  Private
router.put('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if post is already liked by user
    const likeIndex = post.likes.findIndex(like => 
      like.user.toString() === req.user.id
    );

    if (likeIndex > -1) {
      // Unlike the post
      post.likes.splice(likeIndex, 1);
    } else {
      // Like the post
      post.likes.push({ user: req.user.id });
    }

    await post.save();
    await post.populate([
      { path: 'user', select: 'name email role department profilePicture' },
      { path: 'comments.user', select: 'name email role department' },
      { path: 'likes.user', select: 'name email role department' }
    ]);

    res.json(post);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST /api/posts/:id/comment
// @desc    Add comment to post
// @access  Private
router.post('/:id/comment', [auth, [
  body('text').notEmpty().withMessage('Comment text is required')
]], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const newComment = {
      user: req.user.id,
      text: req.body.text
    };

    post.comments.push(newComment);
    await post.save();
    
    // Populate the entire post with user data
    await post.populate([
      { path: 'user', select: 'name email role department profilePicture' },
      { path: 'comments.user', select: 'name email role department' },
      { path: 'likes.user', select: 'name email role department' }
    ]);

    // Return the newly added comment with populated user data
    const addedComment = post.comments[post.comments.length - 1];
    res.json(addedComment);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user owns the post or is admin
    if (post.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({ message: 'Post removed' });
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;
