import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Twitter, Home, Settings, Users, LogOut, LogIn, UserPlus, Edit3 } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="p-2 bg-blue-500 rounded-full group-hover:bg-blue-600 transition-colors">
                <Twitter className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Twittoo</span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/') 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>

              {hasRole(['editor', 'admin']) && (
                <Link
                  to="/editor"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/editor') 
                      ? 'text-green-600 bg-green-50' 
                      : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
                  }`}
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Editor</span>
                </Link>
              )}

              {hasRole(['admin']) && (
                <Link
                  to="/admin"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/admin') 
                      ? 'text-purple-600 bg-purple-50' 
                      : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
                  }`}
                >
                  <Settings className="h-4 w-4" />
                  <span>Admin</span>
                </Link>
              )}
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="hidden sm:flex items-center space-x-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.username}</p>
                        <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md transition-colors"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Register</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden pb-3 pt-2 border-t border-gray-200">
            <div className="flex items-center space-x-1">
              <Link
                to="/"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/') 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>

              {hasRole(['editor', 'admin']) && (
                <Link
                  to="/editor"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/editor') 
                      ? 'text-green-600 bg-green-50' 
                      : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
                  }`}
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Editor</span>
                </Link>
              )}

              {hasRole(['admin']) && (
                <Link
                  to="/admin"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/admin') 
                      ? 'text-purple-600 bg-purple-50' 
                      : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
                  }`}
                >
                  <Settings className="h-4 w-4" />
                  <span>Admin</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}