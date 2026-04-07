const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./config/db');

const app = express();
const PORT = process.env.Port || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Routes
const authRoutes = require('./routes/authRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const groupRoutes = require('./routes/groupRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

app.use('/api', authRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/payments', paymentRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`Server http://localhost:${PORT} portida ishga tushdi.`);
});
