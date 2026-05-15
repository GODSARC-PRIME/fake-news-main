import React, { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import StatsGrid from "../components/StatsGrid";
import { getAdminStats, getAdminActivity } from "../services/api";

export default function AdminDashboard() {
  const [stats, setStats]       = useState(null);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [s, a] = await Promise.all([getAdminStats(), getAdminActivity()]);
        setStats(s);
        setActivity(a);
      } catch (err) {
        setError(err.message || "Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <AdminLayout title="Dashboard">
      {loading && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--text-muted)", fontSize: "0.875rem" }}>
          <span className="spinner" />
          Loading dashboard data...
        </div>
      )}

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 24 }}>
          <span>⚠</span>
          <span>{error}</span>
        </div>
      )}

      {/* Stats — shared component, no duplication */}
      <StatsGrid stats={stats} />

      {/* Recent Activity */}
      {activity && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div
            style={{
              padding: "20px 24px",
              borderBottom: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h3
              className="section-heading"
              style={{ fontSize: "1.2rem", marginBottom: 0 }}
            >
              Recent Activity
            </h3>
            <span
              className="mono-text"
              style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}
            >
              LAST 5 SUBMISSIONS
            </span>
          </div>

          {activity.recent_submissions?.length === 0 && (
            <div style={{ padding: "40px 24px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.875rem" }}>
              No submissions yet
            </div>
          )}

          {activity.recent_submissions?.slice(0, 5).map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 24px",
                borderBottom: i < 4 ? "1px solid var(--border-ghost)" : "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span
                  className="mono-text"
                  style={{ color: "var(--text-muted)", fontSize: "0.75rem", minWidth: 20 }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                  {item.content_type}
                </span>
              </div>
              <span
                className={`badge ${item.classification === "fake" ? "badge-fake" : "badge-real"}`}
              >
                {item.classification === "fake" ? "⚠ FAKE" : "✓ REAL"}
              </span>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
