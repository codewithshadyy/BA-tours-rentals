

// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const Property = require('../models/property');
const Booking = require('../models/booking');
const Report = require('../models/report');
const Messages = require('../models/contact')

// admin stats
router.get('/stats', authenticateToken, requireRole('Admin'), async (req, res) => {
  try {
    const properties = await Property.countDocuments();
    const bookings = await Booking.countDocuments();
    const reports = await Report.countDocuments();
    res.json({ properties, bookings, reports });
  } catch(err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
});

// inventory CRUD
router.get('/inventory', authenticateToken, requireRole('Admin'), async (req, res) => {
  try {
    const items = await Property.find().sort({ createdAt: -1 });
    res.json(items);
  } catch(err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
});

router.post('/inventory', authenticateToken, requireRole('Admin'), async (req, res) => {
  try {
    const item = await Property.create(req.body);
    res.json(item);
  } catch(err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
});

router.put('/inventory/:id', authenticateToken, requireRole('Admin'), async (req, res) => {
  try {
    const item = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(item);
  } catch(err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
});

router.delete('/inventory/:id', authenticateToken, requireRole('Admin'), async (req, res) => {
  try {
    await Property.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch(err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
});




router.get('/reports', authenticateToken, requireRole('Admin'), async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('user', 'name email') // show client name and email
      .sort({ createdAt: -1 });

    res.status(200).json(reports);
  } catch (err) {
    console.error('Error fetching reports:', err);
    res.status(500).json({ message: 'Server error while fetching client reports.' });
  }
});





// bookings (view and confirm/cancel)
router.get('/bookings', authenticateToken, requireRole('Admin'), async (req, res) => {
  try {
    const bookings = await Booking.find().populate('user').populate('item').sort({ createdAt: -1 });
    res.json(bookings);
  } catch(err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
});

router.post('/bookings/:id/confirm', authenticateToken, requireRole('Admin'), async (req, res) => {
  try {
    const b = await Booking.findByIdAndUpdate(req.params.id, { status: 'Confirmed' }, { new: true });
    res.json(b);
  } catch(err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
});

router.post('/bookings/:id/cancel', authenticateToken, requireRole('Admin'), async (req, res) => {
  try {
    const b = await Booking.findByIdAndUpdate(req.params.id, { status: 'Cancelled' }, { new: true });
    res.json(b);
  } catch(err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
});



// ------------------- FINANCE ROUTE -------------------
router.get("/finance", authenticateToken, requireRole("Admin"), async (req, res) => {
  try {
    const bookings = await Booking.find({ paymentStatus: "Paid" }).populate("user");

    // ---- Monthly revenue aggregation ----
    const monthlyTotals = {};
    bookings.forEach(b => {
      if (!b.total) return;
      const month = new Date(b.createdAt).toLocaleString("default", { month: "short", year: "numeric" });
      monthlyTotals[month] = (monthlyTotals[month] || 0) + b.total;
    });

    const months = Object.keys(monthlyTotals);
    const totals = Object.values(monthlyTotals);

    // ---- This month & all time totals ----
    const now = new Date();
    const thisMonth = now.toLocaleString("default", { month: "short", year: "numeric" });
    const totalThisMonth = monthlyTotals[thisMonth] || 0;
    const totalAllTime = totals.reduce((a, b) => a + b, 0);

    // ---- Paid transactions list ----
    const transactions = bookings.map(b => ({
      client: b.user?.name || "Unknown",
      email: b.user?.email,
      amount: b.total,
      method: b.paymentMethod,
      status: b.paymentStatus,
      date: b.createdAt
    }));

    res.json({ months, totals, totalThisMonth, totalAllTime, transactions });
  } catch (err) {
    console.error("Finance route error:", err);
    res.status(500).json({ message: "Server error loading finance data" });
  }
});



module.exports = router;
