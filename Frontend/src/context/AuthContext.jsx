import { createContext, useContext, useState, useEffect } from "react";
import { getMe } from "../api/auth.js";
import { logout as apiLogout } from "../api/auth.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);  // true while /me resolves on first load

  // Restore session from existing HTTPOnly refresh cookie on app mount
  useEffect(() => {
    getMe()
      .then(({ data }) => {
        setUser(data.data);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  /**
   * Called after a successful login or register.
   * Stores the in-memory access token and sets the user object.
   */
  const login = ({ user, accessToken }) => {
    if (accessToken) window.__metos_token__ = accessToken;
    setUser(user);
  };

  /**
   * Calls the logout API, clears in-memory state.
   */
  const logout = async () => {
    try {
      await apiLogout();
    } catch {
      // Even if the API call fails, clear local state
    }
    window.__metos_token__ = null;
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
