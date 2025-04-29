import Channel from '../models/Channel.js';
import ChannelMessage from '../models/ChannelMessage.js';

// Create a new channel
export const createChannel = async (req, res) => {
    try {
        const { name, description } = req.body;
        const createdBy = req.user.userId;

        const channel = new Channel({
            name,
            description,
            createdBy,
            members: [createdBy]
        });

        await channel.save();

        res.status(201).json({
            success: true,
            data: channel
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get all channels
export const getAllChannels = async (req, res) => {
    try {
        const userId = req.user.userId;
        const channels = await Channel.find();
        
        // Separate joined and not joined channels
        const joinedChannels = channels.filter(channel => 
            channel.members.includes(userId)
        );
        const notJoinedChannels = channels.filter(channel => 
            !channel.members.includes(userId)
        );

        res.status(200).json({
            success: true,
            data: {
                joined: joinedChannels,
                notJoined: notJoinedChannels
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Join a channel
export const joinChannel = async (req, res) => {
    try {
        const { channelId } = req.params;
        const userId = req.user.userId;

        const channel = await Channel.findById(channelId);
        if (!channel) {
            return res.status(404).json({
                success: false,
                message: 'Channel not found'
            });
        }

        if (!channel.members.includes(userId)) {
            channel.members.push(userId);
            await channel.save();
        }

        res.status(200).json({
            success: true,
            data: channel
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Leave a channel
export const leaveChannel = async (req, res) => {
    try {
        const { channelId } = req.params;
        const userId = req.user.userId;

        const channel = await Channel.findById(channelId);
        if (!channel) {
            return res.status(404).json({
                success: false,
                message: 'Channel not found'
            });
        }

        channel.members = channel.members.filter(member => member !== userId);
        await channel.save();

        res.status(200).json({
            success: true,
            data: channel
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get channel messages
export const getChannelMessages = async (req, res) => {
    try {
        const { channelId } = req.params;
        const messages = await ChannelMessage.find({ channelId })
            .sort({ timestamp: 1 });

        res.status(200).json({
            success: true,
            data: messages
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Generate share link for a channel
export const generateShareLink = async (req, res) => {
    try {
        const { channelId } = req.params;
        const userId = req.user.userId;

        // Find channel and verify user is a member
        const channel = await Channel.findById(channelId);
        if (!channel) {
            return res.status(404).json({
                success: false,
                message: 'Channel not found'
            });
        }

        if (!channel.members.includes(userId)) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to share this channel'
            });
        }

        // Generate new share token
        const shareToken = channel.generateShareToken();
        await channel.save();

        res.status(200).json({
            success: true,
            data: {
                shareLink: `https://farmcare-backend-new.onrender.com/api/v1/channel/join/${shareToken}`,
                expiresAt: channel.shareTokenExpiry
            }
        });
    } catch (error) {
        console.error('Generate share link error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Join channel via share link
export const joinViaLink = async (req, res) => {
    try {
        const { shareToken } = req.body;
        const userId = req.user.userId;

        // Find channel by share token
        const channel = await Channel.findOne({ shareToken });
        if (!channel) {
            return res.status(404).json({
                success: false,
                message: 'Invalid or expired share link'
            });
        }

        // Verify token is still valid
        if (!channel.isShareTokenValid(shareToken)) {
            return res.status(400).json({
                success: false,
                message: 'Share link has expired'
            });
        }

        // Check if user is already a member
        if (channel.members.includes(userId)) {
            return res.status(400).json({
                success: false,
                message: 'You are already a member of this channel'
            });
        }

        // Add user to channel
        channel.members.push(userId);
        await channel.save();

        res.status(200).json({
            success: true,
            data: channel
        });
    } catch (error) {
        console.error('Join via link error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const generateChannelShareUrl = async (req, res) => {
    try {
        const { channelId } = req.params;
        const channel = await Channel.findById(channelId);

        if (!channel) {
            return res.status(404).json({
                success: false,
                message: 'Channel not found'
            });
        }

        // Generate new share token
        const shareToken = channel.generateShareToken();
        await channel.save();

        // Generate shareable URL
        const shareUrl = `https://farmcare-backend-new.onrender.com/api/v1/channels/share/${shareToken}`;

        res.status(200).json({
            success: true,
            shareUrl,
            expiresAt: channel.shareTokenExpiry
        });
    } catch (error) {
        console.error('Generate channel share URL error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating share URL'
        });
    }
};

export const getSharedChannel = async (req, res) => {
    try {
        const { shareToken } = req.params;
        const channel = await Channel.findOne({ shareToken });

        if (!channel || !channel.isShareTokenValid()) {
            return res.status(404).json({
                success: false,
                message: 'Invalid or expired share link'
            });
        }

        res.status(200).json({
            success: true,
            channel: {
                name: channel.name,
                description: channel.description,
                memberCount: channel.members.length,
                createdAt: channel.createdAt
            }
        });
    } catch (error) {
        console.error('Get shared channel error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving shared channel'
        });
    }
};