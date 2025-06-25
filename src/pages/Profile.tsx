import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { usersApi } from '../utils/api';
import UserProfile from '../components/UserProfile';
import TweetCard from '../components/TweetCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowLeft } from 'lucide-react';

interface User {
  id: number;
  username: string;
  displayName: string;
  bio: string;
  location: string;
  website: string;
  avatar: string;
  banner: string;
  verified: boolean;
  followersCount: number;
  followingCount: number;
  tweetsCount: number;
  createdAt: string;
  isFollowing: boolean;
  tweets: any[];
}

export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tweets' | 'replies' | 'media' | 'likes'>('tweets');

  useEffect(() => {
    if (username) {
      fetchUserProfile();
    }
  }, [username]);

  const fetchUserProfile = async () => {
    if (!username) return;
    
    try {
      const userData = await usersApi.getProfile(username);
      setUser(userData);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
    setLoading(false);
  };

  const handleFollowChange = (following: boolean, followersCount: number) => {
    if (user) {
      setUser({
        ...user,
        isFollowing: following,
        followersCount: followersCount
      });
    }
  };

  const handleUpdateTweet = (updatedTweet: any) => {
    if (user) {
      setUser({
        ...user,
        tweets: user.tweets.map(tweet => 
          tweet.id === updatedTweet.id ? updatedTweet : tweet
        )
      });
    }
  };

  const handleDeleteTweet = (tweetId: number) => {
    if (user) {
      setUser({
        ...user,
        tweets: user.tweets.filter(tweet => tweet.id !== tweetId),
        tweetsCount: user.tweetsCount - 1
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto bg-white min-h-screen border-x border-gray-200">
        <div className="p-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">This account doesn't exist</h2>
          <p className="text-gray-600">Try searching for another.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white min-h-screen border-x border-gray-200">
      {/* Header */}
      <div className="sticky top-0 bg-white bg-opacity-80 backdrop-blur-md border-b border-gray-200 p-4 z-10">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => window.history.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{user.displayName}</h1>
            <p className="text-sm text-gray-500">{user.tweetsCount} Tweets</p>
          </div>
        </div>
      </div>

      {/* Profile */}
      <UserProfile user={user} onFollowChange={handleFollowChange} />

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex">
          {[
            { key: 'tweets', label: 'Tweets', count: user.tweetsCount },
            { key: 'replies', label: 'Replies', count: 0 },
            { key: 'media', label: 'Media', count: user.tweets.filter(t => t.images?.length > 0).length },
            { key: 'likes', label: 'Likes', count: 0 }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 py-4 px-1 text-center font-medium text-sm transition-colors relative ${
                activeTab === tab.key
                  ? 'text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className="ml-1 text-xs text-gray-400">({tab.count})</span>
              )}
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-full" />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'tweets' && (
          <div>
            {user.tweets.length === 0 ? (
              <div className="p-12 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Tweets yet</h3>
                <p className="text-gray-600">When they Tweet, their Tweets will show up here.</p>
              </div>
            ) : (
              user.tweets.map(tweet => (
                <TweetCard
                  key={tweet.id}
                  tweet={{
                    ...tweet,
                    author: {
                      id: user.id,
                      username: user.username,
                      displayName: user.displayName,
                      avatar: user.avatar,
                      verified: user.verified
                    },
                    userLiked: false,
                    userRetweeted: false
                  }}
                  onUpdate={handleUpdateTweet}
                  onDelete={handleDeleteTweet}
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'media' && (
          <div>
            {user.tweets.filter(t => t.images?.length > 0).length === 0 ? (
              <div className="p-12 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">No media yet</h3>
                <p className="text-gray-600">Photos and videos shared will show up here.</p>
              </div>
            ) : (
              user.tweets
                .filter(t => t.images?.length > 0)
                .map(tweet => (
                  <TweetCard
                    key={tweet.id}
                    tweet={{
                      ...tweet,
                      author: {
                        id: user.id,
                        username: user.username,
                        displayName: user.displayName,
                        avatar: user.avatar,
                        verified: user.verified
                      },
                      userLiked: false,
                      userRetweeted: false
                    }}
                    onUpdate={handleUpdateTweet}
                    onDelete={handleDeleteTweet}
                  />
                ))
            )}
          </div>
        )}

        {(activeTab === 'replies' || activeTab === 'likes') && (
          <div className="p-12 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Coming soon</h3>
            <p className="text-gray-600">This feature is under development.</p>
          </div>
        )}
      </div>
    </div>
  );
}