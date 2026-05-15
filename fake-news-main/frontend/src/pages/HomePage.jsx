import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const stats = [
  { value: "10M+",  label: "Articles Analyzed",    mono: true },
  { value: "99.8%", label: "Detection Accuracy",    mono: true },
  { value: "150+",  label: "Countries Served",       mono: true },
  { value: "24/7",  label: "Real-time Monitoring",   mono: true },
];

const features = [
  { icon: "¶", title: "Text Analysis",      desc: "Advanced NLP detects misinformation patterns, sentiment bias, and propaganda techniques in written content." },
  { icon: "⌗", title: "URL Intelligence",   desc: "Domain reputation scoring, source verification, and real-time content authenticity checks on any URL." },
  { icon: "◎", title: "Media Processing",   desc: "AI-powered transcription, deepfake detection, and forensic multimedia analysis for audio and video." },
  { icon: "∿", title: "ML-Powered Engine",  desc: "Continuous learning pipeline trained on fact-checking databases and thousands of credibility indicators." },
  { icon: "⊞", title: "Enterprise Grade",   desc: "Bank-level encryption, GDPR compliant architecture, zero-knowledge data handling." },
  { icon: "◈", title: "Real-time Analytics",desc: "Live dashboard insights, trend tracking, and comprehensive verification reports with evidence trails." },
];

