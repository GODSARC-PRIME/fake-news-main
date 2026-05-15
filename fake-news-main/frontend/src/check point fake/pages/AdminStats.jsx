import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminStats, getAdminTrends, getAdminSuspiciousWords } from "../services/api";

export default function AdminStats() {
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState(null);
  const [suspiciousWords, setSuspiciousWords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStatsData = async () => {
      try {
        const [statsData, trendsData, wordsData] = await Promise.all([
          getAdminStats(),
          getAdminTrends(),
          getAdminSuspiciousWords(),
        ]);
        setStats(statsData);
        setTrends(trendsData);
        setSuspiciousWords(wordsData);
      } catch (err) {
        setError(err.message || "Failed to fetch statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStatsData();
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
                onClick={() => navigate("/admin")}
                className="text-gray-600 hover:text-indigo-600"
              >
                Dashboard
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
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Statistics</h2>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin text-4xl">⏳</div>
            <p className="text-gray-600 mt-4">Loading statistics...</p>
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

        {trends && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Trends</h3>
            {trends.daily_stats ? (
              <div className="space-y-4">
                {Object.entries(trends.daily_stats).map(([date, count]) => (
                  <div key={date} className="flex items-center">
                    <span className="text-gray-600 w-24">{date}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-8 ml-4">
                      <div
                        className="bg-indigo-600 h-8 rounded-full"
                        style={{
                          width: `${Math.min(count * 5, 100)}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-gray-600 ml-4 w-8">{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No trend data available</p>
            )}
          </div>
        )}

        {suspiciousWords && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              Most Suspicious Words
            </h3>
            {suspiciousWords.word_frequency ? (
              <div className="space-y-3">
                {Object.entries(suspiciousWords.word_frequency)
                  .slice(0, 10)
                  .map(([word, frequency]) => (
                    <div key={word} className="flex items-center justify-between">
                      <span className="font-semibold text-gray-700">{word}</span>
                      <span className="text-gray-600">{frequency} occurrences</span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-600">No word data available</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
