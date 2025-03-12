import mongoose from 'mongoose';

const channelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    createdBy: {
        type: String,
        required: true,
        ref: 'User'
    },
    members: [{
        type: String,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Channel', channelSchema); 