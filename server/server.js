require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');
const socketStore = require('./config/socket');

// Connect to MongoDB
connectDB();

const app = express();
const httpServer = http.createServer(app);

// ── Socket.io ──────────────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
  },
});

// JWT auth middleware for sockets
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('No token'));
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  // Each user joins their own room so we can emit to specific users
  socket.join(`user:${socket.user.id}`);
  socket.join('broadcast'); // for org-wide events
  console.log(`[Socket] User ${socket.user.id} connected`);

  socket.on('disconnect', () => {
    console.log(`[Socket] User ${socket.user.id} disconnected`);
  });
});

// Make io accessible to services
socketStore.init(io);

// ── Express Middleware ─────────────────────────────────────────────────────────
app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173', credentials: true }));
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
app.use('/api/audits',             require('./routes/audit.routes'));
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
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
