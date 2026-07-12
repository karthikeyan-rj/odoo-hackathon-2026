require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const app = express();

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ── Routes ─────────────────────────────────────────────────────────────────────
const allocationRouter = require('./routes/allocation.routes');
app.use('/api/auth',               require('./routes/auth.routes'));
app.use('/api/users',              require('./routes/user.routes'));
app.use('/api/departments',        require('./routes/department.routes'));
app.use('/api/asset-categories',   require('./routes/assetCategory.routes'));
app.use('/api/assets',             require('./routes/asset.routes'));
app.use('/api/allocations',        allocationRouter);
app.use('/api/transfer-requests',  allocationRouter);
app.use('/api/bookings',           require('./routes/booking.routes'));
app.use('/api/maintenance',        require('./routes/maintenance.routes'));
app.use('/api/notifications',      require('./routes/notification.routes'));
app.use('/api/dashboard',          require('./routes/dashboard.routes'));

// ── 404 Handler ────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, data: null, message: 'Route not found' });
});

// ── Global Error Handler ────────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    data: null,
    message: err.message || 'Internal Server Error',
  });
});

// ── Start Server ────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
