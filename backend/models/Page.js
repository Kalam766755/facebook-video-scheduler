const mongoose = require('mongoose');
const CryptoJS = require('crypto-js');

const pageSchema = new mongoose.Schema({
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  pageId: {
    type: String,
    required: true
  },
  accessToken: {
    type: String,
    required: true,
    set: function(value) {
      return CryptoJS.AES.encrypt(value, process.env.ENCRYPTION_KEY).toString();
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

pageSchema.methods.getAccessToken = function() {
  return CryptoJS.AES.decrypt(this.accessToken, process.env.ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
};

module.exports = mongoose.model('Page', pageSchema); 
