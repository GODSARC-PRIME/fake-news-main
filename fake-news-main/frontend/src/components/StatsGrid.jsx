import React from "react";

/**
 * StatsGrid — shared component used by AdminDashboard and AdminStats.
 * Fixes: stat card duplication between the two pages.
 */
export default function StatsGrid({ stats }) {
  if (!stats) return null;

  const cards = [
    {
      variant: "stat-total",
      label: "Total Submissions",
      value: stats.total_submissions ?? 0,
      color: "var(--cyan)",
      icon: "◈",
    },
    {
      variant: "stat-fake",
      label: "Fake Detected",
      value: stats.fake_count ?? 0,
      color: "var(--red)",
      icon: "⚠",
    },
    {
      variant: "stat-real",
      label: "Verified Real",
      value: stats.real_count ?? 0,
      color: "var(--green)",
      icon: "✓",
    },
    {
      variant: "stat-conf",
      label: "Avg Confidence",
      value: `${stats.avg_confidence ?? 0}%`,
      color: "var(--amber)",
      icon: "◎",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 16,
        marginBottom: 32,
      }}
    >
      {cards.map((card) => (
        <div key={card.variant} className={`card-stat ${card.variant}`}>
          <div
            className="mono-text"
            style={{ color: card.color, fontSize: "0.75rem", letterSpacing: "0.1em", marginBottom: 4 }}
          >
            {card.icon} {card.label.toUpperCase()}
          </div>
          <div className="stat-value" style={{ color: card.color }}>
            {card.value}
          </div>
        </div>
      ))}
    </div>
  );
}
