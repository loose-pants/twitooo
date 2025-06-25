import express from 'express';
import { tweets, likes, retweets, replies, users } from '../data/initialize.js';
import { tweetIdCounter, likeIdCounter, retweetIdCounter, replyIdCounter } from '../data/initialize.js';
import { authenticateToken, requireRole, verifyOwnershipOrRole } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();
let currentTweetId = tweetIdCounter;
let currentLikeId = likeIdCounter;
let currentRetweetId = retweetIdCounter;
let currentReplyId = replyIdCounter;

// Get all tweets with enhanced data
router.get('/', (req, res) => {
  try {
    const enrichedTweets = tweets.map(tweet => {
      const author = users.find(u => u.id === tweet.userId);
      const userLiked = req.user ? likes.some(like => 
        like.tweetId === tweet.id && like.userId === req.user.id
      ) : false;
      const userRetweeted = req.user ? retweets.some(retweet => 
        retweet.tweetId === tweet.id && retweet.userId === req.user.id
      ) : false;

      return {
        ...tweet,
        author: author ? {
          id: author.id,
          username: author.username,
          displayName: author.displayName,
          avatar: author.avatar,
          verified: author.verified
        } : null,
        userLiked,
        userRetweeted,
        likesCount: likes.filter(like => like.tweetId === tweet.id).length,
        retweetsCount: retweets.filter(retweet => retweet.tweetId === tweet.id).length,
        repliesCount: replies.filter(reply => reply.tweetId === tweet.id).length
      };
    });

    const sortedTweets = enrichedTweets.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json(sortedTweets);
  } catch (error) {
    console.error('Error fetching tweets:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get specific tweet with replies
router.get('/:id', (req, res) => {
  try {
    const tweetId = parseInt(req.params.id);
    const tweet = tweets.find(t => t.id === tweetId);
    
    if (!tweet) {
      return res.status(404).json({ message: 'Tweet not found' });
    }

    const author = users.find(u => u.id === tweet.userId);
    const tweetReplies = replies.filter(reply => reply.tweetId === tweetId);
    const userLiked = req.user ? likes.some(like => 
      like.tweetId === tweet.id && like.userId === req.user.id
    ) : false;
    const userRetweeted = req.user ? retweets.some(retweet => 
      retweet.tweetId === tweet.id && retweet.userId === req.user.id
    ) : false;

    const enrichedTweet = {
      ...tweet,
      author: author ? {
        id: author.id,
        username: author.username,
        displayName: author.displayName,
        avatar: author.avatar,
        verified: author.verified
      } : null,
      userLiked,
      userRetweeted,
      likesCount: likes.filter(like => like.tweetId === tweet.id).length,
      retweetsCount: retweets.filter(retweet => retweet.tweetId === tweet.id).length,
      repliesCount: tweetReplies.length,
      replies: tweetReplies.map(reply => {
        const replyAuthor = users.find(u => u.id === reply.userId);
        return {
          ...reply,
          author: replyAuthor ? {
            id: replyAuthor.id,
            username: replyAuthor.username,
            displayName: replyAuthor.displayName,
            avatar: replyAuthor.avatar,
            verified: replyAuthor.verified
          } : null
        };
      })
    };
    
    res.json(enrichedTweet);
  } catch (error) {
    console.error('Error fetching tweet:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new tweet with image upload
router.post('/', authenticateToken, requireRole(['user', 'editor', 'admin']), upload.array('images', 4), (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Tweet content is required' });
    }
    
    if (content.length > 280) {
      return res.status(400).json({ message: 'Tweet content must be 280 characters or less' });
    }

    // Process uploaded images
    const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
    
    const newTweet = {
      id: currentTweetId++,
      userId: req.user.id,
      username: req.user.username,
      content: content.trim(),
      images: images,
      timestamp: new Date().toISOString(),
      likesCount: 0,
      retweetsCount: 0,
      repliesCount: 0,
      isRetweet: false,
      originalTweetId: null,
      replyToId: null
    };
    
    tweets.push(newTweet);

    // Update user's tweet count
    const user = users.find(u => u.id === req.user.id);
    if (user) {
      user.tweetsCount++;
    }

    // Return enriched tweet
    const author = users.find(u => u.id === newTweet.userId);
    const enrichedTweet = {
      ...newTweet,
      author: author ? {
        id: author.id,
        username: author.username,
        displayName: author.displayName,
        avatar: author.avatar,
        verified: author.verified
      } : null,
      userLiked: false,
      userRetweeted: false
    };

    res.status(201).json(enrichedTweet);
  } catch (error) {
    console.error('Error creating tweet:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Like/Unlike tweet
router.post('/:id/like', authenticateToken, (req, res) => {
  try {
    const tweetId = parseInt(req.params.id);
    const tweet = tweets.find(t => t.id === tweetId);
    
    if (!tweet) {
      return res.status(404).json({ message: 'Tweet not found' });
    }

    const existingLike = likes.find(like => 
      like.tweetId === tweetId && like.userId === req.user.id
    );

    if (existingLike) {
      // Unlike
      const likeIndex = likes.findIndex(like => like.id === existingLike.id);
      likes.splice(likeIndex, 1);
      res.json({ liked: false, likesCount: likes.filter(like => like.tweetId === tweetId).length });
    } else {
      // Like
      const newLike = {
        id: currentLikeId++,
        tweetId: tweetId,
        userId: req.user.id,
        createdAt: new Date().toISOString()
      };
      likes.push(newLike);
      res.json({ liked: true, likesCount: likes.filter(like => like.tweetId === tweetId).length });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Retweet/Unretweet
router.post('/:id/retweet', authenticateToken, (req, res) => {
  try {
    const tweetId = parseInt(req.params.id);
    const tweet = tweets.find(t => t.id === tweetId);
    
    if (!tweet) {
      return res.status(404).json({ message: 'Tweet not found' });
    }

    const existingRetweet = retweets.find(retweet => 
      retweet.tweetId === tweetId && retweet.userId === req.user.id
    );

    if (existingRetweet) {
      // Unretweet
      const retweetIndex = retweets.findIndex(retweet => retweet.id === existingRetweet.id);
      retweets.splice(retweetIndex, 1);
      res.json({ retweeted: false, retweetsCount: retweets.filter(retweet => retweet.tweetId === tweetId).length });
    } else {
      // Retweet
      const newRetweet = {
        id: currentRetweetId++,
        tweetId: tweetId,
        userId: req.user.id,
        createdAt: new Date().toISOString()
      };
      retweets.push(newRetweet);
      res.json({ retweeted: true, retweetsCount: retweets.filter(retweet => retweet.tweetId === tweetId).length });
    }
  } catch (error) {
    console.error('Error toggling retweet:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Reply to tweet
router.post('/:id/reply', authenticateToken, (req, res) => {
  try {
    const tweetId = parseInt(req.params.id);
    const { content } = req.body;
    
    const tweet = tweets.find(t => t.id === tweetId);
    if (!tweet) {
      return res.status(404).json({ message: 'Tweet not found' });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Reply content is required' });
    }
    
    if (content.length > 280) {
      return res.status(400).json({ message: 'Reply content must be 280 characters or less' });
    }

    const newReply = {
      id: currentReplyId++,
      tweetId: tweetId,
      userId: req.user.id,
      username: req.user.username,
      content: content.trim(),
      timestamp: new Date().toISOString()
    };
    
    replies.push(newReply);

    // Return enriched reply
    const author = users.find(u => u.id === newReply.userId);
    const enrichedReply = {
      ...newReply,
      author: author ? {
        id: author.id,
        username: author.username,
        displayName: author.displayName,
        avatar: author.avatar,
        verified: author.verified
      } : null
    };

    res.status(201).json(enrichedReply);
  } catch (error) {
    console.error('Error creating reply:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update tweet
router.put('/:id', 
  authenticateToken,
  verifyOwnershipOrRole(['editor', 'admin'], (req) => {
    const tweetId = parseInt(req.params.id);
    const tweet = tweets.find(t => t.id === tweetId);
    return tweet ? tweet.userId : null;
  }),
  (req, res) => {
    try {
      const tweetId = parseInt(req.params.id);
      const { content } = req.body;
      
      if (!content || content.trim().length === 0) {
        return res.status(400).json({ message: 'Tweet content is required' });
      }
      
      if (content.length > 280) {
        return res.status(400).json({ message: 'Tweet content must be 280 characters or less' });
      }
      
      const tweetIndex = tweets.findIndex(t => t.id === tweetId);
      
      if (tweetIndex === -1) {
        return res.status(404).json({ message: 'Tweet not found' });
      }
      
      tweets[tweetIndex] = {
        ...tweets[tweetIndex],
        content: content.trim(),
        updatedAt: new Date().toISOString()
      };

      // Return enriched tweet
      const author = users.find(u => u.id === tweets[tweetIndex].userId);
      const enrichedTweet = {
        ...tweets[tweetIndex],
        author: author ? {
          id: author.id,
          username: author.username,
          displayName: author.displayName,
          avatar: author.avatar,
          verified: author.verified
        } : null,
        userLiked: req.user ? likes.some(like => 
          like.tweetId === tweets[tweetIndex].id && like.userId === req.user.id
        ) : false,
        userRetweeted: req.user ? retweets.some(retweet => 
          retweet.tweetId === tweets[tweetIndex].id && retweet.userId === req.user.id
        ) : false,
        likesCount: likes.filter(like => like.tweetId === tweets[tweetIndex].id).length,
        retweetsCount: retweets.filter(retweet => retweet.tweetId === tweets[tweetIndex].id).length,
        repliesCount: replies.filter(reply => reply.tweetId === tweets[tweetIndex].id).length
      };
      
      res.json(enrichedTweet);
    } catch (error) {
      console.error('Error updating tweet:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// Delete tweet
router.delete('/:id',
  authenticateToken,
  verifyOwnershipOrRole(['editor', 'admin'], (req) => {
    const tweetId = parseInt(req.params.id);
    const tweet = tweets.find(t => t.id === tweetId);
    return tweet ? tweet.userId : null;
  }),
  (req, res) => {
    try {
      const tweetId = parseInt(req.params.id);
      const tweetIndex = tweets.findIndex(t => t.id === tweetId);
      
      if (tweetIndex === -1) {
        return res.status(404).json({ message: 'Tweet not found' });
      }
      
      const deletedTweet = tweets.splice(tweetIndex, 1)[0];

      // Update user's tweet count
      const user = users.find(u => u.id === deletedTweet.userId);
      if (user && user.tweetsCount > 0) {
        user.tweetsCount--;
      }

      // Clean up related data
      const tweetLikes = likes.filter(like => like.tweetId === tweetId);
      tweetLikes.forEach(like => {
        const likeIndex = likes.findIndex(l => l.id === like.id);
        if (likeIndex > -1) likes.splice(likeIndex, 1);
      });

      const tweetRetweets = retweets.filter(retweet => retweet.tweetId === tweetId);
      tweetRetweets.forEach(retweet => {
        const retweetIndex = retweets.findIndex(r => r.id === retweet.id);
        if (retweetIndex > -1) retweets.splice(retweetIndex, 1);
      });

      const tweetReplies = replies.filter(reply => reply.tweetId === tweetId);
      tweetReplies.forEach(reply => {
        const replyIndex = replies.findIndex(r => r.id === reply.id);
        if (replyIndex > -1) replies.splice(replyIndex, 1);
      });

      res.json({ message: 'Tweet deleted successfully', tweet: deletedTweet });
    } catch (error) {
      console.error('Error deleting tweet:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

export default router;