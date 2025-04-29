import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const channelMessageSchema = new mongoose.Schema({
    channelId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Channel',
        index: true
    },
    senderId: {
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
    shareToken: {
        type: String,
        unique: true,
        sparse: true
    },
    shareTokenExpiry: {
        type: Date
    }
});

// Generate share token method
channelMessageSchema.methods.generateShareToken = function() {
    this.shareToken = uuidv4();
    this.shareTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours expiry
    return this.shareToken;
};

// Verify if share token is valid
channelMessageSchema.methods.isShareTokenValid = function() {
    return this.shareTokenExpiry && this.shareTokenExpiry > Date.now();
};

channelMessageSchema.index({ channelId: 1, timestamp: -1 });

export default mongoose.model('ChannelMessage', channelMessageSchema);