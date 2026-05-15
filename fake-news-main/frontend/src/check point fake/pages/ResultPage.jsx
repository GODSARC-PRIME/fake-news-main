import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getValidationResult } from "../services/api";

export default function ResultPage() {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const data = await getValidationResult(submissionId);
        setResult(data);
      } catch (err) {
        setError(err.message || "Failed to fetch result");
      } finally {
        setLoading(false);
      }
    };

    if (submissionId) {
      fetchResult();
      // Poll for result if status is pending
      const interval = setInterval(fetchResult, 2000);
      return () => clearInterval(interval);
    }
  }, [submissionId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <a href="/" className="text-2xl font-bold text-indigo-600">
              CheckDem
            </a>
            <button
              onClick={() => navigate("/validate")}
              className="text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              Check Another
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {loading && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="inline-block animate-spin">⏳</div>
            <p className="text-gray-600 mt-4">Analyzing content...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-6">
            {/* Classification Result */}
            <div className={`rounded-lg shadow-lg p-8 ${
              result.classification === "fake"
                ? "bg-red-50 border-2 border-red-400"
                : "bg-green-50 border-2 border-green-400"
            }`}>
              <div className="text-center">
                <div className="text-6xl mb-4">
                  {result.classification === "fake" ? "⚠️" : "✅"}
                </div>
                <h2 className="text-4xl font-bold mb-2">
                  {result.classification === "fake" ? "Likely Fake" : "Likely Real"}
                </h2>
                <p className="text-2xl font-semibold text-gray-700">
                  Confidence: {result.confidence}%
                </p>
              </div>
            </div>

            {/* Explanation */}
            {result.explanation && (
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Analysis</h3>
                <p className="text-gray-600 leading-relaxed">
                  {result.explanation}
                </p>
              </div>
            )}

            {/* Suspicious Elements */}
            {result.suspicious_elements && result.suspicious_elements.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  Suspicious Elements Found
                </h3>
                <ul className="space-y-2">
                  {result.suspicious_elements.map((element, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-red-500 mr-3">•</span>
                      <span className="text-gray-600">{element}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Sources */}
            {result.sources && result.sources.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">References</h3>
                <ul className="space-y-2">
                  {result.sources.map((source, index) => (
                    <li key={index} className="text-blue-600 hover:underline">
                      <a href={source} target="_blank" rel="noopener noreferrer">
                        {source}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Check Another */}
            <button
              onClick={() => navigate("/validate")}
              className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Check Another Article
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
