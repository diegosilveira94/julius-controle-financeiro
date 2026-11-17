import { createContext, useEffect, useMemo, useState } from "react";
import { authService } from "../services/authService";
import { refreshSession, setAccessToken } from "../services/api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshSession()
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(credentials) {
    const data = await authService.login(credentials);
    setAccessToken(data.token);
    setUser(data.user);
    return data;
  }

  async function logout() {
    await authService.logout().catch(() => {});
    setAccessToken(null);
    setUser(null);
  }

  const value = useMemo(() => {
    const isOwner = user?.role !== "CHILD";
    const can = (permission) =>
      isOwner || Boolean(user?.permissions?.includes(permission));

    return {
      user,
      loading,
      isAuthenticated: Boolean(user),
      isOwner,
      can,
      login,
      logout,
    };
  }, [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
