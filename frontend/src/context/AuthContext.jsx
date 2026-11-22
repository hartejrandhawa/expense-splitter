import { useCallback, useEffect, useMemo, useState } from "react";
import { onUnauthorized } from "../api/client";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }) {
  const [username, setUsername] = useState(() => localStorage.getItem("username"));

  const login = useCallback((token, name) => {
    localStorage.setItem("token", token);
    localStorage.setItem("username", name);
    setUsername(name);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setUsername(null);
  }, []);

  // An expired token anywhere in the app drops the user back to the login screen.
  useEffect(() => {
    onUnauthorized(logout);
    return () => onUnauthorized(null);
  }, [logout]);

  const value = useMemo(() => ({ username, login, logout }), [username, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
