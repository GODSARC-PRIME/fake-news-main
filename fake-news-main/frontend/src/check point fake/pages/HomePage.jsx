import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function HomePage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const stats = [
    { value: "10M+", label: "Articles Analyzed", icon: "📊" },
    { value: "99.8%", label: "Accuracy Rate", icon: "🎯" },
    { value: "150+", label: "Countries Served", icon: "🌍" },
    { value: "24/7", label: "Real-time Monitoring", icon: "⚡" },
  ];

  const features = [
    {
      icon: "📝",
      title: "Text Analysis",
      desc: "Advanced NLP analysis detects misinformation patterns, sentiment bias, and propaganda techniques",
      delay: "0s",
    },
    {
      icon: "🔗",
      title: "URL Intelligence",
      desc: "Domain reputation scoring, source verification, and content authenticity checks",
      delay: "0.1s",
    },
    {
      icon: "🎬",
      title: "Media Processing",
      desc: "AI-powered transcription, deepfake detection, and multimedia analysis",
      delay: "0.2s",
    },
    {
      icon: "🧠",
      title: "ML-Powered Engine",
      desc: "Continuous learning from fact-checking databases and credibility indicators",
      delay: "0.3s",
    },
    {
      icon: "🔐",
      title: "Enterprise Security",
      desc: "Bank-level encryption, GDPR compliant, with zero-knowledge architecture",
      delay: "0.4s",
    },
    {
      icon: "📈",
      title: "Real-time Analytics",
      desc: "Dashboard insights, trend tracking, and detailed verification reports",
      delay: "0.5s",
    },
  ];

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
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled ? "backdrop-blur-xl bg-slate-900/80 shadow-2xl" : "backdrop-blur-sm bg-slate-900/40"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform">
                <span className="text-lg font-bold text-white">🔍</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent hover:from-purple-400 hover:to-pink-400 transition-all">
                CheckDem
              </span>
            </Link>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              <Link
                to="/validate"
                className="text-gray-300 hover:text-white font-medium transition-colors relative group"
              >
                Verify News
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 group-hover:w-full transition-all duration-300" />
              </Link>
              {isAuthenticated && isAdmin && (
                <Link
                  to="/admin"
                  className="text-gray-300 hover:text-white font-medium transition-colors relative group"
                >
                  Dashboard
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 group-hover:w-full transition-all duration-300" />
                </Link>
              )}
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <Link
                  to="/login"
                  className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-all transform hover:scale-105"
                >
                  Logout
                </Link>
              ) : (
                <>
                  <Link
                    to="/validate"
                    className="hidden sm:inline-block px-5 py-2 text-gray-300 hover:text-white font-medium transition-colors"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/login"
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all transform hover:scale-105"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative z-10">
          {/* Hero Badge */}
          <div className="fade-in-down mb-8 flex justify-center">
            <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-purple-400/50 backdrop-blur-sm">
              <p className="text-purple-200 text-sm font-semibold">✨ AI-Powered Fact Verification</p>
            </div>
          </div>

          {/* Main Headline */}
          <div className="fade-in-down mb-8">
            <h1 className="text-5xl md:text-7xl font-bold text-center mb-4" style={{
              background: "linear-gradient(90deg, #667eea 0%, #764ba2 25%, #ec4899 50%, #f59e0b 75%, #667eea 100%)",
              backgroundSize: "300% 100%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "gradient-shift 6s ease infinite"
            }}>
              Detect Misinformation in Real-Time
            </h1>
          </div>

          {/* Subheading */}
          <p className="fade-in-up text-xl text-gray-300 text-center max-w-2xl mx-auto mb-12 leading-relaxed">
            Enterprise-grade AI verification system for news articles, social media, text content,
            URLs, and multimedia files. Get instant credibility scores with advanced analytics.
          </p>

          {/* CTA Buttons */}
          <div className="fade-in-up flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
            <Link
              to="/validate"
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/50 transition-all transform hover:scale-105 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center gap-2">🚀 Start Verifying Now</span>
            </Link>
            {!isAuthenticated && (
              <Link
                to="/login"
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-lg backdrop-blur-sm border border-white/30 transition-all transform hover:scale-105"
              >
                🔐 Admin Access
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="fade-in-up group p-8 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-purple-400/30 hover:border-purple-400/80 backdrop-blur-sm transition-all transform hover:scale-105 hover:shadow-xl"
              style={{ animation: `fadeInUp 0.7s ease-out ${idx * 0.1}s both` }}
            >
              <div className="text-4xl mb-3 group-hover:scale-125 transition-transform">{stat.icon}</div>
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <p className="text-gray-400 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Powered by <span style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Advanced AI</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Cutting-edge machine learning algorithms trained on millions of verified sources
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="fade-in-up group relative overflow-hidden rounded-xl p-8 bg-gradient-to-br from-white/10 to-white/5 border border-purple-400/30 hover:border-purple-400/80 backdrop-blur-lg transition-all duration-500 transform hover:scale-105 hover:shadow-2xl cursor-pointer"
              style={{ animation: `fadeInUp 0.7s ease-out ${feature.delay} both` }}
              onMouseEnter={() => setHoveredCard(idx)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Gradient Overlay on Hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative z-10">
                <div className="text-5xl mb-4 group-hover:scale-125 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors">
                  {feature.desc}
                </p>
              </div>

              {/* Animated Border */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trust Indicators Section */}
      <div className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-purple-400/30 rounded-2xl p-12 backdrop-blur-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="fade-in-up">
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="text-xl font-bold text-white mb-2">Enterprise Security</h3>
              <p className="text-gray-400">Bank-level encryption & GDPR compliant</p>
            </div>
            <div className="fade-in-up" style={{ animationDelay: "0.1s" }}>
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="text-xl font-bold text-white mb-2">Lightning Fast</h3>
              <p className="text-gray-400">Results in under 2 seconds on average</p>
            </div>
            <div className="fade-in-up" style={{ animationDelay: "0.2s" }}>
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-xl font-bold text-white mb-2">Detailed Reports</h3>
              <p className="text-gray-400">Comprehensive analysis with evidence</p>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Ready to Combat Misinformation?
        </h2>
        <p className="text-xl text-gray-400 mb-8">Join thousands of organizations verifying content in real-time</p>
        <Link
          to="/validate"
          className="inline-block group relative px-10 py-5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/50 transition-all transform hover:scale-105"
        >
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
          <span className="relative">✨ Start Free Verification</span>
        </Link>
      </div>
    </div>
  );
}
