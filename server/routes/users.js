import express from 'express';
import { users, tweets, follows } from '../data/initialize.js';
import { followIdCounter } from '../data/initialize.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();
let currentFollowId = followIdCounter;

// Get all users (Admin only)
router.get('/', authenticateToken, requireRole(['admin']), (req, res) => {
  try {
    const safeUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
      bio: user.bio,
      location: user.location,
      website: user.website,
      avatar: user.avatar,
      verified: user.verified,
      followersCount: user.followersCount,
      followingCount: user.followingCount,
      tweetsCount: user.tweetsCount,
      createdAt: user.createdAt
    }));
    res.json(safeUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user profile by username
router.get('/profile/:username', (req, res) => {
  try {
    const username = req.params.username;
    const user = users.find(u => u.username === username);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isFollowing = req.user ? follows.some(follow => 
      follow.followerId === req.user.id && follow.followingId === user.id
    ) : false;

    const userTweets = tweets.filter(tweet => tweet.userId === user.id)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    const safeUser = {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      bio: user.bio,
      location: user.location,
      website: user.website,
      avatar: user.avatar,
      banner: user.banner,
      verified: user.verified,
      followersCount: follows.filter(f => f.followingId === user.id).length,
      followingCount: follows.filter(f => f.followerId === user.id).length,
      tweetsCount: userTweets.length,
      createdAt: user.createdAt,
      isFollowing: isFollowing,
      tweets: userTweets
    };
    
    res.json(safeUser);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Follow/Unfollow user
router.post('/:id/follow', authenticateToken, (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (userId === req.user.id) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    const existingFollow = follows.find(follow => 
      follow.followerId === req.user.id && follow.followingId === userId
    );

    if (existingFollow) {
      // Unfollow
      const followIndex = follows.findIndex(follow => follow.id === existingFollow.id);
      follows.splice(followIndex, 1);
      res.json({ following: false, followersCount: follows.filter(f => f.followingId === userId).length });
    } else {
      // Follow
      const newFollow = {
        id: currentFollowId++,
        followerId: req.user.id,
        followingId: userId,
        createdAt: new Date().toISOString()
      };
      follows.push(newFollow);
      res.json({ following: true, followersCount: follows.filter(f => f.followingId === userId).length });
    }
  } catch (error) {
    console.error('Error toggling follow:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get specific user (Admin only)
router.get('/:id', authenticateToken, requireRole(['admin']), (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const safeUser = {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
      bio: user.bio,
      location: user.location,
      website: user.website,
      avatar: user.avatar,
      verified: user.verified,
      followersCount: user.followersCount,
      followingCount: user.followingCount,
      tweetsCount: user.tweetsCount,
      createdAt: user.createdAt
    };
    
    res.json(safeUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user role (Admin only)
router.put('/:id/role', authenticateToken, requireRole(['admin']), (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { role } = req.body;
    
    const validRoles = ['user', 'editor', 'admin'];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({ message: 'Valid role is required (user, editor, or admin)' });
    }
    
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent admin from changing their own role
    if (userId === req.user.id) {
      return res.status(400).json({ message: 'Cannot change your own role' });
    }
    
    users[userIndex].role = role;
    users[userIndex].updatedAt = new Date().toISOString();
    
    const safeUser = {
      id: users[userIndex].id,
      username: users[userIndex].username,
      displayName: users[userIndex].displayName,
      role: users[userIndex].role,
      bio: users[userIndex].bio,
      location: users[userIndex].location,
      website: users[userIndex].website,
      avatar: users[userIndex].avatar,
      verified: users[userIndex].verified,
      followersCount: users[userIndex].followersCount,
      followingCount: users[userIndex].followingCount,
      tweetsCount: users[userIndex].tweetsCount,
      createdAt: users[userIndex].createdAt,
      updatedAt: users[userIndex].updatedAt
    };
    
    res.json({ message: 'User role updated successfully', user: safeUser });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete user (Admin only)
router.delete('/:id', authenticateToken, requireRole(['admin']), (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Prevent admin from deleting themselves
    if (userId === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const deletedUser = users.splice(userIndex, 1)[0];
    
    res.json({ 
      message: 'User deleted successfully', 
      user: {
        id: deletedUser.id,
        username: deletedUser.username,
        displayName: deletedUser.displayName,
        role: deletedUser.role
      }
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;