import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminStats, getAdminActivity } from "../services/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsData, activityData] = await Promise.all([
          getAdminStats(),
          getAdminActivity(),
        ]);
        setStats(statsData);
        setActivity(activityData);
      } catch (err) {
        setError(err.message || "Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-indigo-600">CheckDem Admin</h1>
            <div className="space-x-4">
              <button
                onClick={() => navigate("/admin/stats")}
                className="text-gray-600 hover:text-indigo-600"
              >
                Statistics
              </button>
              <button
                onClick={() => navigate("/admin/submissions")}
                className="text-gray-600 hover:text-indigo-600"
              >
                Submissions
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
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h2>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin text-4xl">⏳</div>
            <p className="text-gray-600 mt-4">Loading dashboard...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg">
            {error}
          </div>
        )}

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-gray-600 text-sm font-semibold">
                Total Submissions
              </div>
              <div className="text-3xl font-bold text-indigo-600 mt-2">
                {stats.total_submissions || 0}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-gray-600 text-sm font-semibold">
                Fake Detected
              </div>
              <div className="text-3xl font-bold text-red-600 mt-2">
                {stats.fake_count || 0}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-gray-600 text-sm font-semibold">
                Real Content
              </div>
              <div className="text-3xl font-bold text-green-600 mt-2">
                {stats.real_count || 0}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-gray-600 text-sm font-semibold">
                Avg Confidence
              </div>
              <div className="text-3xl font-bold text-yellow-600 mt-2">
                {stats.avg_confidence || 0}%
              </div>
            </div>
          </div>
        )}

        {activity && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {activity.recent_submissions?.slice(0, 5).map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 border-b last:border-b-0"
                >
                  <span className="text-gray-600">{item.content_type}</span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      item.classification === "fake"
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {item.classification === "fake" ? "Fake" : "Real"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
