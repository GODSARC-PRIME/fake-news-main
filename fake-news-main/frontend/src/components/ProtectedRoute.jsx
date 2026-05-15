import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// FIX: prop renamed from `requireAdmin` to `adminOnly` to match App.jsx usage
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--bg-void)" }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="spinner" style={{ width: 36, height: 36 }} />
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", fontFamily: "var(--font-mono)" }}>
            Verifying credentials...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "var(--bg-void)" }}
      >
        <div className="text-center" style={{ maxWidth: 400 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "var(--r-md)",
              background: "var(--red-dim)",
              border: "1px solid var(--red-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              fontSize: "1.75rem",
            }}
          >
            🔒
          </div>
          <h1
            className="display-text"
            style={{ fontSize: "1.6rem", marginBottom: 8 }}
          >
            Access Denied
          </h1>
          <p style={{ color: "var(--text-secondary)", marginBottom: 24, fontSize: "0.9rem" }}>
            You don't have the required permissions to access this page.
          </p>
          <a href="/" className="btn btn-ghost">
            ← Return Home
          </a>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
