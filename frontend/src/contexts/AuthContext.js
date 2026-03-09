import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import apiClient from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    // Optional: window.location.href = '/login';  ← if you want hard redirect
    // Better: use navigate in components that call logout
  }, []);

  const verifyToken = useCallback(async () => {
    try {
      const response = await apiClient.get('/auth/me');
      const freshUser = response.data;
      setUser(freshUser);
      // Keep localStorage in sync
      localStorage.setItem('user', JSON.stringify(freshUser));
    } catch (error) {
      console.error('Token verification failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    let savedUser = null;
    if (token) {
      try {
        savedUser = JSON.parse(localStorage.getItem('user'));
        if (savedUser) {
          setUser(savedUser);
          verifyToken();
          return;
        }
      } catch (e) {
        console.error('Failed to parse saved user:', e);
      }
    }
    // No valid token or user → done loading
    setLoading(false);
  }, [verifyToken]);

  const login = useCallback((token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const value = {
    user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};