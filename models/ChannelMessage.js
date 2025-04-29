import mongoose from 'mongoose';

const channelMessageSchema = new mongoose.Schema({
    channelId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Channel'
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
    }
});

channelMessageSchema.index({ channelId: 1, timestamp: -1 });

export default mongoose.model('ChannelMessage', channelMessageSchema); 