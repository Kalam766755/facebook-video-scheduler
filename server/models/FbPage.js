const mongoose = require('mongoose');
const CryptoJS = require('crypto-js');

const FbPageSchema = new mongoose.Schema({
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
  name: {
    type: String,
    required: true
  },
  appId: {
    type: String,
    required: true,
    set: (value) => CryptoJS.AES.encrypt(value, process.env.ENCRYPTION_KEY).toString()
  },
  appSecret: {
    type: String,
    required: true,
    set: (value) => CryptoJS.AES.encrypt(value, process.env.ENCRYPTION_KEY).toString()
  },
  pageToken: {
    type: String,
    required: true,
    set: (value) => CryptoJS.AES.encrypt(value, process.env.ENCRYPTION_KEY).toString()
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Decryption methods
FbPageSchema.methods.decryptAppId = function() {
  return CryptoJS.AES.decrypt(this.appId, process.env.ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
};

FbPageSchema.methods.decryptAppSecret = function() {
  return CryptoJS.AES.decrypt(this.appSecret, process.env.ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
};

FbPageSchema.methods.decryptPageToken = function() {
  return CryptoJS.AES.decrypt(this.pageToken, process.env.ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
};

module.exports = mongoose.model('FbPage', FbPageSchema);
