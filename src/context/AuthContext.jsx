import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { subscribeToWebPush } from '../services/pushService';

// Helper: subscribe after login (silent, non-blocking)
const tryPushSubscribe = () => setTimeout(async () => {
  if (Notification.permission === 'granted') {
    await subscribeToWebPush();
  }
}, 2000);

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('corssira_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem('corssira_token'));

  useEffect(() => {
    const verify = async () => {
      if (token) {
        try {
          const { data } = await api.get('/auth/me');
          setUser(data.user);
          localStorage.setItem('corssira_user', JSON.stringify(data.user));
          // Re-subscribe push for returning users with active sessions
          setTimeout(() => subscribeToWebPush(), 2000);
        } catch {
          logout();
        }
      }
      setLoading(false);
    };
    verify();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('corssira_token', data.token);
    localStorage.setItem('corssira_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    // Subscribe to push after login
    tryPushSubscribe();
    return data;
  };

  const register = async (formData) => {
    const { data } = await api.post('/auth/register', formData);
    localStorage.setItem('corssira_token', data.token);
    localStorage.setItem('corssira_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    // Subscribe to push after registration
    tryPushSubscribe();
    return data;
  };

  const logout = () => {
    localStorage.removeItem('corssira_token');
    localStorage.removeItem('corssira_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('corssira_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
