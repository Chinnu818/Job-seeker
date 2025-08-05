const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Post = require('../models/Post');
const User = require('../models/User');

const router = express.Router();

// Middleware to get user from token
const auth = async (req, res, next) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error(err.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post('/', auth, [
  body('content.text', 'Post content is required').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      content,
      type = 'general',
      visibility = 'public',
      tags = [],
      mentions = [],
      hashtags = [],
      job
    } = req.body;

    // Extract hashtags from content
    const extractedHashtags = content.text.match(/#\w+/g) || [];
    const finalHashtags = [...new Set([...hashtags, ...extractedHashtags])];

    const post = new Post({
      author: req.user.id,
      content,
      type,
      visibility,
      tags,
      mentions,
      hashtags: finalHashtags,
      job
    });

    await post.save();
    
    // Populate author info
    await post.populate('author', 'profile.firstName profile.lastName profile.avatar');
    
    res.json({
      message: 'Post created successfully',
      post
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/posts
// @desc    Get all posts (feed) with advanced filtering
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      author,
      tags,
      hashtags,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {
      isDeleted: false,
      $or: [
        { visibility: 'public' },
        { author: req.user.id },
        { author: { $in: req.user.connections } }
      ]
    };

    if (type) {
      filter.type = type;
    }

    if (author) {
      filter.author = author;
    }

    if (tags) {
      const tagsArray = tags.split(',').map(tag => tag.trim());
      filter.tags = { $in: tagsArray };
    }

    if (hashtags) {
      const hashtagsArray = hashtags.split(',').map(hashtag => hashtag.trim());
      filter.hashtags = { $in: hashtagsArray };
    }

    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const posts = await Post.find(filter)
      .populate('author', 'profile.firstName profile.lastName profile.avatar profile.headline')
      .populate('likes.user', 'profile.firstName profile.lastName')
      .populate('comments.author', 'profile.firstName profile.lastName profile.avatar')
      .populate('job', 'title company.name')
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Post.countDocuments(filter);

    res.json({
      posts,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total,
      filters: {
        type,
        author,
        tags: tags ? tags.split(',') : [],
        hashtags: hashtags ? hashtags.split(',') : []
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/posts/:id
// @desc    Get post by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'firstName lastName avatar')
      .populate('likes', 'firstName lastName')
      .populate('comments.author', 'firstName lastName avatar');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/posts/:id/like
// @desc    Like/unlike a post
// @access  Private
router.put('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const likeIndex = post.likes.indexOf(req.user.id);
    
    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
    } else {
      // Like
      post.likes.push(req.user.id);
    }

    await post.save();
    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/posts/:id/comment
// @desc    Add comment to a post
// @access  Private
router.post('/:id/comment', auth, [
  body('content', 'Comment content is required').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const { content } = req.body;

    post.comments.push({
      author: req.user.id,
      content,
      createdAt: new Date()
    });

    await post.save();
    
    // Populate the new comment's author
    await post.populate('comments.author', 'firstName lastName avatar');
    
    res.json(post);
  } catch (err) {
    console.error(err.message);
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

    // Check if user owns the post
    if (post.author.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Soft delete
    post.isDeleted = true;
    post.deletedAt = new Date();
    await post.save();

    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET /api/posts/trending
// @desc    Get trending posts
// @access  Public
router.get('/trending', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const posts = await Post.findTrending(parseInt(limit));
    
    res.json({
      posts,
      count: posts.length
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/posts/hashtag/:hashtag
// @desc    Get posts by hashtag
// @access  Public
router.get('/hashtag/:hashtag', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const hashtag = req.params.hashtag;
    
    const posts = await Post.findByHashtag(hashtag)
      .populate('author', 'profile.firstName profile.lastName profile.avatar')
      .populate('likes.user', 'profile.firstName profile.lastName')
      .populate('comments.author', 'profile.firstName profile.lastName profile.avatar')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Post.countDocuments({ 
      hashtags: hashtag, 
      isDeleted: false 
    });

    res.json({
      posts,
      hashtag,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/posts/my-posts
// @desc    Get posts by current user
// @access  Private
router.get('/my-posts', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const posts = await Post.findByUser(req.user.id)
      .populate('author', 'profile.firstName profile.lastName profile.avatar')
      .populate('likes.user', 'profile.firstName profile.lastName')
      .populate('comments.author', 'profile.firstName profile.lastName profile.avatar')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Post.countDocuments({ 
      author: req.user.id, 
      isDeleted: false 
    });

    res.json({
      posts,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router; 