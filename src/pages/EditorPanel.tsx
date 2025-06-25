import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { tweetsApi } from '../utils/api';
import TweetCard from '../components/TweetCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Edit3, Filter, Search } from 'lucide-react';

interface Tweet {
  id: number;
  userId: number;
  username: string;
  content: string;
  timestamp: string;
  likes: number;
  retweets: number;
  updatedAt?: string;
}

export default function EditorPanel() {
  const { user } = useAuth();
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [filteredTweets, setFilteredTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'likes'>('newest');

  useEffect(() => {
    fetchTweets();
  }, []);

  useEffect(() => {
    filterAndSortTweets();
  }, [tweets, searchTerm, sortBy]);

  const fetchTweets = async () => {
    try {
      const data = await tweetsApi.getAll();
      setTweets(data);
    } catch (error) {
      console.error('Error fetching tweets:', error);
    }
    setLoading(false);
  };

  const filterAndSortTweets = () => {
    let filtered = tweets;

    // Apply search filter
    if (searchTerm) {
      filtered = tweets.filter(tweet =>
        tweet.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tweet.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        case 'oldest':
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        case 'likes':
          return b.likes - a.likes;
        default:
          return 0;
      }
    });

    setFilteredTweets(sorted);
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-500 rounded-lg">
            <Edit3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Editor Panel</h1>
            <p className="text-gray-600">Moderate and manage all platform content</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Search tweets or users..."
            />
          </div>

          {/* Sort */}
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="likes">Most Liked</option>
            </select>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredTweets.length} of {tweets.length} tweets
        </div>
      </div>

      {/* Tweet List */}
      <div className="space-y-4">
        {filteredTweets.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Edit3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No tweets found' : 'No tweets to moderate'}
            </h3>
            <p className="text-gray-600">
              {searchTerm 
                ? 'Try adjusting your search terms.' 
                : 'All tweets are being handled perfectly!'
              }
            </p>
          </div>
        ) : (
          filteredTweets.map(tweet => (
            <TweetCard
              key={tweet.id}
              tweet={tweet}
              onUpdate={handleUpdateTweet}
              onDelete={handleDeleteTweet}
              showActions={true}
            />
          ))
        )}
      </div>

      {/* Statistics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Statistics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-900">{tweets.length}</div>
            <div className="text-green-600 text-sm font-medium">Total Tweets</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-900">
              {tweets.filter(t => new Date(t.timestamp).toDateString() === new Date().toDateString()).length}
            </div>
            <div className="text-blue-600 text-sm font-medium">Today's Tweets</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-900">
              {tweets.reduce((acc, tweet) => acc + tweet.likes, 0)}
            </div>
            <div className="text-purple-600 text-sm font-medium">Total Likes</div>
          </div>
        </div>
      </div>
    </div>
  );
}