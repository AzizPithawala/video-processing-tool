import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { connectSocket, disconnectSocket } from '../sockets/socket';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('accessToken'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Connect socket when authenticated
  useEffect(() => {
    if (token) {
      connectSocket(token);
    }
    return () => {
      if (!token) disconnectSocket();
    };
  }, [token]);

  const login = useCallback(async ({ email, password }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authService.login({ email, password });
      if (result.success) {
        const { token: accessToken, user: userData } = result.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(accessToken);
        setUser(userData);
        connectSocket(accessToken);
        return result;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async ({ name, email, password, role, tenantName }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authService.register({ name, email, password, role, tenantName });
      if (result.success) {
        const { token: accessToken, user: userData } = result.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(accessToken);
        setUser(userData);
        connectSocket(accessToken);
        return result;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    disconnectSocket();
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, register, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};
