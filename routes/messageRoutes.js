import express from 'express';
import { sendMessage, getChatHistory, getDoctorChats } from '../controllers/messageController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Protected routes - require authentication
router.post('/send', auth, sendMessage);
router.get('/history/:otherUserId', auth, getChatHistory);
router.get('/doctor/chats', auth, getDoctorChats);

export default router;