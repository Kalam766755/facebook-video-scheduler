const express = require('express');
const auth = require('../middleware/auth');
const Post = require('../models/Post');
const FbPage = require('../models/FbPage');
const axios = require('axios');
const router = express.Router();

// Get all posts for user
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user.id })
      .populate('account')
      .populate('page')
      .populate('upload');
    
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new post (schedule or post now)
router.post('/', auth, async (req, res) => {
  try {
    const { accountId, pageId, uploadId, scheduledTime } = req.body;
    
    // Verify page belongs to user
    const page = await FbPage.findOne({
      _id: pageId,
      user: req.user.id
    });
    
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    
    let status = 'scheduled';
    let postedAt = null;
    
    // If no scheduled time, post now
    if (!scheduledTime) {
      status = 'posted';
      postedAt = new Date();
    }
    
    const post = new Post({
      user: req.user.id,
      account: accountId,
      page: pageId,
      upload: uploadId,
      status,
      scheduledTime: scheduledTime || new Date(),
      postedAt
    });
    
    await post.save();
    
    // If posting now, make API call immediately
    if (status === 'posted') {
      await postToFacebook(post, page);
    }
    
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Function to post to Facebook
async function postToFacebook(post, page) {
  try {
    // Decrypt page credentials
    const appId = page.decryptAppId();
    const appSecret = page.decryptAppSecret();
    const pageToken = page.decryptPageToken();
    
    // Get upload details
    const Upload = require('../models/Upload');
    const upload = await Upload.findById(post.upload);
    
    // Make API call to Facebook
    const formData = new FormData();
    formData.append('access_token', pageToken);
    formData.append('description', 'Check out this video!');
    formData.append('source', fs.createReadStream(upload.path));
    
    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${page.pageId}/videos`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    // Update post with Facebook post ID
    post.postId = response.data.id;
    post.status = 'posted';
    post.postedAt = new Date();
    await post.save();
    
    // Delete the uploaded file
    fs.unlinkSync(upload.path);
    await Upload.findByIdAndDelete(upload._id);
    
  } catch (error) {
    post.status = 'failed';
    post.error = error.message;
    await post.save();
  }
}

// Delete post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
