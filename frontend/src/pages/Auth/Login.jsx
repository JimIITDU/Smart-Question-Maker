import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiArrowRight, FiCpu, FiShield, FiUser } from "react-icons/fi"; // Using Feather Icons for consistency
import { login } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

const Login = () => {
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await login(formData);
      loginUser(res.data.data.token, res.data.data.user);
      navigate("/dashboard"); // Layout will handle role-based redirection
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] flex flex-col lg:flex-row relative overflow-hidden font-sans">
      {/* --- Ambient Background Glows --- */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] -z-10 animate-pulse"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-pink-600/10 rounded-full blur-[120px] -z-10"></div>

      {/* --- LEFT SIDE: Illustration --- */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-900/20 to-transparent z-0"></div>
        
        <div className="relative z-10 w-full max-w-lg animate-fade-in-left">
          {/* Branding */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <span className="text-2xl font-bold text-white">P</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold tracking-tight text-white leading-none">
                Proshno<span className="text-purple-400">Ghor</span>
              </span>
              <span className="text-xs text-gray-400 uppercase tracking-widest font-medium mt-1">
                প্রশ্নঘর
              </span>
            </div>
          </div>

          <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight">
            AI-Powered <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Education Platform
            </span>
          </h1>
          <p className="text-gray-400 text-lg mb-12 max-w-sm leading-relaxed">
            Access the smartest way to create exams, manage students, and track progress with AI.
          </p>

          {/* --- CSS Illustration: The "AI Login Portal" --- */}
          <div className="relative w-full aspect-square max-w-[350px] mx-auto">
            {/* Main Glass Card */}
            <div className="absolute inset-0 bg-[#0F172A]/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl animate-float">
              <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                </div>
                <FiShield className="text-purple-400 opacity-80" />
              </div>

              {/* User Profile Placeholder */}
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 p-1 shadow-[0_0_40px_rgba(192,38,211,0.3)] mb-4 relative">
                  <div className="w-full h-full rounded-full bg-[#030712] flex items-center justify-center relative overflow-hidden">
                    <FiUser className="text-4xl text-gray-300" />
                    {/* Scanning Beam */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-white/50 shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-scan"></div>
                  </div>
                </div>
                <div className="w-24 h-2 bg-gray-700 rounded-full mb-2"></div>
                <div className="w-16 h-2 bg-gray-800 rounded-full"></div>
              </div>

              {/* Floating Stats Badges */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-3 rounded-lg border border-white/5 flex items-center gap-2">
                  <FiCpu className="text-purple-400 text-sm" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 uppercase">Status</span>
                    <span className="text-xs font-bold text-green-400">Online</span>
                  </div>
                </div>
                <div className="bg-white/5 p-3 rounded-lg border border-white/5 flex items-center gap-2">
                  <FiLock className="text-pink-400 text-sm" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 uppercase">Security</span>
                    <span className="text-xs font-bold text-white">AI Secure</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Floating Elements behind the card */}
            <div className="absolute -top-10 -right-10 bg-[#1e1b4b] border border-purple-500/30 p-3 rounded-xl animate-bounce-slow opacity-80">
              <FiCpu className="text-purple-400 text-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* --- RIGHT SIDE: Form --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative z-10">
        <div className="w-full max-w-md">
          
          {/* Mobile Branding (Visible only on mobile) */}
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
             <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <span className="font-bold text-lg">P</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white leading-none">
                Proshno<span className="text-purple-400">Ghor</span>
              </span>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-medium mt-0.5">
                প্রশ্নঘর
              </span>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-[#0F172A]/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl animate-fade-in-up">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-gray-400 text-sm">
                Enter your credentials to access your dashboard
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 animate-fade-in-down">
                <div className="mt-0.5 text-red-400">
                  <FiShield />
                </div>
                <div>
                  <p className="text-red-400 text-sm font-medium">Authentication Failed</p>
                  <p className="text-red-400/70 text-xs mt-1">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-purple-400 transition-colors">
                    <FiMail className="text-lg" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="user@gmail.com"
                    className="w-full bg-[#030712]/50 border border-white/10 text-white text-sm rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 placeholder-gray-600 transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-purple-400 hover:text-purple-300 transition-colors font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-purple-400 transition-colors">
                    <FiLock className="text-lg" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    className="w-full bg-[#030712]/50 border border-white/10 text-white text-sm rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 placeholder-gray-600 transition-all"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full relative group overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-purple-900/40 hover:shadow-purple-900/60 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  <span>Sign In to Dashboard</span>
                )}
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            {/* Footer */}
            <p className="text-center text-gray-500 text-sm mt-8">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-purple-400 font-semibold hover:text-purple-300 transition-colors"
              >
                Create free account
              </Link>
            </p>
          </div>

          <div className="mt-6 text-center">
            <p className="text-[10px] text-gray-600">
              &copy; 2026 ProshnoGhor. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-scan { animation: scan 2s linear infinite; }
        .animate-bounce-slow { animation: bounce-slow 4s ease-in-out infinite; }
        .animate-fade-in-left { animation: fadeInLeft 1s ease-out forwards; }
        .animate-fade-in-up { animation: fadeInUp 1s ease-out forwards; }
        .animate-fade-in-down { animation: fadeInDown 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default Login;