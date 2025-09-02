const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const CryptoJS = require('crypto-js');
const cors = require('cors');
const cron = require('node-cron');
const axios = require('axios');
const FormData = require('form-data');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fb-video-scheduler', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// MongoDB Models
const User = require('./models/User');
const Account = require('./models/Account');
const Page = require('./models/Page');
const Video = require('./models/Video');
const Post = require('./models/Post');

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/accounts', require('./routes/accounts'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/posts', require('./routes/posts'));

// Scheduled task to check for posts
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    const scheduledPosts = await Post.find({
      status: 'scheduled',
      scheduledTime: { $lte: now }
    }).populate('video page');
    
    for (const post of scheduledPosts) {
      try {
        // Post to Facebook
        await postToFacebook(post);
        post.status = 'published';
        await post.save();
        
        // Delete video from storage
        // Implementation depends on your storage solution
      } catch (error) {
        console.error('Error posting to Facebook:', error);
        post.status = 'failed';
        await post.save();
      }
    }
  } catch (error) {
    console.error('Error in scheduled task:', error);
  }
});

async function postToFacebook(post) {
  // Implementation for posting to Facebook using Graph API
  // This will depend on your specific setup and requirements
  console.log('Posting to Facebook:', post);
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
