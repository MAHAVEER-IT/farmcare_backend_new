import express from 'express';
import { 
    shareWithDoctor, 
    shareWithChannel,
    getSharedContent 
} from '../controllers/shareController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Share content with doctor or channel
router.post('/doctor', auth, shareWithDoctor);
router.post('/channel', auth, shareWithChannel);

// Get shared content
router.get('/:type/:shareToken', getSharedContent);

export default router;