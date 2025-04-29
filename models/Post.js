import mongoose from "mongoose";
import { v4 as uuidv4 } from 'uuid';

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
  shareToken: {
    type: String,
    unique: true,
    sparse: true
  },
  shareTokenExpiry: {
    type: Date
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

// Generate share token method
postSchema.methods.generateShareToken = function() {
  this.shareToken = uuidv4();
  this.shareTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days expiry
  return this.shareToken;
};

// Verify if share token is valid
postSchema.methods.isShareTokenValid = function() {
  return this.shareTokenExpiry && this.shareTokenExpiry > Date.now();
};

export default mongoose.model('Post', postSchema);