import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usersApi } from '../utils/api';
import { MapPin, Link as LinkIcon, Calendar, CheckCircle } from 'lucide-react';

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
}

interface UserProfileProps {
  user: User;
  onFollowChange: (following: boolean, followersCount: number) => void;
}

export default function UserProfile({ user: profileUser, onFollowChange }: UserProfileProps) {
  const { user: currentUser } = useAuth();
  const [following, setFollowing] = useState(profileUser.isFollowing);
  const [followersCount, setFollowersCount] = useState(profileUser.followersCount);
  const [loading, setLoading] = useState(false);

  const handleFollowToggle = async () => {
    if (!currentUser || loading) return;

    setLoading(true);
    try {
      const response = await usersApi.follow(profileUser.id);
      setFollowing(response.following);
      setFollowersCount(response.followersCount);
      onFollowChange(response.following, response.followersCount);
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
    setLoading(false);
  };

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const isOwnProfile = currentUser?.id === profileUser.id;

  return (
    <div className="bg-white">
      {/* Banner */}
      <div className="h-48 bg-gradient-to-r from-blue-400 to-purple-500 relative">
        {profileUser.banner && (
          <img
            src={profileUser.banner}
            alt="Profile banner"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Profile info */}
      <div className="px-4 pb-4">
        <div className="flex justify-between items-start -mt-16 mb-4">
          <div className="relative">
            <img
              src={profileUser.avatar}
              alt={profileUser.displayName}
              className="w-32 h-32 rounded-full border-4 border-white object-cover"
            />
          </div>

          {!isOwnProfile && currentUser && (
            <button
              onClick={handleFollowToggle}
              disabled={loading}
              className={`mt-16 px-6 py-2 rounded-full font-medium transition-colors ${
                following
                  ? 'bg-white border border-gray-300 text-gray-900 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              {loading ? 'Loading...' : following ? 'Following' : 'Follow'}
            </button>
          )}

          {isOwnProfile && (
            <button className="mt-16 px-6 py-2 border border-gray-300 rounded-full font-medium text-gray-900 hover:bg-gray-50 transition-colors">
              Edit profile
            </button>
          )}
        </div>

        {/* User details */}
        <div className="space-y-3">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-gray-900">{profileUser.displayName}</h1>
              {profileUser.verified && (
                <CheckCircle className="h-6 w-6 text-blue-500" />
              )}
            </div>
            <p className="text-gray-500">@{profileUser.username}</p>
          </div>

          {profileUser.bio && (
            <p className="text-gray-900 leading-relaxed">{profileUser.bio}</p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-gray-500">
            {profileUser.location && (
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{profileUser.location}</span>
              </div>
            )}
            {profileUser.website && (
              <div className="flex items-center space-x-1">
                <LinkIcon className="h-4 w-4" />
                <a
                  href={profileUser.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-500 hover:underline"
                >
                  {profileUser.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Joined {formatJoinDate(profileUser.createdAt)}</span>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-1">
              <span className="font-bold text-gray-900">{profileUser.followingCount}</span>
              <span className="text-gray-500">Following</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="font-bold text-gray-900">{followersCount}</span>
              <span className="text-gray-500">Followers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}