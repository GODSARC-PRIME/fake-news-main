import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { submitValidation } from "../services/api";

const TYPES = [
  { value: "text",  icon: "¶",  label: "Article Text",  desc: "Paste written content for analysis" },
  { value: "url",   icon: "⌗",  label: "Web URL",        desc: "Verify any online article" },
  { value: "media", icon: "◎",  label: "Media File",     desc: "Upload audio or video" },
];

export default function ValidationPage() {
  const [type, setType]             = useState("text");
  const [text, setText]             = useState("");
  const [url, setUrl]               = useState("");
  const [file, setFile]             = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [dragActive, setDragActive] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // FIX: pass a plain object — api.js submitValidation builds FormData internally.
      // Never pass a pre-built FormData; Axios can't read .text/.url from it.
      let payload = {};

      if (type === "text" && text.trim()) {
        payload = { text: text.trim() };
      } else if (type === "url" && url.trim()) {
        payload = { url: url.trim() };
      } else if (type === "media" && file) {
        // Route file to correct serializer field based on MIME type
        if (file.type.startsWith("audio/")) {
          payload = { audio: file };
        } else {
          payload = { video: file };
        }
      } else {
        setError("Please provide content to verify.");
        setLoading(false);
        return;
      }

      const res = await submitValidation(payload);
      // Backend returns both submission_id and id — use whichever is present
      navigate(`/result/${res.submission_id || res.id}`);
    } catch (err) {
      setError(err.message || "Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="page-bg" style={{ minHeight: "100vh" }}>
      {/* Nav */}
      <nav
        style={{
          height: 60,
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid var(--border-subtle)",
          background: "rgba(5,8,16,0.85)",
          backdropFilter: "blur(16px)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            maxWidth: 1000,
            margin: "0 auto",
            padding: "0 24px",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link to="/" className="nav-logo">
            <span className="logo-mark">⌖</span>
            CheckDem
          </Link>
          <Link to="/" className="nav-link" style={{ fontSize: "0.85rem" }}>
            ← Back to Home
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div
        style={{
          maxWidth: 760,
          margin: "0 auto",
          padding: "60px 24px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Header */}
        <div className="fade-in-down" style={{ marginBottom: 40 }}>
          <span className="badge badge-amber" style={{ marginBottom: 16, fontSize: "0.7rem" }}>
            ◈ INSTANT VERIFICATION
          </span>
          <h1
            className="display-text"
            style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", marginBottom: 10 }}
          >
            Verify Content
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: 480, lineHeight: 1.6 }}>
            Submit text, a URL, or a media file for comprehensive AI-powered
            misinformation analysis.
          </p>
        </div>

        {/* Form card */}
        <div className="card fade-in-up" style={{ padding: "32px 36px" }}>
          {error && (
            <div className="alert alert-error" style={{ marginBottom: 24 }}>
              <span>⚠</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Type selector */}
            <div style={{ marginBottom: 28 }}>
              <label className="form-label">Verification Type</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                {TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setType(t.value)}
                    style={{
                      background: type === t.value ? "var(--amber-dim)" : "var(--bg-surface)",
                      border: `1px solid ${type === t.value ? "var(--border-amber-strong)" : "var(--border-default)"}`,
                      borderRadius: "var(--r-md)",
                      padding: "16px 12px",
                      cursor: "pointer",
                      textAlign: "center",
                      transition: "all 0.2s",
                    }}
                  >
                    <div
                      className="mono-text"
                      style={{
                        fontSize: "1.3rem",
                        color: type === t.value ? "var(--amber)" : "var(--text-muted)",
                        marginBottom: 6,
                      }}
                    >
                      {t.icon}
                    </div>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        color: type === t.value ? "var(--text-primary)" : "var(--text-secondary)",
                        marginBottom: 2,
                      }}
                    >
                      {t.label}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                      {t.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Text */}
            {type === "text" && (
              <div style={{ marginBottom: 28 }}>
                <label className="form-label">Article Text</label>
                <textarea
                  className="form-textarea"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste the full article text here. More content yields more accurate results..."
                  required
                  disabled={loading}
                  rows={9}
                />
                <div style={{ marginTop: 6, fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  Minimum 50 characters recommended · {text.length} characters entered
                </div>
              </div>
            )}

            {/* URL */}
            {type === "url" && (
              <div style={{ marginBottom: 28 }}>
                <label className="form-label">Article URL</label>
                <input
                  type="url"
                  className="form-input"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/article"
                  required
                  disabled={loading}
                />
                <div style={{ marginTop: 6, fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  We'll fetch and analyze the page content in real time
                </div>
              </div>
            )}

            {/* Media */}
            {type === "media" && (
              <div style={{ marginBottom: 28 }}>
                <label className="form-label">Media File</label>
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  style={{
                    border: `2px dashed ${dragActive ? "var(--amber)" : "var(--border-default)"}`,
                    borderRadius: "var(--r-md)",
                    background: dragActive ? "var(--amber-dim)" : "var(--bg-surface)",
                    padding: "36px 24px",
                    textAlign: "center",
                    transition: "all 0.2s",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="file"
                    id="media-upload"
                    accept="audio/*,video/*,.mp3,.mp4,.wav,.ogg,.webm,.m4a,.aac"
                    style={{ display: "none" }}
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    disabled={loading}
                  />
                  <label htmlFor="media-upload" style={{ cursor: "pointer", display: "block" }}>
                    <div
                      className="mono-text"
                      style={{ fontSize: "2rem", color: "var(--text-muted)", marginBottom: 10 }}
                    >
                      ↑
                    </div>
                    <div style={{ fontWeight: 600, marginBottom: 4, fontSize: "0.9rem" }}>
                      Drop file here or click to browse
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      MP3, MP4, WAV, OGG, M4A · Max 100 MB · Audio transcribed automatically
                    </div>
                    {file && (
                      <div
                        className="badge badge-amber"
                        style={{ marginTop: 12, display: "inline-flex" }}
                      >
                        ✓ {file.name}
                      </div>
                    )}
                  </label>
                </div>
                <div style={{ marginTop: 8, fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  💡 If files don't appear in the picker, browse to the folder containing your audio or video files
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-amber btn-lg"
              style={{ width: "100%", justifyContent: "center" }}
            >
              {loading ? (
                <>
                  <span className="spinner" style={{ width: 18, height: 18 }} />
                  Analyzing Content...
                </>
              ) : (
                "Start Verification →"
              )}
            </button>

            <div
              style={{
                marginTop: 16,
                textAlign: "center",
                fontSize: "0.75rem",
                color: "var(--text-muted)",
              }}
            >
              ⊕ All submissions are encrypted and processed privately
            </div>
          </form>
        </div>

        {/* Info strip */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 12,
            marginTop: 20,
          }}
        >
          {[
            { icon: "⚡", title: "Under 2 Seconds", desc: "Average analysis time" },
            { icon: "◎", title: "99.8% Accuracy",   desc: "Verified against known datasets" },
            { icon: "⊕", title: "Encrypted",         desc: "Zero-knowledge processing" },
          ].map((c, i) => (
            <div
              key={i}
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-ghost)",
                borderRadius: "var(--r-md)",
                padding: "16px 18px",
                display: "flex",
                gap: 12,
                alignItems: "center",
              }}
            >
              <span className="mono-text" style={{ color: "var(--amber)", fontSize: "1.1rem" }}>
                {c.icon}
              </span>
              <div>
                <div style={{ fontSize: "0.8rem", fontWeight: 600 }}>{c.title}</div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{c.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
