import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(username, password);
      if (result.success) {
        navigate("/admin");
      } else {
        setError(result.error || "Login failed");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
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

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-8 transition-colors group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            Back to Home
          </Link>

          {/* Premium Login Card */}
          <div className="fade-in-up backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-purple-400/30 rounded-2xl p-8 shadow-2xl hover:border-purple-400/60 transition-all duration-500">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-3xl shadow-lg transform hover:scale-110 transition-transform">
                🔐
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Admin Portal
              </h1>
              <p className="text-gray-300 text-sm">Access the CheckDem command center</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-400/50 backdrop-blur-sm animate-pulse">
                <div className="flex items-start gap-3">
                  <span className="text-xl">⚠️</span>
                  <div>
                    <p className="font-semibold text-red-200">Authentication Failed</p>
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username Field */}
              <div>
                <label className="block text-gray-200 font-semibold mb-2 text-sm">
                  👤 Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setFocusedInput("username")}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="Enter your username"
                  required
                  disabled={loading}
                  className={`w-full px-4 py-3 rounded-lg bg-white/10 border ${
                    focusedInput === "username" ? "border-purple-400" : "border-purple-300/30"
                  } text-white placeholder-gray-500 backdrop-blur-sm transition-all focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400 disabled:opacity-50 disabled:cursor-not-allowed`}
                />
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-gray-200 font-semibold mb-2 text-sm">
                  🔑 Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedInput("password")}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                  className={`w-full px-4 py-3 rounded-lg bg-white/10 border ${
                    focusedInput === "password" ? "border-purple-400" : "border-purple-300/30"
                  } text-white placeholder-gray-500 backdrop-blur-sm transition-all focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400 disabled:opacity-50 disabled:cursor-not-allowed`}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full group relative mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>✨ Sign In</>
                  )}
                </span>
              </button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-8 pt-6 border-t border-purple-400/30">
              <div className="text-center">
                <p className="text-gray-300 text-xs font-semibold mb-3">DEMO CREDENTIALS</p>
                <div className="inline-block bg-white/10 border border-purple-400/30 rounded-lg px-4 py-3 backdrop-blur-sm">
                  <p className="text-gray-200 text-sm font-mono">
                    <span className="text-purple-400">Username:</span> <strong>admin</strong>
                  </p>
                  <p className="text-gray-200 text-sm font-mono">
                    <span className="text-purple-400">Password:</span> <strong>admin123</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Link */}
            <div className="mt-6 text-center">
              <Link to="/" className="text-gray-400 hover:text-gray-200 text-sm font-medium transition-colors">
                ← Need help? Return to home
              </Link>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-8 flex justify-center items-center gap-6 text-gray-400 text-xs">
            <div className="flex items-center gap-1">
              <span>🔒</span>
              <span>SSL Encrypted</span>
            </div>
            <div className="w-px h-4 bg-gray-600" />
            <div className="flex items-center gap-1">
              <span>⚡</span>
              <span>Enterprise Grade</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
