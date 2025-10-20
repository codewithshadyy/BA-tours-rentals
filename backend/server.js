


// backend/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const authRoutes = require('./routes/auth');
const clientRoutes = require('./routes/client');
const adminRoutes = require('./routes/admin');
const  contactRoutes = require('./routes/contact');
const forceClientRole = ('./middleware/forceClientRole.js')



const app = express();
app.use(cors());
app.use(bodyParser.json());
// app.use(forceClientRole);

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} body:`, req.body);
  next();
});

// connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://laylakoeh62_db_user:UzgmnipKmd5MGSGC@cluster0.ywvsngw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(MONGO_URI)
  .then(()=> console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);

// simple root
app.get('/', (req, res) => res.send('Tours and Rental App'));

const PORT = process.env.PORT || 5050;
app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`));
