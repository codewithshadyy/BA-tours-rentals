


// backend/routes/contact.js
const express = require('express');
const router = express.Router();
const Contact = require('../models/contact');
const { authenticateToken, requireRole } = require('../middleware/auth');

// ✅ Public route — client sends message
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message)
      return res.status(400).json({ message: 'All fields are required.' });

    const contact = new Contact({ name, email, message });
    await contact.save();
    res.status(201).json({ message: 'Message sent successfully.' });
  } catch (err) {
    console.error('Error saving message:', err);
    res.status(500).json({ message: 'Server error while saving message.' });
  }
});

// ✅ Admin route — get all messages
router.get('/', authenticateToken, requireRole('Admin'), async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ message: 'Server error while fetching messages.' });
  }
});

// ✅ Admin route — update message status
router.post('/:id/status', authenticateToken, requireRole('Admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const contact = await Contact.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!contact) return res.status(404).json({ message: 'Message not found.' });
    res.json(contact);
  } catch (err) {
    console.error('Error updating message status:', err);
    res.status(500).json({ message: 'Server error while updating status.' });
  }
});

module.exports = router;
