import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  username: string;
  displayName?: string;
  role: 'user' | 'editor' | 'admin';
  avatar?: string;
  verified?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('twittoo_token');
    const storedUser = localStorage.getItem('twittoo_user');
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('twittoo_token');
        localStorage.removeItem('twittoo_user');
      }
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('twittoo_token', newToken);
    localStorage.setItem('twittoo_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('twittoo_token');
    localStorage.removeItem('twittoo_user');
  };

  const hasRole = (roles: string[]) => {
    return user ? roles.includes(user.role) : false;
  };

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!user,
    hasRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}