import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  login as apiLogin,
  logout as apiLogout,
  checkAdminStatus,
  getAuthToken,
  getAuthUser,
  setAuthToken,
  setAuthUser,
  removeAuthToken,
  removeAuthUser,
} from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const token = getAuthToken();
      const savedUser = getAuthUser();

      if (token && savedUser) {
        setUser(savedUser);
        setIsAuthenticated(true);
        
        // Verify admin status
        try {
          const adminCheck = await checkAdminStatus();
          setIsAdmin(adminCheck.is_admin);
        } catch (err) {
          console.error("Failed to verify admin status:", err);
          setIsAdmin(savedUser.is_staff || savedUser.is_superuser);
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  // Listen for logout events
  useEffect(() => {
    const handleLogout = () => {
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
    };

    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, []);

  const login = useCallback(async (username, password) => {
    setError(null);
    setLoading(true);
    
    try {
      const data = await apiLogin(username, password);
      
      // Store auth data
      setAuthToken(data.token);
      setAuthUser(data.user);
      
      // Update state
      setUser(data.user);
      setIsAuthenticated(true);
      setIsAdmin(data.user.is_staff || data.user.is_superuser);
      
      return { success: true };
    } catch (err) {
      setError(err.message || "Login failed");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch (err) {
      console.error("Logout API error:", err);
    } finally {
      // Clear storage and state regardless of API response
      removeAuthToken();
      removeAuthUser();
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
    }
  }, []);

  const checkAuth = useCallback(async () => {
    if (!isAuthenticated) return false;
    
    try {
      const adminCheck = await checkAdminStatus();
      setIsAdmin(adminCheck.is_admin);
      return adminCheck.is_admin;
    } catch (err) {
      console.error("Auth check failed:", err);
      // If check fails, log out the user
      await logout();
      return false;
    }
  }, [isAuthenticated, logout]);

  const value = {
    user,
    isAuthenticated,
    isAdmin,
    loading,
    error,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
