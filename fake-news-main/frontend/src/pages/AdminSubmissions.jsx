import React, { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import { getAdminSubmissions, deleteSubmission } from "../services/api";

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting]       = useState(null);

  useEffect(() => { fetchSubmissions(); }, []);

  const fetchSubmissions = async () => {
    try {
      const data = await getAdminSubmissions();
      setSubmissions(data);
    } catch (err) {
      setError(err.message || "Failed to load submissions.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this submission? This action cannot be undone.")) return;
    setDeleteError("");
    setDeleting(id);
    try {
      await deleteSubmission(id);
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setDeleteError(err.message || "Failed to delete submission.");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <AdminLayout title="Submissions">
      {deleteError && (
        <div className="alert alert-error" style={{ marginBottom: 16 }}>
          <span>⚠</span>
          <span>{deleteError}</span>
        </div>
      )}

      {loading && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--text-muted)", fontSize: "0.875rem" }}>
          <span className="spinner" />
          Loading submissions...
        </div>
      )}

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 24 }}>
          <span>⚠</span>
          <span>{error}</span>
        </div>
      )}

      {submissions && (
        <div
          className="card"
          style={{ padding: 0, overflow: "hidden" }}
        >
          {/* Header */}
          <div
            style={{
              padding: "20px 24px",
              borderBottom: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h3 className="section-heading" style={{ fontSize: "1.2rem", marginBottom: 0 }}>
              All Submissions
            </h3>
            <span
              className="mono-text"
              style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}
            >
              {submissions.length} RECORDS
            </span>
          </div>

          {/* Table */}
          {submissions.length === 0 ? (
            <div
              style={{
                padding: "60px 24px",
                textAlign: "center",
                color: "var(--text-muted)",
                fontSize: "0.875rem",
              }}
            >
              No submissions found
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Type</th>
                    <th>Classification</th>
                    <th>Confidence</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub) => (
                    <tr key={sub.id}>
                      <td>
                        <span
                          className="mono-text"
                          style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}
                        >
                          #{sub.id}
                        </span>
                      </td>
                      <td style={{ color: "var(--text-primary)", textTransform: "capitalize" }}>
                        {sub.content_type}
                      </td>
                      <td>
                        <span
                          className={`badge ${sub.classification === "fake" ? "badge-fake" : "badge-real"}`}
                        >
                          {sub.classification === "fake" ? "⚠ FAKE" : "✓ REAL"}
                        </span>
                      </td>
                      <td>
                        <span
                          className="mono-text"
                          style={{ color: "var(--text-primary)", fontSize: "0.85rem" }}
                        >
                          {sub.confidence}%
                        </span>
                      </td>
                      <td>
                        <span
                          className="mono-text"
                          style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}
                        >
                          {new Date(sub.created_at).toLocaleDateString("en-GB")}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleDelete(sub.id)}
                          disabled={deleting === sub.id}
                          className="btn btn-danger"
                          style={{ padding: "5px 12px", fontSize: "0.75rem" }}
                        >
                          {deleting === sub.id ? (
                            <span className="spinner" style={{ width: 12, height: 12 }} />
                          ) : (
                            "Delete"
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
