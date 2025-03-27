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
    messageType: {
        type: String,
        enum: ['text', 'voice', 'image'],
        default: 'text'
    },
    voiceUrl: {
        type: String,
        default: ''
    },
    audioDuration: {
        type: Number,
        default: 0
    },
    clientId: {
        type: String,
        default: null
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