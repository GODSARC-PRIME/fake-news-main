import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// NOTE FOR DEVELOPERS: Demo credentials removed from visible UI.
// For local development, set them via .env or your backend seed script.
// Default dev credentials: admin / admin123 (remove before production deploy)

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await login(username, password);
      if (result.success) {
        navigate("/admin");
      } else {
        setError(result.error || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="page-bg"
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      {/* Top bar */}
      <div
        style={{
          height: 60,
          display: "flex",
          alignItems: "center",
          padding: "0 24px",
          borderBottom: "1px solid var(--border-ghost)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Link to="/" className="nav-logo">
          <span className="logo-mark">⌖</span>
          CheckDem
        </Link>
      </div>

      {/* Centered card */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ width: "100%", maxWidth: 420 }}>
          {/* Back link */}
          <Link
            to="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              color: "var(--text-muted)",
              textDecoration: "none",
              fontSize: "0.85rem",
              marginBottom: 28,
              transition: "color 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.color = "var(--text-primary)"}
            onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
          >
            ← Back to home
          </Link>

          {/* Card */}
          <div
            className="card fade-in-up"
            style={{ padding: 36 }}
          >
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  background: "var(--amber-dim)",
                  border: "1px solid var(--border-amber)",
                  borderRadius: "var(--r-md)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  fontSize: "1.4rem",
                }}
              >
                ⌖
              </div>
              <h1
                className="display-text"
                style={{ fontSize: "1.8rem", marginBottom: 6 }}
              >
                Admin Portal
              </h1>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                Sign in to access the CheckDem console
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="alert alert-error" style={{ marginBottom: 20 }}>
                <span>⚠</span>
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <label className="form-label">Username</label>
                <input
                  type="text"
                  className="form-input"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  disabled={loading}
                  autoComplete="username"
                />
              </div>

              <div>
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-amber btn-lg"
                style={{ marginTop: 4, justifyContent: "center" }}
              >
                {loading ? (
                  <>
                    <span className="spinner" style={{ width: 16, height: 16 }} />
                    Authenticating...
                  </>
                ) : (
                  "Sign In →"
                )}
              </button>
            </form>

            {/* Footer */}
            <div
              style={{
                marginTop: 28,
                paddingTop: 20,
                borderTop: "1px solid var(--border-ghost)",
                textAlign: "center",
              }}
            >
              <p style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
                Access is restricted to authorized administrators only.
              </p>
            </div>
          </div>

          {/* Trust badges */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 24,
              marginTop: 24,
            }}
          >
            {["⊕ SSL Encrypted", "⌬ GDPR Compliant"].map(label => (
              <span
                key={label}
                className="mono-text"
                style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
