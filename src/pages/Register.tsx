import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authApi, ApiError } from '../utils/api';
import { UserPlus } from 'lucide-react';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.register(username, password);
      login(response.token, response.user);
      navigate('/');
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
        <div className="text-center mb-8">
          <div className="p-3 bg-green-500 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <UserPlus className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Join Twittoo</h1>
          <p className="text-gray-600 mt-2">Create your account to get started</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Choose a username"
              minLength={3}
              required
            />
            <p className="text-xs text-gray-500 mt-1">At least 3 characters</p>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Create a password"
              minLength={6}
              required
            />
            <p className="text-xs text-gray-500 mt-1">At least 6 characters</p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Confirm your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-green-500 hover:text-green-600 font-medium">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}