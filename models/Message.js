import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    senderId: {
        type: String,
        required: true,
        ref: 'User'
    },
    receiverId: {
        type: String,
        required: true,
        ref: 'User'
    },
    content: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    read: {
        type: Boolean,
        default: false
    }
});

// Create compound index for efficient chat history queries
messageSchema.index({ senderId: 1, receiverId: 1, timestamp: -1 });

export default mongoose.model('Message', messageSchema);