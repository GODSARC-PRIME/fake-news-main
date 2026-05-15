import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { path: "/admin",             label: "Dashboard", icon: "▣" },
  { path: "/admin/stats",       label: "Statistics", icon: "◉" },
  { path: "/admin/submissions", label: "Submissions", icon: "≡" },
];

/**
 * AdminLayout — shared sidebar layout for all admin pages.
 * Fixes:
 *  - Logout button present on all admin pages
 *  - No more copy-pasted nav markup in each page
 */
export default function AdminLayout({ children, title }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="admin-layout page-bg">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        {/* Logo */}
        <div className="admin-sidebar-logo">
          <button
            onClick={() => navigate("/")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: 0,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                background: "var(--amber)",
                borderRadius: "var(--r-xs)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.85rem",
                fontWeight: 700,
                color: "#000",
              }}
            >
              ⌖
            </div>
            <span
              className="mono-text"
              style={{ color: "var(--text-primary)", fontSize: "0.95rem", fontWeight: 600 }}
            >
              CheckDem
            </span>
          </button>
          <div
            style={{
              marginTop: 12,
              fontSize: "0.65rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
            }}
          >
            Admin Console
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1 }}>
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`admin-nav-item ${location.pathname === item.path ? "active" : ""}`}
            >
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.9rem" }}>
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}

          <div
            style={{
              margin: "12px 20px",
              height: 1,
              background: "var(--border-ghost)",
            }}
          />

          <button
            onClick={() => navigate("/")}
            className="admin-nav-item"
          >
            <span style={{ fontFamily: "var(--font-mono)" }}>←</span>
            Public Site
          </button>
        </nav>

        {/* Footer / logout */}
        <div className="admin-sidebar-footer">
          {user && (
            <div
              style={{
                fontSize: "0.75rem",
                color: "var(--text-muted)",
                marginBottom: 12,
              }}
            >
              <span
                className="mono-text"
                style={{ color: "var(--text-secondary)", display: "block" }}
              >
                {user.username || user.email || "Admin"}
              </span>
              Logged in
            </div>
          )}
          <button
            onClick={handleLogout}
            className="btn btn-danger"
            style={{ width: "100%", fontSize: "0.8rem", padding: "8px 12px" }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="admin-content">
        {title && (
          <div style={{ marginBottom: 32 }}>
            <h1 className="display-text" style={{ fontSize: "2rem" }}>
              {title}
            </h1>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
