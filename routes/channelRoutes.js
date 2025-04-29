import express from 'express';
import {
    createChannel,
    getAllChannels,
    joinChannel,
    leaveChannel,
    getChannelMessages,
    generateChannelShareUrl,
    getSharedChannel,
    generateShareLink,
    joinViaLink
} from '../controllers/channelController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// Share routes
router.post('/share/:channelId', generateChannelShareUrl);
router.get('/share/:shareToken', getSharedChannel);
router.post('/join/share', joinViaLink);

// Channel management routes
router.post('/create', createChannel);
router.get('/all', getAllChannels);
router.post('/join/:channelId', joinChannel);
router.post('/leave/:channelId', leaveChannel);
router.get('/messages/:channelId', getChannelMessages);

// Channel sharing routes
router.post('/generate-link/:channelId', generateShareLink);
router.post('/join-via-link', joinViaLink);

export default router;