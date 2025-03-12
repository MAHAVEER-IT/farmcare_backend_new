import Message from '../models/Message.js';
import User from '../models/User.js';

// Send a message
export const sendMessage = async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        const senderId = req.user.userId; // From auth middleware

        // Verify both users exist
        const [sender, receiver] = await Promise.all([
            User.findOne({ userId: senderId }),
            User.findOne({ userId: receiverId })
        ]);

        if (!sender || !receiver) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            content
        });

        await newMessage.save();

        res.status(201).json({
            success: true,
            data: newMessage
        });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending message',
            error: error.message
        });
    }
};

// Get chat history between two users
export const getChatHistory = async (req, res) => {
    try {
        const { otherUserId } = req.params;
        const userId = req.user.userId; // From auth middleware

        const messages = await Message.find({
            $or: [
                { senderId: userId, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: userId }
            ]
        })
        .sort({ timestamp: 1 }); // Sort by timestamp ascending

        // Mark messages as read
        await Message.updateMany(
            { senderId: otherUserId, receiverId: userId, read: false },
            { $set: { read: true } }
        );

        res.status(200).json({
            success: true,
            data: messages
        });
    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching chat history',
            error: error.message
        });
    }
};

// Get all chats for a doctor
export const getDoctorChats = async (req, res) => {
    try {
        const doctorId = req.user.userId; // From auth middleware

        // Get all messages where the doctor is either sender or receiver
        const messages = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { senderId: doctorId },
                        { receiverId: doctorId }
                    ]
                }
            },
            {
                $sort: { timestamp: -1 }
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ["$senderId", doctorId] },
                            "$receiverId",
                            "$senderId"
                        ]
                    },
                    lastMessage: { $first: "$$ROOT" },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$receiverId", doctorId] },
                                        { $eq: ["$read", false] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "userId",
                    as: "user"
                }
            },
            {
                $unwind: "$user"
            },
            {
                $project: {
                    _id: 0,
                    user: {
                        id: "$user.userId",
                        name: "$user.name",
                        profilePic: { $ifNull: ["$user.profilePic", ""] }
                    },
                    lastMessage: 1,
                    unreadCount: 1
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: messages
        });
    } catch (error) {
        console.error('Error fetching doctor chats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching doctor chats',
            error: error.message
        });
    }
};