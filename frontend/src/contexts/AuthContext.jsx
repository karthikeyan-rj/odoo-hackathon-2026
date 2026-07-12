import { createContext, useContext, useState, useCallback } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('af_user')); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('af_token') || null);

  const saveSession = useCallback((userData, tokenStr) => {
    localStorage.setItem('af_token', tokenStr);
    localStorage.setItem('af_user', JSON.stringify(userData));
    setToken(tokenStr);
    setUser(userData);
  }, []);

  const signup = useCallback(async (name, email, password) => {
    const { data } = await api.post('/auth/signup', { name, email, password });
    saveSession(data.data.user, data.data.token);
    return data.data;
  }, [saveSession]);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    saveSession(data.data.user, data.data.token);
    return data.data;
  }, [saveSession]);

  const logout = useCallback(() => {
    localStorage.removeItem('af_token');
    localStorage.removeItem('af_user');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, logout, signup, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
