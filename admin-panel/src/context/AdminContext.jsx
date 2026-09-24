import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { adminApi } from '../api/client';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [token, setTokenState] = useState(adminApi.getToken());
  const [toast, setToast] = useState(null);

  useEffect(() => {
    function handleLogout() {
      setTokenState(null);
    }
    window.addEventListener('ca-admin-logout', handleLogout);
    return () => window.removeEventListener('ca-admin-logout', handleLogout);
  }, []);

  const login = useCallback(async (password) => {
    const { token: newToken } = await adminApi.login(password);
    adminApi.setToken(newToken);
    setTokenState(newToken);
  }, []);

  const logout = useCallback(() => {
    adminApi.setToken(null);
    setTokenState(null);
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  }, []);

  return (
    <AdminContext.Provider
      value={{ isAuthenticated: Boolean(token), login, logout, toast, showToast, clearToast: () => setToast(null) }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin faqat AdminProvider ichida ishlatiladi');
  return ctx;
}
