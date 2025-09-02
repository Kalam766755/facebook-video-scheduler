const express = require('express');
const auth = require('../middleware/auth');
const Account = require('../models/Account');
const Page = require('../models/Page');

const router = express.Router();

// Get all accounts for user
router.get('/', auth, async (req, res) => {
  try {
    const accounts = await Account.find({ userId: req.user.id });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new account
router.post('/', auth, async (req, res) => {
  try {
    const { name, appId, appSecret, accessToken } = req.body;
    
    // Check account limit (max 5)
    const accountCount = await Account.countDocuments({ userId: req.user.id });
    if (accountCount >= 5) {
      return res.status(400).json({ message: 'Maximum 5 accounts allowed' });
    }
    
    const account = new Account({
      userId: req.user.id,
      name,
      appId,
      appSecret,
      accessToken
    });
    
    await account.save();
    res.status(201).json(account);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get pages for account
router.get('/:accountId/pages', auth, async (req, res) => {
  try {
    const pages = await Page.find({ 
      accountId: req.params.accountId,
      userId: req.user.id 
    });
    res.json(pages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add page to account
router.post('/:accountId/pages', auth, async (req, res) => {
  try {
    const { name, pageId, accessToken } = req.body;
    
    // Check page limit (max 10 per account)
    const pageCount = await Page.countDocuments({ 
      accountId: req.params.accountId,
      userId: req.user.id 
    });
    
    if (pageCount >= 10) {
      return res.status(400).json({ message: 'Maximum 10 pages per account allowed' });
    }
    
    const page = new Page({
      accountId: req.params.accountId,
      userId: req.user.id,
      name,
      pageId,
      accessToken
    });
    
    await page.save();
    res.status(201).json(page);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
