const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);

const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

console.log('🚦 CORS allowed origin:', FRONTEND_URL);

// Add multiple allowed origins for development
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

// Socket.IO server
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  },
});

// Security middleware
app.use(helmet({ contentSecurityPolicy: false }));

// ✅ Correct CORS setup
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed origins
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    
    // For production, also allow the configured FRONTEND_URL
    if (origin === FRONTEND_URL) {
      return callback(null, true);
    }
    
    console.log('❌ CORS blocked origin:', origin);
    return callback(new Error('❌ Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Serve static files
app.use('/uploads', express.static('uploads'));
app.use('/static', express.static('public'));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ MongoDB connected');
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
});

// Routes
app.use('/api/auth', require('./routes/auth'));
// Add other routes as needed

// Socket.IO handlers
io.on('connection', (socket) => {
  console.log('🟢 Socket connected:', socket.id);
  socket.on('join-room', (roomId) => socket.join(roomId));
  socket.on('disconnect', () => console.log('🔴 Socket disconnected:', socket.id));
});

// Frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
  });
} else {
  app.use('*', (req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});
