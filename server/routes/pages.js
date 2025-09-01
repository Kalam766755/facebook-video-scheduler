const express = require('express');
const auth = require('../middleware/auth');
const FbPage = require('../models/FbPage');
const FbAccount = require('../models/FbAccount');
const router = express.Router();

// Get all pages for account
router.get('/:accountId', auth, async (req, res) => {
  try {
    // Verify account belongs to user
    const account = await FbAccount.findOne({
      _id: req.params.accountId,
      user: req.user.id
    });
    
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }
    
    const pages = await FbPage.find({ account: req.params.accountId });
    res.json(pages);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new page
router.post('/', auth, async (req, res) => {
  try {
    const { accountId, name, appId, appSecret, pageToken } = req.body;
    
    // Verify account belongs to user
    const account = await FbAccount.findOne({
      _id: accountId,
      user: req.user.id
    });
    
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }
    
    // Check if user already has 10 pages for this account
    const pageCount = await FbPage.countDocuments({ account: accountId });
    if (pageCount >= 10) {
      return res.status(400).json({ message: 'Maximum 10 pages per account allowed' });
    }
    
    const page = new FbPage({
      user: req.user.id,
      account: accountId,
      name,
      appId,
      appSecret,
      pageToken
    });
    
    await page.save();
    res.status(201).json(page);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update page
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, appId, appSecret, pageToken } = req.body;
    
    const page = await FbPage.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { name, appId, appSecret, pageToken },
      { new: true }
    );
    
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    
    res.json(page);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete page
router.delete('/:id', auth, async (req, res) => {
  try {
    const page = await FbPage.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    
    res.json({ message: 'Page deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
