const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const CryptoJS = require('crypto-js');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: ['https://kalam766755.github.io', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// MongoDB Connection - Direct string use karein
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://kalam764499:kalam764499@cluster0.knagk4o.mongodb.net/facebook_scheduler?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected Successfully'))
.catch(err => {
  console.log('MongoDB Connection Error:', err);
  console.log('Using connection string:', MONGODB_URI);
});

// Database Models
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', UserSchema);

const FbAccountSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const FbAccount = mongoose.model('FbAccount', FbAccountSchema);

const FbPageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  account: { type: mongoose.Schema.Types.ObjectId, ref: 'FbAccount', required: true },
  name: { type: String, required: true },
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
  createdAt: { type: Date, default: Date.now }
});

FbPageSchema.methods.decryptAppId = function() {
  return CryptoJS.AES.decrypt(this.appId, process.env.ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
};

FbPageSchema.methods.decryptAppSecret = function() {
  return CryptoJS.AES.decrypt(this.appSecret, process.env.ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
};

FbPageSchema.methods.decryptPageToken = function() {
  return CryptoJS.AES.decrypt(this.pageToken, process.env.ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
};

const FbPage = mongoose.model('FbPage', FbPageSchema);

const UploadSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  path: { type: String, required: true },
  size: { type: Number, required: true },
  uploadedAt: { type: Date, default: Date.now }
});

const Upload = mongoose.model('Upload', UploadSchema);

const PostSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  account: { type: mongoose.Schema.Types.ObjectId, ref: 'FbAccount', required: true },
  page: { type: mongoose.Schema.Types.ObjectId, ref: 'FbPage', required: true },
  upload: { type: mongoose.Schema.Types.ObjectId, ref: 'Upload', required: true },
  status: { type: String, enum: ['scheduled', 'posted', 'failed'], default: 'scheduled' },
  scheduledTime: { type: Date },
  postedAt: { type: Date },
  postId: { type: String },
  error: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const Post = mongoose.model('Post', PostSchema);

// Auth Middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId).select('-password');
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// File Upload Setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

// Routes
app.get('/api/auth/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const user = new User({ email, password });
    await user.save();
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });
    
    res.status(201).json({ 
      token, 
      user: { 
        id: user._id, 
        email: user.email 
      } 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });
    
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        email: user.email 
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Accounts Routes
app.get('/api/accounts', auth, async (req, res) => {
  try {
    const accounts = await FbAccount.find({ user: req.user._id });
    res.json(accounts);
  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/accounts', auth, async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Account name is required' });
    }
    
    const accountCount = await FbAccount.countDocuments({ user: req.user._id });
    if (accountCount >= 5) {
      return res.status(400).json({ message: 'Maximum 5 accounts allowed' });
    }
    
    const account = new FbAccount({ user: req.user._id, name });
    await account.save();
    
    res.status(201).json(account);
  } catch (error) {
    console.error('Create account error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/accounts/:id', auth, async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Account name is required' });
    }
    
    const account = await FbAccount.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { name },
      { new: true }
    );
    
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }
    
    res.json(account);
  } catch (error) {
    console.error('Update account error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.delete('/api/accounts/:id', auth, async (req, res) => {
  try {
    const account = await FbAccount.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }
    
    // Delete associated pages
    await FbPage.deleteMany({ account: req.params.id });
    
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Pages Routes
app.get('/api/pages', auth, async (req, res) => {
  try {
    const pages = await FbPage.find({ user: req.user._id }).populate('account');
    res.json(pages);
  } catch (error) {
    console.error('Get pages error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/pages', auth, async (req, res) => {
  try {
    const { accountId, name, appId, appSecret, pageToken } = req.body;
    
    if (!accountId || !name || !appId || !appSecret || !pageToken) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Verify account belongs to user
    const account = await FbAccount.findOne({
      _id: accountId,
      user: req.user._id
    });
    
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }
    
    const pageCount = await FbPage.countDocuments({ account: accountId });
    if (pageCount >= 10) {
      return res.status(400).json({ message: 'Maximum 10 pages per account allowed' });
    }
    
    const page = new FbPage({
      user: req.user._id,
      account: accountId,
      name,
      appId,
      appSecret,
      pageToken
    });
    
    await page.save();
    res.status(201).json(page);
  } catch (error) {
    console.error('Create page error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/pages/:id', auth, async (req, res) => {
  try {
    const { name, appId, appSecret, pageToken } = req.body;
    
    const page = await FbPage.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { name, appId, appSecret, pageToken },
      { new: true }
    );
    
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    
    res.json(page);
  } catch (error) {
    console.error('Update page error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.delete('/api/pages/:id', auth, async (req, res) => {
  try {
    const page = await FbPage.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    
    res.json({ message: 'Page deleted successfully' });
  } catch (error) {
    console.error('Delete page error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Upload Routes
app.post('/api/upload', auth, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const upload = new Upload({
      user: req.user._id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size
    });
    
    await upload.save();
    res.status(201).json(upload);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/upload', auth, async (req, res) => {
  try {
    const uploads = await Upload.find({ user: req.user._id });
    res.json(uploads);
  } catch (error) {
    console.error('Get uploads error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.delete('/api/upload/:id', auth, async (req, res) => {
  try {
    const upload = await Upload.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!upload) {
      return res.status(404).json({ message: 'Upload not found' });
    }
    
    // Delete file from storage
    if (fs.existsSync(upload.path)) {
      fs.unlinkSync(upload.path);
    }
    
    res.json({ message: 'Upload deleted successfully' });
  } catch (error) {
    console.error('Delete upload error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Posts Routes
app.get('/api/posts', auth, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user._id })
      .populate('account')
      .populate('page')
      .populate('upload');
    
    res.json(posts);
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/posts', auth, async (req, res) => {
  try {
    const { accountId, pageId, uploadId, scheduledTime } = req.body;
    
    if (!accountId || !pageId || !uploadId) {
      return res.status(400).json({ message: 'Account, page and upload are required' });
    }
    
    // Verify page belongs to user
    const page = await FbPage.findOne({
      _id: pageId,
      user: req.user._id
    });
    
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    
    let status = 'scheduled';
    let postedAt = null;
    
    if (!scheduledTime) {
      status = 'posted';
      postedAt = new Date();
    }
    
    const post = new Post({
      user: req.user._id,
      account: accountId,
      page: pageId,
      upload: uploadId,
      status,
      scheduledTime: scheduledTime || new Date(),
      postedAt
    });
    
    await post.save();
    
    // TODO: Implement Facebook posting logic here
    
    res.status(201).json(post);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.delete('/api/posts/:id', auth, async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Debug endpoint
app.get('/api/debug', (req, res) => {
  res.json({
    message: 'Debug endpoint',
    mongodb_uri: process.env.MONGODB_URI ? 'Set in env' : 'Not set in env',
    connection_status: mongoose.connection.readyState,
    ready_state: {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    }[mongoose.connection.readyState],
    encryption_key: process.env.ENCRYPTION_KEY ? 'Set' : 'Not set',
    jwt_secret: process.env.JWT_SECRET ? 'Set' : 'Not set'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});
