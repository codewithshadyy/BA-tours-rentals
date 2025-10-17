const express = require("express");
const Contact = require ('../models/contact.js');
const { authenticateToken, requireRole } = require('../middleware/auth.js'); // adjust to your auth

const router = express.Router();

// Client submits contact form
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message)
      return res.status(400).json({ message: 'All fields required.' });

    const newMsg = new Contact({ name, email, message });
    await newMsg.save();
    res.status(200).json({ message: 'Message received!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Admin view all messages
router.get('/', authenticateToken, requireRole , async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Error loading messages.' });
  }
});

// Admin update message status
router.post('/:id/status', authenticateToken, requireRole , async (req, res) => {
  try {
    const { status } = req.body;
    await Contact.findByIdAndUpdate(req.params.id, { status });
    res.json({ message: 'Status updated.' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating status.' });
  }
});

module.exports = router;

