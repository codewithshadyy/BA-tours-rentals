
// backend/routes/client.js
const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const Property = require('../models/property');
const Booking = require('../models/booking');
const Report = require('../models/report');

// get properties (with optional search q and type)
router.get('/properties', authenticateToken, requireRole('Client'), async (req, res) => {
  try {
    const { q, type } = req.query;
    const filter = {};
    if(type) filter.type = type;
    if(q) filter.title = { $regex: q, $options: 'i' };
    const items = await Property.find(filter).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error(err); res.status(500).json({ message: 'Server error' });
  }
});

// book an item



// make report
router.post('/report', authenticateToken, requireRole('Client'), async (req, res) => {
  try {
    const { title, message } = req.body;
    if(!title || !message) return res.status(400).json({ message: 'Missing fields' });
    const report = await Report.create({ user: req.user.id, title, message });
    res.json(report);
  } catch(err) {
    console.error(err); res.status(500).json({ message: 'Server error' });
  }
});


router.post('/book', authenticateToken, requireRole("Client"), async (req, res) => {
  try {
    const userId = req.user.id; // depends on your auth middleware
    const { itemId, startDate, endDate, adults = 1, children = 0, total = 0, phone, paymentMethod = 'M-Pesa', paymentStatus = 'Paid' } = req.body;

    const property = await Property.findById(itemId);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    // Optionally check slots
    if (property.slots <= 0) return res.status(400).json({ message: 'No slots remaining' });

    // create booking
    const booking = new Booking({
      user: userId,
      item: itemId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      adults: Number(adults),
      children: Number(children),
      total: Number(total),
      phone,
      paymentMethod,
      paymentStatus,
      status: 'Confirmed'
    });

    await booking.save();

    // decrement slots
    property.slots = (property.slots || 0) - 1;
    await property.save();

    console.log('Booking saved:', booking); // debug log
    return res.status(201).json({ message: 'Booking created', booking });
  } catch (err) {
    console.error('Book route error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});



module.exports = router;
