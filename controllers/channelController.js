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