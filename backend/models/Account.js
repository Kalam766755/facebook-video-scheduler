const mongoose = require('mongoose');
const CryptoJS = require('crypto-js');

const accountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  appId: {
    type: String,
    required: true
  },
  appSecret: {
    type: String,
    required: true,
    set: function(value) {
      return CryptoJS.AES.encrypt(value, process.env.ENCRYPTION_KEY).toString();
    }
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

accountSchema.methods.getAppSecret = function() {
  return CryptoJS.AES.decrypt(this.appSecret, process.env.ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
};

accountSchema.methods.getAccessToken = function() {
  return CryptoJS.AES.decrypt(this.accessToken, process.env.ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
};

module.exports = mongoose.model('Account', accountSchema);
