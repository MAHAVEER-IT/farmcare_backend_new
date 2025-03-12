import express from 'express';
import { createChannel, getAllChannels, joinChannel, leaveChannel, getChannelMessages } from '../controllers/channelController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/create', auth, createChannel);
router.get('/all', auth, getAllChannels);
router.post('/join/:channelId', auth, joinChannel);
router.post('/leave/:channelId', auth, leaveChannel);
router.get('/messages/:channelId', auth, getChannelMessages);

export default router; 