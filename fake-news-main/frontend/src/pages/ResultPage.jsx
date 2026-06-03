import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getValidationResult } from "../services/api";

export default function ResultPage() {
  const { submissionId } = useParams();
  const navigate         = useNavigate();
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!submissionId) return;

    const fetchResult = async () => {
      try {
        const data = await getValidationResult(submissionId);
        setResult(data);
        const done = ["COMPLETED", "FAILED", "completed", "failed"];
        if (data && (done.includes(data.status) || done.includes(data.processing_status))) {
          clearInterval(intervalRef.current);
        }
      } catch (err) {
        setError(err.message || "Failed to fetch result.");
        clearInterval(intervalRef.current);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
    intervalRef.current = setInterval(fetchResult, 2000);
    return () => clearInterval(intervalRef.current);
  }, [submissionId]);

  // _normalise_result returns everything at TOP level — NOT nested under result.result
  const isFake     = result?.classification === "fake";
  const confidence = result?.confidence ?? 0;

  return (
    <div className="page-bg" style={{ minHeight: "100vh" }}>
      <nav style={{ height: 60, display: "flex", alignItems: "center", borderBottom: "1px solid var(--border-subtle)", background: "rgba(5,8,16,0.85)", backdropFilter: "blur(16px)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px", width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link to="/" className="nav-logo">
            <span className="logo-mark">⌖</span>CheckDem
          </Link>
          <button onClick={() => navigate("/validate")} className="btn btn-ghost" style={{ fontSize: "0.85rem" }}>
            Verify Another
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "60px 24px", position: "relative", zIndex: 1 }}>

        {loading && !result && (
          <div className="card fade-in" style={{ textAlign: "center", padding: "64px 24px" }}>
            <div className="spinner" style={{ width: 36, height: 36, margin: "0 auto 20px" }} />
            <h2 className="display-text" style={{ fontSize: "1.4rem", marginBottom: 8 }}>Analyzing Content</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
              Running forensic checks across <span className="mono-text" style={{ color: "var(--amber)" }}>40+ credibility indicators</span>...
            </p>
          </div>
        )}

        {error && (
          <div className="alert alert-error"><span>⚠</span><span>{error}</span></div>
        )}

        {result && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }} className="fade-in">

            {/* Verdict card */}
            <div style={{ background: isFake ? "var(--red-dim)" : "var(--green-dim)", border: `1px solid ${isFake ? "var(--red-border)" : "var(--green-border)"}`, borderRadius: "var(--r-lg)", padding: "40px 36px", display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap" }}>
              <div style={{ width: 72, height: 72, borderRadius: "var(--r-md)", background: isFake ? "rgba(248,113,113,0.15)" : "rgba(74,222,128,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", flexShrink: 0 }}>
                {isFake ? "⚠" : "✓"}
              </div>
              <div style={{ flex: 1 }}>
                <div className="mono-text" style={{ fontSize: "0.7rem", letterSpacing: "0.12em", color: isFake ? "var(--red)" : "var(--green)", marginBottom: 6 }}>
                  CLASSIFICATION RESULT
                </div>
                <h2 className="display-text" style={{ fontSize: "2.4rem", color: isFake ? "var(--red)" : "var(--green)", marginBottom: 8 }}>
                  {isFake ? "Likely Fake" : "Likely Real"}
                </h2>
                <div style={{ maxWidth: 320 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Confidence</span>
                    <span className="mono-text" style={{ fontSize: "0.85rem", fontWeight: 600, color: isFake ? "var(--red)" : "var(--green)" }}>
                      {confidence}%
                    </span>
                  </div>
                  <div className="confidence-bar-track">
                    <div className={`confidence-bar-fill ${isFake ? "fake" : "real"}`} style={{ "--target-width": `${confidence}%`, width: `${confidence}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Validator badge */}
            {result.validator && (
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <span style={{ fontSize: "0.7rem", color: result.validator === "mistral" ? "var(--cyan)" : "var(--text-muted)", border: `1px solid ${result.validator === "mistral" ? "var(--cyan)" : "var(--border-ghost)"}`, borderRadius: "var(--r-sm)", padding: "4px 10px", fontFamily: "var(--font-mono)" }}>
                  {result.validator === "mistral" ? "◈ AI Analysis" : "◈ Heuristic Analysis"}
                </span>
              </div>
            )}

            {/* Analysis summary */}
            {result.explanation && (
              <div className="card">
                <h3 className="mono-text" style={{ fontSize: "0.7rem", letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: 12 }}>
                  ANALYSIS SUMMARY
                </h3>
                <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, fontSize: "0.9rem" }}>
                  {result.explanation}
                </p>
              </div>
            )}

            {/* Suspicious indicators — reads result.suspicious_elements */}
            {result.suspicious_elements?.length > 0 && (
              <div className="card">
                <h3 className="mono-text" style={{ fontSize: "0.7rem", letterSpacing: "0.1em", color: "var(--red)", marginBottom: 16 }}>
                  ⚠ SUSPICIOUS INDICATORS ({result.suspicious_elements.length})
                </h3>
                <ul style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {result.suspicious_elements.map((el, i) => (
                    <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: "0.875rem", paddingBottom: 10, borderBottom: i < result.suspicious_elements.length - 1 ? "1px solid var(--border-ghost)" : "none" }}>
                      <span className="mono-text" style={{ color: "var(--red)", flexShrink: 0, marginTop: 1 }}>⊘</span>
                      <span className="mono-text" style={{ color: "var(--red)", fontWeight: 600 }}>
                        {typeof el === "string" ? el : el.indicator || JSON.stringify(el)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Sources — URL validation prevents broken navigation */}
            {result.sources?.length > 0 && (
              <div className="card">
                <h3 className="mono-text" style={{ fontSize: "0.7rem", letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: 16 }}>
                  REFERENCE SOURCES
                </h3>
                <ul style={{ display: "flex", flexDirection: "column", gap: 8, overflowX: "hidden" }}>
                  {result.sources.map((src, i) => {
                    const isUrl = typeof src === "string" && (src.startsWith("http://") || src.startsWith("https://"));
                    return (
                      <li key={i}>
                        {isUrl ? (
                          <a href={src} target="_blank" rel="noopener noreferrer"
                            style={{ color: "var(--cyan)", fontSize: "0.85rem", textDecoration: "none", fontFamily: "var(--font-mono)", display: "flex", alignItems: "flex-start", gap: 6, wordBreak: "break-all", overflowWrap: "break-word" }}
                            onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
                            onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}>
                            ↗ {src}
                          </a>
                        ) : (
                          <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem", fontFamily: "var(--font-mono)", display: "flex", alignItems: "flex-start", gap: 6 }}>
                            ◈ {src}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            <button onClick={() => navigate("/validate")} className="btn btn-amber btn-lg" style={{ width: "100%", justifyContent: "center" }}>
              Verify Another Article →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
