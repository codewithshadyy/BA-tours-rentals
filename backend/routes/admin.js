

// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const Property = require('../models/property');
const Booking = require('../models/booking');
const Report = require('../models/report');
const Messages = require('../models/contact')
const User =  require('../models/user')



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




//getting todays or all time reports 



router.get('/reports', authenticateToken, requireRole('Admin'), async (req, res) => {
  try {
    const filter = {};
    const { filterType } = req.query; // 'today' or 'all'

    if (filterType === 'today') {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      filter.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }

    const reports = await Report.find(filter)
      .populate('user')
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching reports' });
  }
});








// route toget todays or alltime reports


router.get('/bookings', authenticateToken, requireRole('Admin'), async (req, res) => {
  try {
    const filter = {};
    const { filterType } = req.query; // 'today' or 'all'

    if (filterType === 'today') {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      filter.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }

    const bookings = await Booking.find(filter)
      .populate('user')
      .populate('item')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching bookings' });
  }
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


   


//get all registered users


router.get('/users', authenticateToken, requireRole('Admin'), async (req, res) => {
  try {
    const users = await User.find({}, 'name email role createdAt')
      .sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Server error while fetching users.' });
  }
});









module.exports = router;
