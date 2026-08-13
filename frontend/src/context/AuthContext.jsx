import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('qm_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('qm_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('qm_token');
      if (savedToken) {
        try {
          const res = await authService.getCurrentUser();
          if (res?.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('qm_user', JSON.stringify(res.data.user));
          }
        } catch (e) {
          // Clear invalid session
          setUser(null);
          setToken(null);
          localStorage.removeItem('qm_user');
          localStorage.removeItem('qm_token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async ({ email, password, isAdmin = false }) => {
    setLoading(true);
    try {
      const res = isAdmin
        ? await authService.adminLogin({ email, password })
        : await authService.login({ email, password });

      const authData = res.data;
      if (authData?.user && authData?.token) {
        setUser(authData.user);
        setToken(authData.token);
        localStorage.setItem('qm_user', JSON.stringify(authData.user));
        localStorage.setItem('qm_token', authData.token);
      }
      return authData.user;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await authService.register(userData);
      const authData = res.data;
      if (authData?.user && authData?.token) {
        setUser(authData.user);
        setToken(authData.token);
        localStorage.setItem('qm_user', JSON.stringify(authData.user));
        localStorage.setItem('qm_token', authData.token);
      }
      return authData;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setToken(null);
  };

  const updateProfileState = (partial) => {
    if (!user) return;
    const updated = { ...user, ...partial };
    setUser(updated);
    localStorage.setItem('qm_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || null,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        updateProfileState,
      }}
    >
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
