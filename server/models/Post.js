const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FbAccount',
    required: true
  },
  page: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FbPage',
    required: true
  },
  upload: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Upload',
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'posted', 'failed'],
    default: 'scheduled'
  },
  scheduledTime: {
    type: Date,
    required: function() {
      return this.status === 'scheduled';
    }
  },
  postedAt: {
    type: Date
  },
  postId: {
    type: String
  },
  error: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Post', PostSchema);
