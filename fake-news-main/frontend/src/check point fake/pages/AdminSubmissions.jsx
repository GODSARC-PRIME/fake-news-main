import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminSubmissions, deleteSubmission } from "../services/api";

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const data = await getAdminSubmissions();
      setSubmissions(data);
    } catch (err) {
      setError(err.message || "Failed to fetch submissions");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (submissionId) => {
    if (!window.confirm("Are you sure you want to delete this submission?")) {
      return;
    }

    try {
      setDeleteError("");
      await deleteSubmission(submissionId);
      setSubmissions(
        submissions.filter((item) => item.id !== submissionId)
      );
    } catch (err) {
      setDeleteError(err.message || "Failed to delete submission");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-indigo-600">CheckDem Admin</h1>
            <div className="space-x-4">
              <button
                onClick={() => navigate("/admin")}
                className="text-gray-600 hover:text-indigo-600"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate("/admin/stats")}
                className="text-gray-600 hover:text-indigo-600"
              >
                Statistics
              </button>
              <button
                onClick={() => navigate("/")}
                className="text-gray-600 hover:text-indigo-600"
              >
                Home
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Submissions</h2>

        {deleteError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg mb-4">
            {deleteError}
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin text-4xl">⏳</div>
            <p className="text-gray-600 mt-4">Loading submissions...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg">
            {error}
          </div>
        )}

        {submissions && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Classification
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Confidence
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission) => (
                  <tr key={submission.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {submission.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {submission.content_type}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          submission.classification === "fake"
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {submission.classification === "fake"
                          ? "Fake"
                          : "Real"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {submission.confidence}%
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {new Date(submission.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => handleDelete(submission.id)}
                        className="text-red-600 hover:text-red-700 font-semibold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {submissions.length === 0 && (
              <div className="text-center py-12 text-gray-600">
                No submissions found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
