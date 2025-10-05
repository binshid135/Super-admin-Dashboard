import React, { useState, useEffect } from 'react';
import AuthContext from '../../context/AuthContext';
import { api } from '../../services/api';

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('access_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password, userType = 'user') => {
    try {
      const response = await api.login({ email, password });
      const data = await response.json();
      
      if (response.ok) {
        const isSuperAdmin = userType === 'superadmin' || 
                           data.user?.is_superuser || 
                           email.includes('admin');
        
        const userData = data.user || { 
          email, 
          is_superuser: isSuperAdmin,
          user_type: userType
        };

        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(data.access);
        setUser(userData);
        return { success: true };
      }
      return { success: false, error: data.detail || 'Login failed' };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;