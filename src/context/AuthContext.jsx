import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  AUTH_EVENT,
  SESSION_KEY,
  loginUser as authLogin,
  logoutUser as authLogout,
  refreshSessionUser,
  restoreSession,
  registerCustomer as authRegister,
  updateSessionUser
} from '../lib/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => restoreSession());
  const [booting, setBooting] = useState(false);

  const syncFromStorage = useCallback(() => {
    setUser(restoreSession());
  }, []);

  useEffect(() => {
    let cancelled = false;

    const refreshInBackground = async () => {
      const restored = restoreSession();
      if (!restored) {
        return;
      }

      if (!cancelled) {
        setUser((prev) => prev ?? restored);
      }

      try {
        const validated = await Promise.race([
          refreshSessionUser(restored),
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error('session_refresh_timeout')), 8000);
          })
        ]);
        if (!cancelled && validated) {
          setUser(validated);
        }
      } catch (err) {
        console.warn('Session refresh skipped:', err?.message || err);
      }
    };

    refreshInBackground();

    const onAuthEvent = (event) => {
      setUser(event.detail?.user ?? restoreSession());
    };

    const onStorage = (event) => {
      if (event.key === SESSION_KEY || event.key === null) {
        syncFromStorage();
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        syncFromStorage();
      }
    };

    window.addEventListener(AUTH_EVENT, onAuthEvent);
    window.addEventListener('storage', onStorage);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      window.removeEventListener(AUTH_EVENT, onAuthEvent);
      window.removeEventListener('storage', onStorage);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [syncFromStorage]);

  const login = useCallback(async (identifier, password, options) => {
    setBooting(true);
    try {
      const result = await authLogin(identifier, password, options);
      if (result.success) {
        setUser(result.user);
      }
      return result;
    } finally {
      setBooting(false);
    }
  }, []);

  const register = useCallback(async (payload, options) => {
    setBooting(true);
    try {
      const result = await authRegister(payload, options);
      if (result.success) {
        setUser(result.user);
      }
      return result;
    } finally {
      setBooting(false);
    }
  }, []);

  const logout = useCallback(() => {
    authLogout();
    setUser(null);
  }, []);

  const updateUser = useCallback((patch) => {
    const updated = updateSessionUser(patch);
    setUser(updated);
    return updated;
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      booting,
      login,
      register,
      logout,
      updateUser,
      refreshUser: async () => {
        const current = restoreSession();
        if (!current) {
          setUser(null);
          return null;
        }
        const refreshed = await refreshSessionUser(current);
        setUser(refreshed || current);
        return refreshed || current;
      }
    }),
    [user, booting, login, register, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
