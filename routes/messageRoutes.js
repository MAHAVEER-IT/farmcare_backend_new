import express from 'express';
import { createMessage } from '../controllers/messageController.js';

const router = express.Router();

router.put('/message', createMessage);
// router.get('/getmessage/:user')
export default router;