import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usersApi, tweetsApi } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import { Users, Settings, Trash2, Edit2, Shield, BarChart3 } from 'lucide-react';

interface User {
  id: number;
  username: string;
  role: 'user' | 'editor' | 'admin';
  createdAt: string;
}

interface Tweet {
  id: number;
  userId: number;
  username: string;
  content: string;
  timestamp: string;
  likes: number;
  retweets: number;
}

export default function AdminPanel() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'tweets' | 'stats'>('users');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersData, tweetsData] = await Promise.all([
        usersApi.getAll(),
        tweetsApi.getAll()
      ]);
      setUsers(usersData);
      setTweets(tweetsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const handleRoleChange = async () => {
    if (!selectedUser || !selectedRole) return;

    setActionLoading(true);
    try {
      await usersApi.updateRole(selectedUser.id, selectedRole);
      setUsers(prev => prev.map(u => 
        u.id === selectedUser.id ? { ...u, role: selectedRole as any } : u
      ));
      setShowRoleModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update user role. Please try again.');
    }
    setActionLoading(false);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setActionLoading(true);
    try {
      await usersApi.delete(userToDelete.id);
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user. Please try again.');
    }
    setActionLoading(false);
  };

  const openRoleModal = (userToEdit: User) => {
    setSelectedUser(userToEdit);
    setSelectedRole(userToEdit.role);
    setShowRoleModal(true);
  };

  const openDeleteModal = (userToDelete: User) => {
    setUserToDelete(userToDelete);
    setShowDeleteModal(true);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-700';
      case 'editor': return 'bg-green-100 text-green-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  const stats = {
    totalUsers: users.length,
    totalTweets: tweets.length,
    admins: users.filter(u => u.role === 'admin').length,
    editors: users.filter(u => u.role === 'editor').length,
    regularUsers: users.filter(u => u.role === 'user').length,
    todaysTweets: tweets.filter(t => 
      new Date(t.timestamp).toDateString() === new Date().toDateString()
    ).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-500 rounded-lg">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-600">Manage users and oversee platform activity</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'users'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Users ({stats.totalUsers})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('tweets')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'tweets'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Edit2 className="h-4 w-4" />
                <span>Tweets ({stats.totalTweets})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'stats'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Statistics</span>
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
                <p className="text-sm text-gray-500">{users.length} total users</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map(userItem => (
                      <tr key={userItem.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium text-sm">
                                {userItem.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {userItem.username}
                                {userItem.id === user?.id && (
                                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500">ID: {userItem.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getRoleColor(userItem.role)}`}>
                            {userItem.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(userItem.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => openRoleModal(userItem)}
                              className="text-purple-600 hover:text-purple-900 p-1 hover:bg-purple-50 rounded"
                              title="Change role"
                            >
                              <Settings className="h-4 w-4" />
                            </button>
                            {userItem.id !== user?.id && (
                              <button
                                onClick={() => openDeleteModal(userItem)}
                                className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                                title="Delete user"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tweets Tab */}
          {activeTab === 'tweets' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Tweet Overview</h2>
                <p className="text-sm text-gray-500">{tweets.length} total tweets</p>
              </div>
              
              <div className="space-y-3">
                {tweets.slice(0, 10).map(tweet => (
                  <div key={tweet.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium text-gray-900">@{tweet.username}</span>
                          <span className="text-gray-500 text-sm">
                            {new Date(tweet.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm">{tweet.content}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>{tweet.likes} likes</span>
                          <span>{tweet.retweets} retweets</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {tweets.length > 10 && (
                  <p className="text-center text-gray-500 text-sm">
                    Showing first 10 tweets. Total: {tweets.length}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Platform Statistics</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm font-medium">Total Users</p>
                      <p className="text-2xl font-bold text-blue-900">{stats.totalUsers}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 text-sm font-medium">Total Tweets</p>
                      <p className="text-2xl font-bold text-green-900">{stats.totalTweets}</p>
                    </div>
                    <Edit2 className="h-8 w-8 text-green-500" />
                  </div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-600 text-sm font-medium">Today's Tweets</p>
                      <p className="text-2xl font-bold text-purple-900">{stats.todaysTweets}</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-purple-500" />
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Admins</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.admins}</p>
                    </div>
                    <Shield className="h-8 w-8 text-gray-500" />
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Editors</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.editors}</p>
                    </div>
                    <Edit2 className="h-8 w-8 text-gray-500" />
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Regular Users</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.regularUsers}</p>
                    </div>
                    <Users className="h-8 w-8 text-gray-500" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Role Change Modal */}
      <Modal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        title="Change User Role"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Change role for <strong>{selectedUser?.username}</strong>
          </p>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Select new role:
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="user">User</option>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setShowRoleModal(false)}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRoleChange}
              disabled={actionLoading || selectedRole === selectedUser?.role}
              className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {actionLoading ? 'Updating...' : 'Update Role'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete User Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete User"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete <strong>{userToDelete?.username}</strong>? 
            This action cannot be undone.
          </p>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteUser}
              disabled={actionLoading}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {actionLoading ? 'Deleting...' : 'Delete User'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}