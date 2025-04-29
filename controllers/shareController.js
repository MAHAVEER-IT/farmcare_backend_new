import Post from '../models/Post.js';
import ChannelMessage from '../models/ChannelMessage.js';
import Channel from '../models/Channel.js';
import { v4 as uuidv4 } from 'uuid';

// Share content with a doctor
export const shareWithDoctor = async (req, res) => {
    try {
        const { type, contentId, doctorId, title, content } = req.body;
        const shareToken = uuidv4();
        const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        let sharedContent;
        switch (type) {
            case 'post':
                sharedContent = await Post.findOne({ postId: contentId });
                break;
            case 'message':
                sharedContent = await ChannelMessage.findById(contentId);
                break;
            case 'channel':
                sharedContent = await Channel.findById(contentId);
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid content type'
                });
        }

        if (!sharedContent) {
            return res.status(404).json({
                success: false,
                message: 'Content not found'
            });
        }

        // Add share token and expiry
        sharedContent.shareToken = shareToken;
        sharedContent.shareTokenExpiry = expiryDate;
        await sharedContent.save();

        // Create notification for doctor (you'll need to implement notification service)
        // TODO: Implement notification

        res.status(200).json({
            success: true,
            shareUrl: `https://farmcare-backend-new.onrender.com/api/v1/${type}/share/${shareToken}`,
            expiresAt: expiryDate
        });
    } catch (error) {
        console.error('Share with doctor error:', error);
        res.status(500).json({
            success: false,
            message: 'Error sharing content'
        });
    }
};

// Share content with a channel
export const shareWithChannel = async (req, res) => {
    try {
        const { type, contentId, channelId, title, content } = req.body;
        const shareToken = uuidv4();
        const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        let sharedContent;
        switch (type) {
            case 'post':
                sharedContent = await Post.findOne({ postId: contentId });
                break;
            case 'message':
                sharedContent = await ChannelMessage.findById(contentId);
                break;
            case 'channel':
                sharedContent = await Channel.findById(contentId);
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid content type'
                });
        }

        if (!sharedContent) {
            return res.status(404).json({
                success: false,
                message: 'Content not found'
            });
        }

        // Add share token and expiry
        sharedContent.shareToken = shareToken;
        sharedContent.shareTokenExpiry = expiryDate;
        await sharedContent.save();

        // Emit socket event to channel members
        req.app.get('io').to(`channel_${channelId}`).emit('shared_content', {
            type,
            title,
            content,
            shareUrl: `https://farmcare-backend-new.onrender.com/api/v1/${type}/share/${shareToken}`
        });

        res.status(200).json({
            success: true,
            shareUrl: `https://farmcare-backend-new.onrender.com/api/v1/${type}/share/${shareToken}`,
            expiresAt: expiryDate
        });
    } catch (error) {
        console.error('Share with channel error:', error);
        res.status(500).json({
            success: false,
            message: 'Error sharing content'
        });
    }
};

// Get shared content
export const getSharedContent = async (req, res) => {
    try {
        const { type, shareToken } = req.params;

        let content;
        switch (type) {
            case 'post':
                content = await Post.findOne({ shareToken });
                break;
            case 'message':
                content = await ChannelMessage.findOne({ shareToken });
                break;
            case 'channel':
                content = await Channel.findOne({ shareToken });
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid content type'
                });
        }

        if (!content || !content.shareTokenExpiry || content.shareTokenExpiry < new Date()) {
            return res.status(404).json({
                success: false,
                message: 'Invalid or expired share link'
            });
        }

        res.status(200).json({
            success: true,
            type,
            content
        });
    } catch (error) {
        console.error('Get shared content error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving shared content'
        });
    }
};