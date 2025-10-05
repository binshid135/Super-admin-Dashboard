import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/auth/Login';
import PasswordReset from './components/auth/PasswordReset';
import AdminDashboard from './components/admin/AdminDashboard';
import UserDashboard from './components/user/UserDashboard';
import LoadingSpinner from './components/common/LoadingSpinner';

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading application..." />
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={!user ? <Login /> : <Navigate to={user.role === 'superadmin' ? '/admin' : '/dashboard'} />} 
      />
      <Route 
        path="/password-reset" 
        element={!user ? <PasswordReset /> : <Navigate to={user.role === 'superadmin' ? '/admin' : '/dashboard'} />} 
      />
      
      {/* Protected routes */}
      <Route 
        path="/admin" 
        element={
          user ? (
            user.role === 'superadmin' ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/dashboard" />
            )
          ) : (
            <Navigate to="/login" />
          )
        } 
      />
      <Route 
        path="/dashboard" 
        element={user ? <UserDashboard /> : <Navigate to="/login" />} 
      />
      
      {/* Default redirect */}
      <Route 
        path="/" 
        element={
          user ? (
            <Navigate to={user.role === 'superadmin' ? '/admin' : '/dashboard'} />
          ) : (
            <Navigate to="/login" />
          )
        } 
      />
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <AppContent />
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;