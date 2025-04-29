import express from 'express';
import app from './app.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';
import ChannelMessage from './models/ChannelMessage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, 'config/config.env') });

const PORT = process.env.PORT || 8000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://mahaveer:mahaveer$310@cluster0.3fzbv.mongodb.net/farmcare';

// Create HTTP server
const httpServer = createServer(app);

// Create Socket.IO server
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join a chat room (for direct messages)
  socket.on('join_chat', (data) => {
    const roomId = [data.userId, data.doctorId].sort().join('_');
    socket.join(roomId);
    console.log(`User ${data.userId} joined room ${roomId}`);
  });

  // Join a channel room
  socket.on('join_channel', (channelId) => {
    socket.join(`channel_${channelId}`);
    console.log(`User joined channel ${channelId}`);
  });

  // Handle direct messages
  socket.on('send_message', async (data) => {
    const roomId = [data.senderId, data.receiverId].sort().join('_');
    io.to(roomId).emit('receive_message', data);
  });

  // Handle channel messages
  socket.on('send_channel_message', async (data) => {
    try {
      const { channelId, senderId, content } = data;
      
      // Save message to database
      const message = new ChannelMessage({
        channelId,
        senderId,
        content
      });
      await message.save();

      // Broadcast to channel
      io.to(`channel_${channelId}`).emit('receive_channel_message', {
        ...data,
        timestamp: message.timestamp,
        _id: message._id
      });
    } catch (error) {
      console.error('Error saving channel message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('MongoDB Connected...');
  // Listen on HTTP server instead of app
  httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});
