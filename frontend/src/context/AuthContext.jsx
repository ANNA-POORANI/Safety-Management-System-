import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('cpsms_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('cpsms_token');
      const storedUser = localStorage.getItem('cpsms_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          // Verify with backend
          const res = await authAPI.getMe();
          if (res.data && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('cpsms_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Session verification expired:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authAPI.login({ email, password });
      if (res.data.success) {
        const { token, user } = res.data;
        setToken(token);
        setUser(user);
        localStorage.setItem('cpsms_token', token);
        localStorage.setItem('cpsms_user', JSON.stringify(user));
        return { success: true };
      }
      return { success: false, message: res.data.message || 'Login failed.' };
    } catch (error) {
      const msg = error.response?.data?.message || 'Invalid credentials or server unavailable.';
      return { success: false, message: msg };
    }
  };

  const register = async (userData) => {
    try {
      const res = await authAPI.register(userData);
      if (res.data.success) {
        const { token, user } = res.data;
        setToken(token);
        setUser(user);
        localStorage.setItem('cpsms_token', token);
        localStorage.setItem('cpsms_user', JSON.stringify(user));
        return { success: true };
      }
      return { success: false, message: res.data.message || 'Registration failed.' };
    } catch (error) {
      const msg = error.response?.data?.message || 'Error creating account.';
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    try {
      authAPI.logout().catch(() => {});
    } catch (e) {}
    setUser(null);
    setToken(null);
    localStorage.removeItem('cpsms_token');
    localStorage.removeItem('cpsms_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
