import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    postId: { 
        type: String, 
        required: true,
        index: true // Add index for better query performance
    },
    userId: { 
        type: String, 
        required: true 
    },
    authorName: { 
        type: String, 
        required: true,
        default: 'Anonymous'
    },
    content: { 
        type: String, 
        required: true,
        trim: true
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        default: null
    },
    replies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    likes: [{
        type: String // Array of userIds who liked the comment
    }],
    likeCount: {
        type: Number,
        default: 0
    },
    replyCount: {
        type: Number,
        default: 0
    },
    createdAt: { 
        type: Date, 
        default: Date.now,
        index: true // Add index for sorting
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Add timestamps
commentSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    // Update likeCount when likes array changes
    if (this.isModified('likes')) {
        this.likeCount = this.likes.length;
    }
    next();
});

// Add virtual for id
commentSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

// Ensure virtuals are included in JSON
commentSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

// Add indexes
commentSchema.index({ postId: 1, createdAt: -1 }); // Compound index for post comments sorted by date

export default mongoose.model('Comment', commentSchema);