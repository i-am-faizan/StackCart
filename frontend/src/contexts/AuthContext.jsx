import { createContext, useEffect, useMemo, useState } from "react";
import http from "../api/http";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const bootstrapAuth = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await http.get("/auth/me");
      setUser(data.user);
    } catch (_error) {
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    bootstrapAuth();
  }, []);

  const login = async (payload) => {
    const { data } = await http.post("/auth/login", payload);
    localStorage.setItem("token", data.token);
    setUser(data.user);
    return data;
  };

  const loginAdmin = async (payload) => {
    const { data } = await http.post("/auth/admin/login", payload);
    localStorage.setItem("token", data.token);
    setUser(data.user);
    return data;
  };

  const register = async (payload) => {
    const { data } = await http.post("/auth/register", payload);
    localStorage.setItem("token", data.token);
    setUser(data.user);
    return data;
  };

  const registerAdmin = async (payload) => {
    const { data } = await http.post("/auth/admin/register", payload);
    localStorage.setItem("token", data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      loginAdmin,
      register,
      registerAdmin,
      logout
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
