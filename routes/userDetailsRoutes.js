import express from 'express';
import { 
    updateUserDetails, 
    getUserDetails, 
    addFollower, 
    addHistory 
} from '../controllers/userDetailsController.js';

const router = express.Router();

// User details routes
router.get('/:userId', getUserDetails);
router.put('/:userId', updateUserDetails);

// Follower routes
router.post('/:userId/followers', addFollower);

// History routes
router.post('/:userId/history', addHistory);

export default router;
