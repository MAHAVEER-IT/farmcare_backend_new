import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const channelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    createdBy: {
        type: String,
        required: true
    },
    members: [{
        type: String
    }],
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
        default: Date.now
    }
});

// Generate share token
channelSchema.methods.generateShareToken = function() {
    this.shareToken = uuidv4();
    this.shareTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days expiry
    return this.shareToken;
};

// Verify if share token is valid
channelSchema.methods.isShareTokenValid = function(token) {
    return this.shareToken === token && 
           this.shareTokenExpiry && 
           this.shareTokenExpiry > Date.now();
};

export default mongoose.model('Channel', channelSchema);