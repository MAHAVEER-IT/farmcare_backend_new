import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  postId: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: String,
    required: true,
  },
  authorName: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  images: [{
    type: String,
  }],
  postType: {
    type: String,
    enum: ['blog', 'farmUpdate', 'news'],
    default: 'farmUpdate',
  },
  likeUsers: [{
    type: String,
  }],
  likeCount: {
    type: Number,
    default: 0,
  },
  commentCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Post', postSchema);