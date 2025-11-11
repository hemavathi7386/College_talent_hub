const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
// Allow frontend origin via env for production; default to localhost for dev
const CLIENT_ORIGIN = process.env.FRONTEND_URL || process.env.CLIENT_ORIGIN || 'http://localhost:3000';
const io = socketIo(server, {
  cors: {
    origin: CLIENT_ORIGIN,
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/competitions', require('./routes/competitions'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/ai', require('./routes/aiMatching'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/email', require('./routes/email'));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 75000,
})
.then(() => console.log("MongoDB Connected"))
.catch(err => {
  console.error("MongoDB connection failed:", err.message);
  // Don't exit the process, let the app run without DB for now
});

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'College Talent Hub API is running!' });
});

// Health check endpoint for monitoring services
app.get('/api/health', (req, res) => {
  const healthCheck = {
    status: 'OK',
    uptime: process.uptime(),
    timestamp: Date.now(),
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  };
  res.status(200).json(healthCheck);
});

// Socket.io connection handling
const Message = require('./models/Message');
const User = require('./models/User');

// Initialize cron jobs
const { scheduleDailyRecommendations } = require('./jobs/dailyRecommendations');
scheduleDailyRecommendations();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user to their personal room
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  // Handle sending messages
  socket.on('send_message', async (data) => {
    try {
      const { senderId, receiverId, content, messageType = 'text' } = data;
      
      // Create conversation ID (consistent for both users)
      const conversationId = [senderId, receiverId].sort().join('_');
      
      // Save message to database
      const message = new Message({
        sender: senderId,
        receiver: receiverId,
        content,
        messageType,
        conversationId
      });
      
      await message.save();
      await message.populate('sender', 'name email role');
      await message.populate('receiver', 'name email role');
      
      // Send to both users
      io.to(receiverId).emit('receive_message', message);
      io.to(senderId).emit('message_sent', message);
      
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('message_error', { error: 'Failed to send message' });
    }
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    socket.to(data.receiverId).emit('user_typing', {
      senderId: data.senderId,
      isTyping: data.isTyping
    });
  });

  // Handle message read status
  socket.on('mark_read', async (data) => {
    try {
      await Message.updateMany(
        { sender: data.senderId, receiver: data.receiverId, isRead: false },
        { isRead: true, readAt: new Date() }
      );
      
      socket.to(data.senderId).emit('messages_read', {
        receiverId: data.receiverId
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  });

  // Handle message deletion
  socket.on('message_deleted', (data) => {
    // Notify all users in the conversation about the deletion
    io.to(data.conversationId.split('_')[0]).emit('message_deleted', data);
    io.to(data.conversationId.split('_')[1]).emit('message_deleted', data);
  });

  // Handle conversation clearing
  socket.on('conversation_cleared', (data) => {
    // Notify all users in the conversation that it was cleared
    io.to(data.conversationId.split('_')[0]).emit('conversation_cleared', data);
    io.to(data.conversationId.split('_')[1]).emit('conversation_cleared', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
