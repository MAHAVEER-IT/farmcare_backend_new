import express from 'express';
import { sendMessage, getChatHistory, getDoctorChats, sendVoiceMessage } from '../controllers/messageController.js';
import { auth } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configure multer for voice message storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/voice');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'voice-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept audio files only
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed!'), false);
    }
  }
});

// Protected routes - require authentication
router.post('/send', auth, sendMessage);
router.post('/voice', auth, upload.single('voiceFile'), sendVoiceMessage);
router.get('/history/:otherUserId', auth, getChatHistory);
router.get('/doctor/chats', auth, getDoctorChats);

export default router;
