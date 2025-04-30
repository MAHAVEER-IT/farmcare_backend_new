import Post from '../models/Post.js';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure multer upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'), false);
    }
  }
}).single('image');

export const createPost = async (req, res) => {
  try {
    const { title, content, images, postType, authorName, userId } = req.body;

    if (!content || !title || !authorName) {
      return res.status(400).json({
        success: false,
        message: 'Title, content, and author name are required'
      });
    }

    const post = await Post.create({
      postId: uuidv4(),
      userId,
      title,
      content,
      authorName,
      images: images || [],
      postType: postType || 'farmUpdate',
      likeUsers: [],
      likeCount: 0,
      commentCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post: post
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating post',
      error: error.message
    });
  }
};

export const getPost = async (req, res) => {
    const { postId } = req.params;
    const post = await Post.findOne({ postId });

    if (!post) {
        return res.status(404).json({ message: "Post not found" });
    }

    return res.status(200).json({ post });
};

export const getPostsByUser = async (req, res) => {
    const { userId } = req.params;
    const posts = await Post.find({ userId });
    return res.status(200).json({ posts });
};

export const getAllPosts = async () => {
    try {
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .populate({
                path: 'userId',
                select: 'name username'
            })
            .lean()
            .exec();

        // Clean and transform the posts data
        return posts.map(post => {
            // Create a clean post object with safe property access
            const cleanPost = {
                _id: post._id ? post._id.toString() : '',
                postId: post.postId || '',
                title: post.title || '',
                content: post.content || '',
                images: Array.isArray(post.images) ? post.images : [],
                authorName: post.authorName || '',
                postType: post.postType || 'farmUpdate',
                userId: post.userId ? {
                    _id: post.userId._id ? post.userId._id.toString() : '',
                    name: post.userId.name || '',
                    username: post.userId.username || ''
                } : null,
                likeUsers: Array.isArray(post.likeUsers) ? post.likeUsers : [],
                likeCount: post.likeCount || 0,
                commentCount: post.commentCount || 0,
                createdAt: post.createdAt || new Date(),
                updatedAt: post.updatedAt || new Date()
            };

            // Remove any undefined or null values
            Object.keys(cleanPost).forEach(key => {
                if (cleanPost[key] === undefined || cleanPost[key] === null) {
                    delete cleanPost[key];
                }
            });

            return cleanPost;
        });
    } catch (error) {
        console.error('Get all posts error:', error);
        throw error;
    }
};

export const updatePost = async (req, res) => {
    const { postId } = req.params;
    const updateData = req.body;

    const updatedPost = await Post.findOneAndUpdate(
        { postId },
        { ...updateData, updatedAt: Date.now() },
        { new: true, runValidators: true }
    );

    if (!updatedPost) {
        return res.status(404).json({ message: "Post not found" });
    }

    return res.status(200).json({ message: "Post updated successfully", post: updatedPost });
};

export const addLike = async (req, res) => {
    const { postId } = req.params;
    const { likeUserId } = req.body;

    const updatedPost = await Post.findOneAndUpdate(
        { postId, likeUsers: { $ne: likeUserId } },
        { $push: { likeUsers: likeUserId }, $inc: { likeCount: 1 } },
        { new: true }
    );

    if (!updatedPost) {
        return res.status(400).json({ message: "User has already liked the post or post not found" });
    }

    return res.status(200).json({ message: "Post liked successfully.", post: updatedPost });
};

export const addRepost = async (req, res) => {
    const { postId } = req.params;
    const { repostUserId } = req.body;

    const updatedPost = await Post.findOneAndUpdate(
        { postId, repostUsers: { $ne: repostUserId } },
        { $push: { repostUsers: repostUserId }, $inc: { repostCount: 1 } },
        { new: true }
    );

    if (!updatedPost) {
        return res.status(400).json({ message: "User has already reposted the post or post not found" });
    }

    return res.status(200).json({ message: "Post reposted successfully.", post: updatedPost });
};

export const addView = async (req, res) => {
    const { postId } = req.params;
    const { viewUserId } = req.body;

    const updatedPost = await Post.findOneAndUpdate(
        { postId, viewUsers: { $ne: viewUserId } },
        { $push: { viewUsers: viewUserId }, $inc: { viewCount: 1 } },
        { new: true }
    );

    if (!updatedPost) {
        return res.status(400).json({ message: "User has already viewed the post or post not found" });
    }

    return res.status(200).json({ message: "Post viewed successfully.", post: updatedPost });
};

export const uploadImage = async (req, res) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message: `Multer error: ${err.message}`
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    // Create image URL
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    res.status(200).json({
      success: true,
      imageUrl: imageUrl
    });
  });
};

export const handleLike = async (req, res) => {
  try {
    const { postId, userId } = req.body;

    const post = await Post.findOne({ postId: postId });
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const isLiked = post.likeUsers.includes(userId);
    if (isLiked) {
      // Unlike
      post.likeUsers = post.likeUsers.filter(id => id !== userId);
      post.likeCount = Math.max(0, post.likeCount - 1);
    } else {
      // Like
      post.likeUsers.push(userId);
      post.likeCount += 1;
    }

    await post.save();

    res.status(200).json({
      success: true,
      message: isLiked ? 'Post unliked' : 'Post liked',
      likeCount: post.likeCount,
      likeUsers: post.likeUsers
    });
  } catch (error) {
    console.error('Like error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating like'
    });
  }
};

export const filterPosts = async (req, res) => {
  try {
    const { ids } = req.query;
    
    if (!ids) {
      return res.status(400).json({
        success: false,
        message: 'Post IDs are required'
      });
    }

    const postIds = ids.split(',');
    const posts = await Post.find({ postId: { $in: postIds } })
      .sort({ createdAt: -1 })
      .populate({
        path: 'userId',
        select: 'name username'
      });

    res.status(200).json({
      success: true,
      posts: posts
    });
  } catch (error) {
    console.error('Filter posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error filtering posts',
      error: error.message
    });
  }
};
