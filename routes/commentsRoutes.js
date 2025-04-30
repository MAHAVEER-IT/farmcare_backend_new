import express from 'express';
import { getComments, createComment, likeComment, getReplies, createReply } from '../controllers/commentsController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use((req, res, next) => {
  console.log('Comments route accessed:', req.path);
  next();
}, auth);

// Get comments for a post
router.get('/:postId', async (req, res, next) => {
  try {
    await getComments(req, res);
  } catch (error) {
    next(error);
  }
});

// Create a new comment
router.post('/create', async (req, res, next) => {
  try {
    await createComment(req, res);
  } catch (error) {
    next(error);
  }
});

// Like a comment
router.post('/:commentId/like', async (req, res, next) => {
  try {
    await likeComment(req, res);
  } catch (error) {
    next(error);
  }
});

// Get replies for a comment
router.get('/:commentId/replies', async (req, res, next) => {
  try {
    await getReplies(req, res);
  } catch (error) {
    next(error);
  }
});

// Create a reply to a comment
router.post('/:commentId/reply', async (req, res, next) => {
  try {
    await createReply(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
