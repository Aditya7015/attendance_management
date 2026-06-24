import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState([]);
  const loadingRef = useRef(false);

  useEffect(() => {
    if (token && !loadingRef.current) {
      loadingRef.current = true;
      loadUser();
    } else if (!token) {
      setLoading(false);
    }
  }, [token]);

  const loadUser = async () => {
    try {
      const response = await api.get('/auth/me');
      const { user, permissions } = response.data.data;
      setUser(user);
      setPermissions(permissions || []);
    } catch (error) {
      console.error('Failed to load user:', error);
      if (error.response?.status === 429) {
        // If rate limited, try again after 5 seconds
        setTimeout(() => {
          loadingRef.current = false;
          if (localStorage.getItem('token')) {
            loadUser();
          }
        }, 5000);
        return;
      }
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token, permissions } = response.data.data;
      
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      setPermissions(permissions || []);
      
      // Set the token in axios defaults
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return { success: true, user };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    setPermissions([]);
    loadingRef.current = false;
  };

  const hasPermission = (permission) => {
    return permissions.includes(permission);
  };

  const hasRole = (roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const value = {
    user,
    token,
    loading,
    permissions,
    login,
    logout,
    hasPermission,
    hasRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};