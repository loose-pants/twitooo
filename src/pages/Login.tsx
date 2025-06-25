import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authApi, ApiError } from '../utils/api';
import { LogIn } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.login(username, password);
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
          <div className="p-3 bg-blue-500 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <LogIn className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-600 mt-2">Sign in to your Twittoo account</p>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your username"
              required
            />
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-500 hover:text-blue-600 font-medium">
              Create one here
            </Link>
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Demo Accounts:</h3>
          <div className="space-y-1 text-xs text-gray-600">
            <div>Admin: <code className="bg-white px-1 rounded">admin / adminpass</code></div>
            <div>Editor: <code className="bg-white px-1 rounded">editor / editorpass</code></div>
            <div>User: <code className="bg-white px-1 rounded">user / userpass</code></div>
          </div>
        </div>
      </div>
    </div>
  );
}