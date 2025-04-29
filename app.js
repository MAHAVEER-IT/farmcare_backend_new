import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import multer from 'multer';

import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';
import userDetailsRoutes from './routes/userDetailsRoutes.js';
import commentsRoutes from './routes/commentsRoutes.js';
import photoRoutes from './routes/photoRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import channelRoutes from './routes/channelRoutes.js';
import routesInfo from './routes/routesInfo.js';
import petRoutes from './routes/petRoutes.js';
import { auth } from './middleware/auth.js';
import { initNotificationScheduler } from './services/notificationService.js';
import diseasePointRoutes from './routes/diseasePointRoutes.js';
import shareRoutes from './routes/shareRoutes.js';

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '50mb',
  parameterLimit: 50000 
}));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
const voiceDir = path.join(uploadsDir, 'voice');

if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create voice uploads directory if it doesn't exist
if (!fs.existsSync(voiceDir)){
    fs.mkdirSync(voiceDir, { recursive: true });
    console.log('Created voice uploads directory');
}

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadsDir));

// Enable logging for file uploads
app.use((req, res, next) => {
  if (req.path.includes('/photos/upload')) {
    console.log('Upload request received:', {
      method: req.method,
      path: req.path,
      headers: req.headers,
      body: req.body
    });
  }
  console.log(`${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  next();
});

// Error handling middleware - place this before routes
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError || err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'Payload too large'
    });
  }
  next(err);
});

// Routes
// Public routes
app.use("/api/v1/auth", authRoutes);

// Protected routes - require authentication
app.use("/api/v1/posts", auth, postRoutes);
app.use("/api/v1/userdetails", auth, userDetailsRoutes);
app.use("/api/v1/comments", auth, commentsRoutes);
app.use("/api/v1/photos", auth, photoRoutes);
app.use("/api/v1/message", auth, messageRoutes);
app.use("/api/v1/channel", auth, channelRoutes);
app.use("/api/v1/pets", auth, petRoutes);
app.use("/api/v1/disease-points", auth, diseasePointRoutes);
app.use("/api/v1/share", shareRoutes);
app.use(routesInfo);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

initNotificationScheduler();

export default app;


function authenticationToken(req,res,next){

    const token =req.header("Authorization")?.split(" ")[1];
    if(!token)return res.sendStatus(401).json({message:"null token"});

    jwt.verify(token,secretKey,(err,user)=>{
        if(err) return res.status(403).json({message:"invalid token"});
        
        req.user=user;
        next();
    })
}

