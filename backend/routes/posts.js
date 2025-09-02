const express = require('express');
const auth = require('../middleware/auth');
const Post = require('../models/Post');
const Video = require('../models/Video');
const Page = require('../models/Page');

const router = express.Router();

// Post now
router.post('/now', auth, async (req, res) => {
  try {
    const { videoId, pageId, caption } = req.body;
    
    const post = new Post({
      userId: req.user.id,
      videoId,
      pageId,
      caption,
      status: 'published'
    });
    
    await post.save();
    
    // TODO: Implement actual Facebook posting logic
    
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Schedule post
router.post('/schedule', auth, async (req, res) => {
  try {
    const { videoId, pageId, caption, scheduledTime } = req.body;
    
    const post = new Post({
      userId: req.user.id,
      videoId,
      pageId,
      caption,
      scheduledTime: new Date(scheduledTime),
      status: 'scheduled'
    });
    
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get post history
router.get('/history', auth, async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.user.id })
      .populate('videoId', 'originalName')
      .populate('pageId', 'name')
      .sort({ createdAt: -1 });
    
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
