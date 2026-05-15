import React, { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import StatsGrid from "../components/StatsGrid";
import { getAdminStats, getAdminTrends, getAdminSuspiciousWords } from "../services/api";

export default function AdminStats() {
  const [stats, setStats]                   = useState(null);
  const [trends, setTrends]                 = useState(null);
  const [suspiciousWords, setSuspiciousWords] = useState(null);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [s, t, w] = await Promise.all([
          getAdminStats(),
          getAdminTrends(),
          getAdminSuspiciousWords(),
        ]);
        setStats(s);
        setTrends(t);
        setSuspiciousWords(w);
      } catch (err) {
        setError(err.message || "Failed to load statistics.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Find max count to normalize bar widths
  const maxCount = trends?.daily_stats
    ? Math.max(...Object.values(trends.daily_stats), 1)
    : 1;

  return (
    <AdminLayout title="Statistics">
      {loading && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--text-muted)", fontSize: "0.875rem" }}>
          <span className="spinner" />
          Loading statistics...
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

      {/* Trends */}
      {trends && (
        <div className="card" style={{ padding: 0, overflow: "hidden", marginBottom: 16 }}>
          <div
            style={{
              padding: "20px 24px",
              borderBottom: "1px solid var(--border-subtle)",
            }}
          >
            <h3 className="section-heading" style={{ fontSize: "1.2rem", marginBottom: 0 }}>
              Daily Submission Trends
            </h3>
          </div>

          <div style={{ padding: "24px" }}>
            {trends.daily_stats ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {Object.entries(trends.daily_stats).map(([date, count]) => (
                  <div key={date} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span
                      className="mono-text"
                      style={{ fontSize: "0.75rem", color: "var(--text-muted)", minWidth: 90 }}
                    >
                      {date}
                    </span>
                    <div style={{ flex: 1, position: "relative" }}>
                      <div className="confidence-bar-track">
                        <div
                          style={{
                            height: "100%",
                            width: `${(count / maxCount) * 100}%`,
                            background: "linear-gradient(90deg, var(--amber), rgba(245,158,11,0.5))",
                            borderRadius: 100,
                            transition: "width 0.6s ease",
                          }}
                        />
                      </div>
                    </div>
                    <span
                      className="mono-text"
                      style={{ fontSize: "0.8rem", color: "var(--amber)", minWidth: 24, textAlign: "right" }}
                    >
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
                No trend data available yet
              </p>
            )}
          </div>
        </div>
      )}

      {/* Suspicious words */}
      {suspiciousWords && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div
            style={{
              padding: "20px 24px",
              borderBottom: "1px solid var(--border-subtle)",
            }}
          >
            <h3 className="section-heading" style={{ fontSize: "1.2rem", marginBottom: 0 }}>
              Top Suspicious Words
            </h3>
          </div>

          <div style={{ padding: 0 }}>
            {suspiciousWords.word_frequency ? (
              Object.entries(suspiciousWords.word_frequency)
                .slice(0, 10)
                .map(([word, freq], i) => (
                  <div
                    key={word}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 24px",
                      borderBottom: i < 9 ? "1px solid var(--border-ghost)" : "none",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span
                        className="mono-text"
                        style={{ color: "var(--text-muted)", fontSize: "0.7rem", minWidth: 20 }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className="mono-text"
                        style={{ color: "var(--text-primary)", fontSize: "0.9rem" }}
                      >
                        {word}
                      </span>
                    </div>
                    <span className="badge badge-fake" style={{ fontSize: "0.7rem" }}>
                      {freq}×
                    </span>
                  </div>
                ))
            ) : (
              <p style={{ padding: "24px", color: "var(--text-muted)", fontSize: "0.875rem" }}>
                No word frequency data available
              </p>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
