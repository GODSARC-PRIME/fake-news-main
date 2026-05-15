import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { submitValidation } from "../services/api";

export default function ValidationPage() {
  const [validationType, setValidationType] = useState("text");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();

      if (validationType === "text" && text) {
        formData.append("content_type", "text");
        formData.append("text_content", text);
      } else if (validationType === "url" && url) {
        formData.append("content_type", "url");
        formData.append("url", url);
      } else if (validationType === "media" && file) {
        formData.append("content_type", "media");
        formData.append("media_file", file);
      } else {
        setError("Please provide content to validate");
        setLoading(false);
        return;
      }

      const response = await submitValidation(formData);
      navigate(`/result/${response.id}`);
    } catch (err) {
      setError(err.message || "Validation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="relative min-h-screen" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #1e0a47 100%)" }}>
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          style={{ animation: "floatUp 6s ease-in-out infinite" }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          style={{ animation: "floatUp 8s ease-in-out infinite", animationDirection: "reverse" }}
        />
      </div>

      {/* Premium Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-purple-400/30 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform">
                <span className="text-lg font-bold text-white">🔍</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                CheckDem
              </span>
            </Link>
            <Link
              to="/"
              className="text-gray-300 hover:text-white transition-colors text-sm font-medium flex items-center gap-2 group"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-purple-400/50 backdrop-blur-sm">
            <p className="text-purple-200 text-sm font-semibold">🚀 Instant Verification</p>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Verify Content
            <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">in Real-Time</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Upload text, URLs, or media files for comprehensive AI-powered misinformation detection
          </p>
        </div>

        {/* Premium Form Card */}
        <div className="fade-in-up backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-purple-400/30 rounded-2xl p-8 shadow-2xl">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-400/50 backdrop-blur-sm animate-pulse">
              <div className="flex items-start gap-3">
                <span className="text-xl">⚠️</span>
                <div>
                  <p className="font-semibold text-red-200">Verification Error</p>
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Content Type Selection */}
            <div>
              <label className="block text-white font-bold mb-4 text-lg">
                Choose Verification Type 📌
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { value: "text", icon: "📝", label: "Text Article", desc: "Analyze written content" },
                  { value: "url", icon: "🔗", label: "Web URL", desc: "Check online article" },
                  { value: "media", icon: "🎬", label: "Media File", desc: "Upload audio/video" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setValidationType(option.value)}
                    className={`group p-6 rounded-xl border-2 transition-all transform hover:scale-105 ${
                      validationType === option.value
                        ? "border-purple-400 bg-gradient-to-br from-purple-500/30 to-purple-500/10 shadow-lg shadow-purple-500/30"
                        : "border-purple-300/30 bg-white/5 hover:border-purple-400/60 hover:bg-white/10"
                    }`}
                  >
                    <div className="text-3xl mb-2 group-hover:scale-125 transition-transform">{option.icon}</div>
                    <div className="font-semibold text-white">{option.label}</div>
                    <p className="text-sm text-gray-400 mt-1 group-hover:text-gray-300 transition-colors">{option.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Text Input */}
            {validationType === "text" && (
              <div className="fade-in-up">
                <label className="block text-white font-bold mb-3 text-lg">
                  📝 Paste Article Text
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full px-4 py-4 rounded-lg bg-white/10 border border-purple-300/30 text-white placeholder-gray-500 backdrop-blur-sm transition-all focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                  rows="8"
                  placeholder="Paste the full article text here. The more content you provide, the more accurate the analysis will be..."
                  required
                  disabled={loading}
                />
                <p className="text-sm text-gray-400 mt-2">💡 Minimum 50 characters recommended for best analysis results</p>
              </div>
            )}

            {/* URL Input */}
            {validationType === "url" && (
              <div className="fade-in-up">
                <label className="block text-white font-bold mb-3 text-lg">
                  🔗 Enter Article URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-4 py-4 rounded-lg bg-white/10 border border-purple-300/30 text-white placeholder-gray-500 backdrop-blur-sm transition-all focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="https://example.com/article"
                  required
                  disabled={loading}
                />
                <p className="text-sm text-gray-400 mt-2">📡 We'll fetch and analyze the article from the provided URL</p>
              </div>
            )}

            {/* File Upload */}
            {validationType === "media" && (
              <div className="fade-in-up">
                <label className="block text-white font-bold mb-3 text-lg">
                  🎬 Upload Media File
                </label>
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                    dragActive
                      ? "border-purple-400 bg-purple-500/20"
                      : "border-purple-300/30 bg-white/5 hover:border-purple-400/60 hover:bg-white/10"
                  }`}
                >
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0])}
                    className="hidden"
                    id="media-input"
                    accept="audio/*,video/*"
                    required
                    disabled={loading}
                  />
                  <label htmlFor="media-input" className="cursor-pointer block">
                    <div className="text-5xl mb-3 animate-bounce">📤</div>
                    <p className="font-bold text-white text-lg">Click to upload or drag & drop</p>
                    <p className="text-sm text-gray-400 mt-2">MP3, MP4, WAV, or other audio/video formats</p>
                    {file && (
                      <p className="text-sm text-purple-300 mt-4 font-semibold animate-pulse">
                        ✓ {file.name} selected
                      </p>
                    )}
                  </label>
                </div>
                <p className="text-sm text-gray-400 mt-3">📏 Max file size: 100MB | 🎙️ Audio will be transcribed automatically</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full group relative mt-8 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verifying Content...
                  </>
                ) : (
                  <>✨ Start Verification</>
                )}
              </span>
            </button>

            {/* Security Notice */}
            <div className="flex items-center justify-center gap-3 text-gray-400 text-sm">
              <span>🔒</span>
              <span>Your data is encrypted and secure. We process submissions privately.</span>
            </div>
          </form>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {[
            { icon: "⚡", title: "Lightning Fast", desc: "Results in under 2 seconds on average" },
            { icon: "🎯", title: "Highly Accurate", desc: "99.8% accuracy rate with advanced ML" },
            { icon: "🔐", title: "Enterprise Secure", desc: "Bank-level encryption & GDPR compliant" },
          ].map((card, idx) => (
            <div
              key={idx}
              className="fade-in-up p-6 rounded-lg bg-gradient-to-br from-white/10 to-white/5 border border-purple-400/30 hover:border-purple-400/60 transition-all transform hover:scale-105"
              style={{ animation: `fadeInUp 0.7s ease-out ${idx * 0.1}s both` }}
            >
              <div className="text-3xl mb-3">{card.icon}</div>
              <h3 className="font-bold text-white mb-2">{card.title}</h3>
              <p className="text-gray-400 text-sm">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