export default function HomePage() {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // FIX: logout now calls AuthContext logout() instead of navigating to /login
  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="page-bg" style={{ minHeight: "100vh" }}>
      {/* ── Navigation ── */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          height: 60,
          display: "flex",
          alignItems: "center",
          background: scrolled ? "rgba(5,8,16,0.92)" : "rgba(5,8,16,0.6)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: scrolled
            ? "1px solid rgba(245,158,11,0.2)"
            : "1px solid rgba(255,255,255,0.06)",
          transition: "all 0.3s ease",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 24px",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <Link to="/" className="nav-logo">
            <span className="logo-mark">⌖</span>
            CheckDem
          </Link>

          {/* Links */}
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <Link to="/validate" className="nav-link">Verify Content</Link>
            {isAuthenticated && isAdmin && (
              <Link to="/admin" className="nav-link">Admin</Link>
            )}
          </div>

          {/* Auth */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {isAuthenticated ? (
              <button onClick={handleLogout} className="btn btn-ghost" style={{ fontSize: "0.85rem" }}>
                Sign Out
              </button>
            ) : (
              <>
                <Link to="/validate" className="btn btn-ghost" style={{ fontSize: "0.85rem" }}>
                  Try Free
                </Link>
                <Link to="/login" className="btn btn-amber" style={{ fontSize: "0.85rem" }}>
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "100px 24px 80px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Label */}
        <div className="fade-in-down" style={{ textAlign: "center", marginBottom: 28 }}>
          <span className="badge badge-amber" style={{ fontSize: "0.7rem", letterSpacing: "0.1em" }}>
            ◈ AI-POWERED FACT VERIFICATION
          </span>
        </div>

        {/* Headline */}
        <h1
          className="display-text fade-in-down"
          style={{
            fontSize: "clamp(3rem, 7vw, 5.5rem)",
            textAlign: "center",
            lineHeight: 1.05,
            marginBottom: 12,
            animationDelay: "0.05s",
          }}
        >
          Detect Misinformation
          <br />
          <span className="text-gradient-amber">in Real-Time</span>
        </h1>

        {/* Subhead */}
        <p
          className="fade-in-up"
          style={{
            textAlign: "center",
            color: "var(--text-secondary)",
            fontSize: "1.1rem",
            maxWidth: 580,
            margin: "0 auto 48px",
            lineHeight: 1.7,
            animationDelay: "0.15s",
          }}
        >
          Enterprise-grade AI verification for news articles, social media,
          URLs, and multimedia files — with instant credibility scores and evidence trails.
        </p>

        {/* CTAs */}
        <div
          className="fade-in-up"
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
            animationDelay: "0.25s",
          }}
        >
          <Link to="/validate" className="btn btn-amber btn-lg">
            Start Verifying →
          </Link>
          {!isAuthenticated && (
            <Link to="/login" className="btn btn-ghost btn-lg">
              Admin Access
            </Link>
          )}
        </div>

        {/* Scan animation strip */}
        <div
          style={{
            position: "relative",
            maxWidth: 680,
            margin: "72px auto 0",
            borderRadius: "var(--r-lg)",
            border: "1px solid var(--border-subtle)",
            background: "var(--bg-surface)",
            padding: "20px 24px",
            overflow: "hidden",
          }}
        >
          {/* Scanline */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              height: 2,
              background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.6), transparent)",
              animation: "scanline 2.5s linear infinite",
            }}
          />
          <div
            className="mono-text"
            style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 12 }}
          >
            SAMPLE ANALYSIS
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: 4 }}>
                "Breaking: Scientists confirm revolutionary energy discovery..."
              </div>
              <div className="mono-text" style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>
                Source: example-news.com • Analyzed 0.4s ago
              </div>
            </div>
            <span className="badge badge-fake" style={{ marginLeft: 16, flexShrink: 0 }}>
              ⚠ FAKE · 94%
            </span>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 80px", position: "relative", zIndex: 1 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 1,
            background: "var(--border-subtle)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--r-lg)",
            overflow: "hidden",
          }}
        >
          {stats.map((s, i) => (
            <div
              key={i}
              style={{
                background: "var(--bg-card)",
                padding: "32px 28px",
                textAlign: "center",
              }}
            >
              <div
                className="mono-text"
                style={{ fontSize: "2.4rem", fontWeight: 600, color: "var(--amber)", letterSpacing: "-0.04em" }}
              >
                {s.value}
              </div>
              <div
                style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 6, letterSpacing: "0.06em", textTransform: "uppercase" }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 80px", position: "relative", zIndex: 1 }}>
        <div style={{ marginBottom: 48 }}>
          <h2
            className="display-text"
            style={{ fontSize: "clamp(2rem, 4vw, 3rem)", marginBottom: 8 }}
          >
            Forensic-grade analysis<br />
            <em style={{ color: "var(--amber)" }}>powered by AI</em>
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", maxWidth: 480 }}>
            Multi-layer verification trained on millions of confirmed fact-checks across 40+ languages.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 1,
            background: "var(--border-subtle)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--r-lg)",
            overflow: "hidden",
          }}
        >
          {features.map((f, i) => (
            <div
              key={i}
              className="card"
              style={{
                borderRadius: 0,
                border: "none",
                borderTop: i >= 3 ? "1px solid var(--border-ghost)" : "none",
              }}
            >
              <div
                className="mono-text"
                style={{ fontSize: "1.5rem", color: "var(--amber)", marginBottom: 12 }}
              >
                {f.icon}
              </div>
              <h3
                style={{ fontSize: "1.05rem", fontWeight: 600, marginBottom: 8, color: "var(--text-primary)" }}
              >
                {f.title}
              </h3>
              <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Trust Strip ── */}
      <section
        style={{
          borderTop: "1px solid var(--border-subtle)",
          borderBottom: "1px solid var(--border-subtle)",
          background: "var(--bg-surface)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "40px 24px",
            display: "flex",
            justifyContent: "space-around",
            flexWrap: "wrap",
            gap: 24,
            textAlign: "center",
          }}
        >
          {[
            { icon: "⊕", label: "SSL Encrypted",      sub: "All data in transit & at rest" },
            { icon: "⌬", label: "GDPR Compliant",      sub: "Full privacy regulation support" },
            { icon: "◎", label: "Under 2s Results",    sub: "Average analysis turnaround" },
          ].map((t, i) => (
            <div key={i}>
              <div className="mono-text" style={{ fontSize: "1.2rem", color: "var(--amber)", marginBottom: 6 }}>
                {t.icon}
              </div>
              <div style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: 2 }}>
                {t.label}
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                {t.sub}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section
        style={{
          maxWidth: 700,
          margin: "0 auto",
          padding: "100px 24px",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <h2
          className="display-text"
          style={{ fontSize: "clamp(2rem, 4vw, 3rem)", marginBottom: 16 }}
        >
          Ready to fight misinformation?
        </h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: 36, fontSize: "0.95rem" }}>
          Join thousands of journalists, researchers, and organizations who rely on CheckDem every day.
        </p>
        <Link to="/validate" className="btn btn-amber btn-lg">
          Start Free Verification →
        </Link>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--border-ghost)",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <span
          className="mono-text"
          style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}
        >
          CheckDem © {new Date().getFullYear()} · Misinformation Detection Platform
        </span>
      </footer>
    </div>
  );
}
