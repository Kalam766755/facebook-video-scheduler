const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: true
  },
  pageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Page',
    required: true
  },
  caption: {
    type: String,
    default: ''
  },
  scheduledTime: {
    type: Date
  },
  status: {
    type: String,
    enum: ['scheduled', 'published', 'failed'],
    default: 'scheduled'
  },
  publishedAt: {
    type: Date
  },
  facebookPostId: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Post', postSchema);
