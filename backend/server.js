import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from'http';
import User from './src/models/User.js';
import { Server }from 'socket.io';
import {connectDB} from './src/config/db.js';
import { hashPassword } from './src/middleware/auth.middleware.js';
import uploadRoutes from "./src/routes/upload.routes.js";
import authRoutes from './src/routes/auth.routes.js';
import adminRoutes from './src/routes/admin.routes.js';
import staffRoutes from './src/routes/staff.routes.js';
import roomRoutes from './src/routes/rooms.routes.js';
import bookingRoutes from './src/routes/bookings.routes.js';
import notificationRoutes from './src/routes/notifications.routes.js';
import reportRoutes from './src/routes/reports.routes.js';
import paymentRoutes from "./src/routes/payment.routes.js";



const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

const PORT = process.env.PORT || 8001;

// ────────────────────────────────────────────────
// Middleware
// ────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));


// 2️⃣ All other routes use normal body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ────────────────────────────────────────────────
// Seed Admin (Runs Once)
// ────────────────────────────────────────────────
//

const seedAdmin = async () => {
  try {

    const exists = await User.findOne({ email: "admin11@hotel.com" });

    if (exists) {
      return;
    }

    const passwordHash = await hashPassword("Admin@21234");

    await User.create({
      name: "Admin",
      email: "admin11@hotel.com",
      passwordHash,
      phone: "+911234567891",
      role: "admin",
      isVerified: true
    });

    console.log("Admin created successfully");

  } catch (error) {
    console.log("Seed admin error:", error);
  }
};
// ────────────────────────────────────────────────
// Database
// ────────────────────────────────────────────────
connectDB().then(async () => {
  await seedAdmin();
});

// ────────────────────────────────────────────────
// Routes
// ────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/notifications", notificationRoutes);
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


  socket.on('join', (userId) => {
    if (userId) {
      socket.join(`user_${userId}`);
    
    }
  });

  socket.on('disconnect', () => {
 
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