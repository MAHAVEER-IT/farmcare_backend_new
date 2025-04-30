import Comment from '../models/Comment.js';
import User from '../models/User.js';
import Post from '../models/Post.js';

// Get comments for a post
export const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    console.log('Getting comments for post:', postId);
    console.log('User from auth:', req.user); // Debug auth

    // Get top-level comments (no parentId)
    const comments = await Comment.find({ 
      postId,
      parentId: null 
    })
    .sort({ createdAt: -1 })
    .populate({
      path: 'replies',
      options: { sort: { createdAt: 1 } }
    })
    .lean()
    .exec();

    console.log(`Found ${comments?.length || 0} comments`);

    return res.status(200).json({
      success: true,
      comments: comments || []
    });
  } catch (error) {
    console.error('Get comments error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching comments',
      error: error.message
    });
  }
};

// Create a new comment
export const createComment = async (req, res) => {
  try {
    const { postId, content } = req.body;
    const userId = req.user.userId; // Get userId from auth middleware
    
    console.log('Creating comment:', { postId, userId, content });

    if (!postId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Get user details for author name
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create comment
    const comment = new Comment({
      postId,
      userId,
      content,
      authorName: user.name || 'Anonymous'
    });

    await comment.save();

    // Update post comment count
    await Post.findOneAndUpdate(
      { postId },
      { $inc: { commentCount: 1 } }
    );

    console.log('Comment created successfully:', comment);

    return res.status(201).json({
      success: true,
      comment: {
        id: comment._id,
        postId: comment.postId,
        userId: comment.userId,
        authorName: comment.authorName,
        content: comment.content,
        createdAt: comment.createdAt
      }
    });
  } catch (error) {
    console.error('Create comment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating comment',
      error: error.message
    });
  }
};

// Add like to a comment
export const likeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.userId; // Get userId from auth middleware

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user already liked
    if (comment.likes && comment.likes.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Comment already liked by user'
      });
    }

    // Add like
    comment.likes = comment.likes || [];
    comment.likes.push(userId);
    comment.likeCount = (comment.likeCount || 0) + 1;
    await comment.save();

    return res.status(200).json({
      success: true,
      message: 'Comment liked successfully',
      comment: {
        id: comment._id,
        likeCount: comment.likeCount
      }
    });
  } catch (error) {
    console.error('Like comment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error liking comment',
      error: error.message
    });
  }
};

// Get comment replies
export const getReplies = async (req, res) => {
  try {
    const { commentId } = req.params;
    
    const replies = await Comment.find({ parentId: commentId })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return res.status(200).json({
      success: true,
      replies: replies || []
    });
  } catch (error) {
    console.error('Get replies error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching replies',
      error: error.message
    });
  }
};

// Create a reply to a comment
export const createReply = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    // Find parent comment
    const parentComment = await Comment.findById(commentId);
    if (!parentComment) {
      return res.status(404).json({
        success: false,
        message: 'Parent comment not found'
      });
    }

    // Get user details
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create reply
    const reply = new Comment({
      postId: parentComment.postId,
      userId,
      content,
      authorName: user.name || 'Anonymous',
      parentId: commentId
    });

    await reply.save();

    // Update parent comment
    parentComment.replies.push(reply._id);
    parentComment.replyCount = (parentComment.replyCount || 0) + 1;
    await parentComment.save();

    return res.status(201).json({
      success: true,
      reply: {
        id: reply._id,
        postId: reply.postId,
        userId: reply.userId,
        authorName: reply.authorName,
        content: reply.content,
        parentId: reply.parentId,
        createdAt: reply.createdAt,
        replyCount: 0,
        likes: []
      }
    });
  } catch (error) {
    console.error('Create reply error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating reply',
      error: error.message
    });
  }
};

