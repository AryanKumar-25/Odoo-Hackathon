import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    setLoading(false);
  }, [token, user]);

  const login = async (loginId, password) => {
    const res = await apiClient.post('/auth/login', { loginId, password });
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const signup = async (companyData) => {
    const res = await apiClient.post('/auth/signup', companyData);
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const changePassword = async (currentPassword, newPassword) => {
    const res = await apiClient.post('/auth/change-password', { currentPassword, newPassword });
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, changePassword, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
