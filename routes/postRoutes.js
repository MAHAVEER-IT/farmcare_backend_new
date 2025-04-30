import express from 'express';
import {
    createPost,
    getPost,
    getPostsByUser,
    getAllPosts,
    updatePost,
    addLike,
    addRepost,
    addView,
    uploadImage,
    handleLike,
    filterPosts
} from '../controllers/postController.js';

const router = express.Router();

// Image upload route
router.post('/upload', uploadImage);

// Other existing routes
router.post('/createpost', createPost);
router.get('/getpost/:postId', getPost);
router.get('/getpost/user/:userId', getPostsByUser);
router.get('/getposts', async (req, res) => {
  try {
    const posts = await getAllPosts();
    
    if (!posts || posts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No posts found'
      });
    }

    return res.status(200).json({
      success: true,
      posts: posts
    });
  } catch (error) {
    console.error('Get posts error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching posts',
      error: error.message
    });
  }
});
router.put('/updatepost/:postId', updatePost);
router.put('/addlike/:postId', addLike);
router.put('/addrepost/:postId', addRepost);
router.put('/addview/:postId', addView);
router.post('/like', handleLike);

// Add this new route before export
router.get('/filter', filterPosts);

export default router;
