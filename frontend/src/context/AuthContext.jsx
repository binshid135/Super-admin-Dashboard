import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { tokenManager, sessionManager } from '../utils/auth';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(tokenManager.getToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = tokenManager.getToken();
      const storedUser = tokenManager.getUser();
      
      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(storedUser);
          sessionManager.init();
        } catch (error) {
          tokenManager.clearAll();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password, role) => {
    try {
      const result = await api.login({ email, password, role });
      
      if (result.success) {
        const { access, refresh, user } = result.data;
        
        tokenManager.setToken(access);
        tokenManager.setRefreshToken(refresh);
        tokenManager.setUser(user);
        
        setToken(access);
        setUser(user);
        sessionManager.init();
        
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const logout = () => {
    tokenManager.clearAll();
    setToken(null);
    setUser(null);
    window.location.href = '/';
  };

  const refreshToken = async () => {
    const refresh = tokenManager.getRefreshToken();
    if (!refresh) {
      logout();
      return null;
    }

    try {
      const result = await api.refreshToken(refresh);
      if (result.success) {
        const { access } = result.data;
        tokenManager.setToken(access);
        setToken(access);
        return access;
      } else {
        logout();
        return null;
      }
    } catch (error) {
      logout();
      return null;
    }
  };

  const updateUserProfile = async (userData) => {
    try {
      const result = await api.updateProfile(userData, token);
      if (result.success) {
        const updatedUser = { ...user, ...userData };
        tokenManager.setUser(updatedUser);
        setUser(updatedUser);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const changePassword = async (passwordData) => {
    try {
      const result = await api.changePassword(passwordData, token);
      return result;
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const value = {
    user,
    token,
    login,
    logout,
    loading,
    refreshToken,
    updateUserProfile,
    changePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;