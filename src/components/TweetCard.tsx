import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { tweetsApi } from '../utils/api';
import { Edit2, Trash2, Heart, Repeat, MessageCircle, Share, MoreHorizontal, CheckCircle } from 'lucide-react';
import Modal from './Modal';

interface Author {
  id: number;
  username: string;
  displayName: string;
  avatar: string;
  verified: boolean;
}

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
  author: Author;
  userLiked: boolean;
  userRetweeted: boolean;
}

interface TweetCardProps {
  tweet: Tweet;
  onUpdate: (updatedTweet: Tweet) => void;
  onDelete: (tweetId: number) => void;
  showActions?: boolean;
  isDetailView?: boolean;
}

export default function TweetCard({ tweet, onUpdate, onDelete, showActions = true, isDetailView = false }: TweetCardProps) {
  const { user, hasRole } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(tweet.content);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [localTweet, setLocalTweet] = useState(tweet);

  const canModify = user && (
    hasRole(['editor', 'admin']) || 
    (user.id === tweet.userId && hasRole(['user']))
  );

  const handleEdit = async () => {
    if (!editContent.trim()) return;
    
    setLoading(true);
    try {
      const updatedTweet = await tweetsApi.update(tweet.id, editContent);
      onUpdate(updatedTweet);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating tweet:', error);
      alert('Failed to update tweet. Please try again.');
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await tweetsApi.delete(tweet.id);
      onDelete(tweet.id);
      setIsDeleting(false);
    } catch (error) {
      console.error('Error deleting tweet:', error);
      alert('Failed to delete tweet. Please try again.');
    }
    setLoading(false);
  };

  const handleLike = async () => {
    if (!user) return;
    
    try {
      const response = await tweetsApi.like(tweet.id);
      setLocalTweet(prev => ({
        ...prev,
        userLiked: response.liked,
        likesCount: response.likesCount
      }));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleRetweet = async () => {
    if (!user) return;
    
    try {
      const response = await tweetsApi.retweet(tweet.id);
      setLocalTweet(prev => ({
        ...prev,
        userRetweeted: response.retweeted,
        retweetsCount: response.retweetsCount
      }));
    } catch (error) {
      console.error('Error toggling retweet:', error);
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    
    setLoading(true);
    try {
      await tweetsApi.reply(tweet.id, replyContent);
      setReplyContent('');
      setShowReplyModal(false);
      setLocalTweet(prev => ({
        ...prev,
        repliesCount: prev.repliesCount + 1
      }));
    } catch (error) {
      console.error('Error posting reply:', error);
      alert('Failed to post reply. Please try again.');
    }
    setLoading(false);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInDays < 7) return `${diffInDays}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatFullTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      hour: 'numeric',
      minute: '2-digit',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const processContent = (content: string) => {
    // Process hashtags and mentions
    return content.replace(/#(\w+)/g, '<span class="text-blue-500 hover:underline cursor-pointer">#$1</span>')
                 .replace(/@(\w+)/g, '<span class="text-blue-500 hover:underline cursor-pointer">@$1</span>');
  };

  // Utility to get image URL or fallback
  const getImageUrl = (path: string) => {
    if (!path) return '/twitter-image-placeholder.png';
    // If already absolute (e.g., starts with http), return as is
    if (/^https?:\/\//.test(path)) return path;
    // Otherwise, use relative to current origin
    return `${window.location.origin}${path}`;
  };

  return (
    <>
      <div className={`bg-white border-b border-gray-200 hover:bg-gray-50 transition-colors ${isDetailView ? 'p-6' : 'p-4'}`}>
        {/* Header */}
        <div className="flex items-start space-x-3">
          <Link to={`/profile/${tweet.author.username}`} className="flex-shrink-0">
            <img
              src={tweet.author.avatar}
              alt={tweet.author.displayName}
              className="w-12 h-12 rounded-full object-cover hover:opacity-90 transition-opacity"
            />
          </Link>
          
          <div className="flex-1 min-w-0">
            {/* User info and actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1 min-w-0">
                <Link 
                  to={`/profile/${tweet.author.username}`}
                  className="font-bold text-gray-900 hover:underline truncate"
                >
                  {tweet.author.displayName}
                </Link>
                {tweet.author.verified && (
                  <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
                )}
                <Link 
                  to={`/profile/${tweet.author.username}`}
                  className="text-gray-500 hover:underline truncate"
                >
                  @{tweet.author.username}
                </Link>
                <span className="text-gray-500">·</span>
                <span className="text-gray-500 text-sm flex-shrink-0">
                  {isDetailView ? formatFullTimestamp(tweet.timestamp) : formatTimestamp(tweet.timestamp)}
                </span>
                {tweet.updatedAt && (
                  <span className="text-gray-400 text-sm">· edited</span>
                )}
              </div>

              {/* More options */}
              {showActions && canModify && (
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    title="Edit tweet"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setIsDeleting(true)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    title="Delete tweet"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Content */}
            <div className={`${isDetailView ? 'mt-3 text-xl leading-relaxed' : 'mt-1'}`}>
              <p 
                className="text-gray-900 whitespace-pre-wrap break-words"
                dangerouslySetInnerHTML={{ __html: processContent(tweet.content) }}
              />
            </div>

            {/* Images */}
            {tweet.images && tweet.images.length > 0 && (
              <div className={`${isDetailView ? 'mt-4' : 'mt-3'} rounded-2xl overflow-hidden border border-gray-200`}>
                {tweet.images.length === 1 && (
                  <img
                    src={getImageUrl(tweet.images[0])}
                    alt="Tweet image"
                    className="w-full max-h-96 object-cover"
                    onError={e => (e.currentTarget.src = '/twitter-image-placeholder.png')}
                  />
                )}
                {tweet.images.length === 2 && (
                  <div className="grid grid-cols-2 gap-1">
                    {tweet.images.map((image, index) => (
                      <img
                        key={index}
                        src={getImageUrl(image)}
                        alt={`Tweet image ${index + 1}`}
                        className="w-full h-48 object-cover"
                        onError={e => (e.currentTarget.src = '/twitter-image-placeholder.png')}
                      />
                    ))}
                  </div>
                )}
                {tweet.images.length === 3 && (
                  <div className="grid grid-cols-2 gap-1">
                    <img
                      src={getImageUrl(tweet.images[0])}
                      alt="Tweet image 1"
                      className="w-full h-48 object-cover row-span-2"
                      onError={e => (e.currentTarget.src = '/twitter-image-placeholder.png')}
                    />
                    <div className="grid grid-rows-2 gap-1">
                      {tweet.images.slice(1).map((image, index) => (
                        <img
                          key={index + 1}
                          src={getImageUrl(image)}
                          alt={`Tweet image ${index + 2}`}
                          className="w-full h-24 object-cover"
                          onError={e => (e.currentTarget.src = '/twitter-image-placeholder.png')}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {tweet.images.length === 4 && (
                  <div className="grid grid-cols-2 gap-1">
                    {tweet.images.map((image, index) => (
                      <img
                        key={index}
                        src={getImageUrl(image)}
                        alt={`Tweet image ${index + 1}`}
                        className="w-full h-32 object-cover"
                        onError={e => (e.currentTarget.src = '/twitter-image-placeholder.png')}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Engagement buttons */}
            <div className={`flex items-center justify-between max-w-md ${isDetailView ? 'mt-4 pt-2 border-t border-gray-100' : 'mt-3'}`}>
              <button
                onClick={() => user ? setShowReplyModal(true) : null}
                className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors group"
                disabled={!user}
              >
                <div className="p-2 rounded-full group-hover:bg-blue-50 transition-colors">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <span className="text-sm">{localTweet.repliesCount}</span>
              </button>

              <button
                onClick={handleRetweet}
                className={`flex items-center space-x-2 transition-colors group ${
                  localTweet.userRetweeted ? 'text-green-500' : 'text-gray-500 hover:text-green-500'
                }`}
                disabled={!user}
              >
                <div className={`p-2 rounded-full transition-colors ${
                  localTweet.userRetweeted ? 'bg-green-50' : 'group-hover:bg-green-50'
                }`}>
                  <Repeat className="h-5 w-5" />
                </div>
                <span className="text-sm">{localTweet.retweetsCount}</span>
              </button>

              <button
                onClick={handleLike}
                className={`flex items-center space-x-2 transition-colors group ${
                  localTweet.userLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                }`}
                disabled={!user}
              >
                <div className={`p-2 rounded-full transition-colors ${
                  localTweet.userLiked ? 'bg-red-50' : 'group-hover:bg-red-50'
                }`}>
                  <Heart className={`h-5 w-5 ${localTweet.userLiked ? 'fill-current' : ''}`} />
                </div>
                <span className="text-sm">{localTweet.likesCount}</span>
              </button>

              <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors group">
                <div className="p-2 rounded-full group-hover:bg-blue-50 transition-colors">
                  <Share className="h-5 w-5" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reply Modal */}
      <Modal
        isOpen={showReplyModal}
        onClose={() => setShowReplyModal(false)}
        title="Reply to Tweet"
      >
        <div className="space-y-4">
          {/* Original tweet preview */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <img
                src={tweet.author.avatar}
                alt={tweet.author.displayName}
                className="w-6 h-6 rounded-full"
              />
              <span className="font-medium text-sm">{tweet.author.displayName}</span>
              <span className="text-gray-500 text-sm">@{tweet.author.username}</span>
            </div>
            <p className="text-sm text-gray-700">{tweet.content}</p>
          </div>

          <div className="flex space-x-3">
            <img
              src={user?.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'}
              alt="Your avatar"
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Tweet your reply"
                maxLength={280}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {replyContent.length}/280 characters
            </span>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setShowReplyModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleReply}
                disabled={loading || !replyContent.trim() || replyContent.length > 280}
                className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? 'Replying...' : 'Reply'}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title="Edit Tweet"
      >
        <div className="space-y-4">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="What's happening?"
            maxLength={280}
          />
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {editContent.length}/280 characters
            </span>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                disabled={loading || !editContent.trim() || editContent.length > 280}
                className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleting}
        onClose={() => setIsDeleting(false)}
        title="Delete Tweet"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            This can't be undone and it will be removed from your profile, the timeline of any accounts that follow you, and from search results.
          </p>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600 italic">"{tweet.content}"</p>
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setIsDeleting(false)}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}