import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminPanel from './pages/AdminPanel';
import EditorPanel from './pages/EditorPanel';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const { user, hasRole } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!hasRole(allowedRoles)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile/:username" element={<Profile />} />
        <Route 
          path="/login" 
          element={user ? <Navigate to="/" replace /> : <Login />} 
        />
        <Route 
          path="/register" 
          element={user ? <Navigate to="/" replace /> : <Register />} 
        />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPanel />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/editor" 
          element={
            <ProtectedRoute allowedRoles={['editor', 'admin']}>
              <EditorPanel />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;