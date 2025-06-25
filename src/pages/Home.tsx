import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { tweetsApi } from '../utils/api';
import TweetCard from '../components/TweetCard';
import TweetComposer from '../components/TweetComposer';
import LoadingSpinner from '../components/LoadingSpinner';
import { Sparkles } from 'lucide-react';

interface Tweet {
  id: number;
  userId: number;
  username: string;
  content: string;
  images: string[];
  timestamp: string;
  likesCount: number;
  retweetsCount: number;
  repliesCount: number;
  updatedAt?: string;
  author: {
    id: number;
    username: string;
    displayName: string;
    avatar: string;
    verified: boolean;
  };
  userLiked: boolean;
  userRetweeted: boolean;
}

export default function Home() {
  const { user } = useAuth();
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTweets();
  }, []);

  const fetchTweets = async () => {
    try {
      const data = await tweetsApi.getAll();
      setTweets(data);
    } catch (error) {
      console.error('Error fetching tweets:', error);
    }
    setLoading(false);
  };

  const handleTweetPosted = (newTweet: Tweet) => {
    setTweets(prev => [newTweet, ...prev]);
  };

  const handleUpdateTweet = (updatedTweet: Tweet) => {
    setTweets(prev => prev.map(tweet => 
      tweet.id === updatedTweet.id ? updatedTweet : tweet
    ));
  };

  const handleDeleteTweet = (tweetId: number) => {
    setTweets(prev => prev.filter(tweet => tweet.id !== tweetId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white min-h-screen border-x border-gray-200">
      {/* Header */}
      <div className="sticky top-0 bg-white bg-opacity-80 backdrop-blur-md border-b border-gray-200 p-4 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Home</h1>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Sparkles className="h-5 w-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Tweet Composer */}
      {user && (
        <TweetComposer onTweetPosted={handleTweetPosted} />
      )}

      {/* Timeline */}
      <div>
        {tweets.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Welcome to Twittoo!</h3>
            <p className="text-gray-600 mb-4">
              {user ? "Start following people to see their tweets in your timeline." : "Join the conversation by signing up today."}
            </p>
          </div>
        ) : (
          tweets.map(tweet => (
            <TweetCard
              key={tweet.id}
              tweet={tweet}
              onUpdate={handleUpdateTweet}
              onDelete={handleDeleteTweet}
            />
          ))
        )}
      </div>
    </div>
  );
}