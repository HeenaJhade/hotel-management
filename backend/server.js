require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const connectDB = require('./src/config/db');

const uploadRoutes = require("./src/routes/upload.routes");
const authRoutes        = require('./src/routes/auth.routes');
const adminRoutes       = require('./src/routes/admin.routes');
const staffRoutes       = require('./src/routes/staff.routes');
const roomRoutes        = require('./src/routes/rooms.routes');
const bookingRoutes     = require('./src/routes/bookings.routes');
const notificationRoutes = require('./src/routes/notifications.routes');
const profileRoutes     = require('./src/routes/profile.routes');
const reportRoutes      = require('./src/routes/reports.routes');
const paymentRoutes = require("./src/routes/payment.routes");
const { stripeWebhook } = require("./src/controllers/stripe.webhook.controller");


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

const PORT = process.env.PORT || 8001;

// ────────────────────────────────────────────────
// Middleware
// ────────────────────────────────────────────────
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.CORS_ORIGIN
    : 'http://localhost:3000',
  credentials: true,
}));
// 1️⃣ Keep this first
app.post(
  "/api/webhook/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

// 2️⃣ All other routes use normal body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ────────────────────────────────────────────────
// Database
// ────────────────────────────────────────────────
connectDB();

// ────────────────────────────────────────────────
// Routes
// ────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api", uploadRoutes);

// Health check
app.get('/api', (req, res) => {
  res.json({
    message: 'HM Management API is running',
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// ────────────────────────────────────────────────
// Socket.IO
// ────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('join', (userId) => {
    if (userId) {
      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined room user_${userId}`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Make io accessible in controllers/middleware
app.set('io', io);

// ────────────────────────────────────────────────
// Start Server
// ────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});