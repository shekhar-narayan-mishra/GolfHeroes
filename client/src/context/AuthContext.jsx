import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    () => localStorage.getItem('token') || localStorage.getItem('dh_token')
  );
  const [loading, setLoading] = useState(true);

  // Rehydrate session on app load
  useEffect(() => {
    const rehydrate = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/api/auth/me');
        setUser(data.user);
      } catch {
        // Token invalid / expired — clear it
        localStorage.removeItem('token');
        localStorage.removeItem('dh_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    rehydrate();
  }, [token]);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.removeItem('dh_token');
    setToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  const signup = useCallback(async (name, email, password) => {
    const { data } = await api.post('/api/auth/register', { name, email, password });
    if (data.needsConfirmation) {
      return data;
    }
    localStorage.setItem('token', data.token);
    localStorage.removeItem('dh_token');
    setToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('dh_token');
    setToken(null);
    setUser(null);
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
