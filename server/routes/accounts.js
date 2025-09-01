const express = require('express');
const auth = require('../middleware/auth');
const FbAccount = require('../models/FbAccount');
const router = express.Router();

// Get all accounts for user
router.get('/', auth, async (req, res) => {
  try {
    const accounts = await FbAccount.find({ user: req.user.id });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new account
router.post('/', auth, async (req, res) => {
  try {
    // Check if user already has 5 accounts
    const accountCount = await FbAccount.countDocuments({ user: req.user.id });
    if (accountCount >= 5) {
      return res.status(400).json({ message: 'Maximum 5 accounts allowed' });
    }
    
    const { name } = req.body;
    const account = new FbAccount({ user: req.user.id, name });
    await account.save();
    
    res.status(201).json(account);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update account
router.put('/:id', auth, async (req, res) => {
  try {
    const { name } = req.body;
    const account = await FbAccount.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { name },
      { new: true }
    );
    
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }
    
    res.json(account);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete account
router.delete('/:id', auth, async (req, res) => {
  try {
    const account = await FbAccount.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }
    
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
