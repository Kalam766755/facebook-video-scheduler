const express = require('express');
const multer = require('multer');
const auth = require('../middleware/auth');
const Upload = require('../models/Upload');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Upload video
router.post('/', auth, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const upload = new Upload({
      user: req.user.id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size
    });
    
    await upload.save();
    res.status(201).json(upload);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all uploads for user
router.get('/', auth, async (req, res) => {
  try {
    const uploads = await Upload.find({ user: req.user.id });
    res.json(uploads);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete upload
router.delete('/:id', auth, async (req, res) => {
  try {
    const upload = await Upload.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!upload) {
      return res.status(404).json({ message: 'Upload not found' });
    }
    
    // Delete file from storage
    const fs = require('fs');
    fs.unlinkSync(upload.path);
    
    res.json({ message: 'Upload deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
