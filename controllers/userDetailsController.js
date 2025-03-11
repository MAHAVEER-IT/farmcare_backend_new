import UserDetails from '../models/UserDetails.js';
import User from '../models/User.js';

// Controller to update user details
export const updateUserDetails = async (req, res) => {
  const { userId } = req.params;
  const userDetails = req.body;

  try {
    
    const user =await User.findOne({userId});

    const updatedUser = await UserDetails.findOneAndUpdate(
      { userId },
      { ...userDetails, updatedAt: Date.now() , userId, username:user.username},
      { new: true ,upsert:true}
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'Not Updated' });
    }

    return res.status(200).json({ message: 'User details updated successfully', userDetails: updatedUser });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Controller to get user details
export const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({ userId: userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        userId: user.userId,
        name: user.name,
        username: user.username,
        email: user.email,
        userType: user.userType,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user details'
    });
  }
};

export const addFollower = async (req, res) => {
  const { userId } = req.params;
  const { followerId } = req.body;

  try {
    const updatedUserDetails = await UserDetails.findOneAndUpdate(
      { userId, followersId: { $ne: followerId } },
      { $push: { followersId: followerId }, $inc: { followersCount: 1 } },
      { new: true }
    );

    if (!updatedUserDetails) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ 
      message: 'Follower added successfully', 
      userDetails: updatedUserDetails 
    });
    
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const addHistory = async (req, res) => {
  const { userId } = req.params;
  const { postId } = req.body;

  try {
    const updatedUserDetails = await UserDetails.findOneAndUpdate(
      { userId, viewedPostsId: { $ne: postId } },
      { $push: { viewedPostsId: postId }, $inc: { totalViews: 1 } },
      { new: true }
    );

    if (!updatedUserDetails) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ 
      message: 'History added successfully', 
      userDetails: updatedUserDetails 
    });
    
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};