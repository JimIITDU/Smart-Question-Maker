import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiPhone, FiLock, FiArrowRight, FiCheck, FiAlertCircle, FiChevronDown } from "react-icons/fi";
import { register, resendVerificationOTP } from "../../services/api";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "", // New field
    phone: "",
    role_id: 2, // Default: Coaching Admin
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing again
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // 1. Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role_id: formData.role_id,
      });
      
      localStorage.setItem("verify_email", formData.email);
      
      alert("Registration successful! Please check your email for the OTP code.");
      
      navigate("/verify-otp");
    } catch (err) {
      const errMsg = err.response?.data?.message || "Registration failed. Please try again.";
      setError(errMsg);
      // If already verified, user will see specific message
    } finally {
      setLoading(false);
    }
  };

  // Helper for password validation styling
  const isPasswordMatch = formData.confirmPassword.length > 0 && formData.password === formData.confirmPassword;
  const isPasswordMismatch = formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword;

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
            Join the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Education Revolution
            </span>
          </h1>
          <p className="text-gray-400 text-lg mb-12 max-w-sm leading-relaxed">
            Create your account to start using AI-powered question tools for your coaching center.
          </p>

          {/* --- CSS Illustration: Profile Creation --- */}
          <div className="relative w-full aspect-square max-w-[350px] mx-auto">
            {/* Main Card */}
            <div className="absolute inset-0 bg-[#0F172A]/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl animate-float">
              <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                </div>
                <FiUser className="text-purple-400 opacity-80" />
              </div>

              {/* Form Placeholder */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <FiUser className="text-purple-400 text-sm" />
                  </div>
                  <div className="h-2 w-full bg-gray-700 rounded-full animate-pulse"></div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5">
                  <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center">
                    <FiLock className="text-pink-400 text-sm" />
                  </div>
                  <div className="h-2 w-3/4 bg-gray-700 rounded-full animate-pulse"></div>
                </div>
              </div>

              {/* Success Badge on Illustration */}
              <div className="mt-6 flex items-center justify-center gap-2 text-green-400 text-sm font-medium">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                Account Ready
              </div>
            </div>

            {/* Decorative floating elements */}
            <div className="absolute -top-6 -right-6 bg-[#1e1b4b] border border-purple-500/30 p-3 rounded-xl animate-bounce-slow opacity-80">
              <FiCheck className="text-purple-400 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* --- RIGHT SIDE: Form --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative z-10">
        <div className="w-full max-w-md">
          
          {/* Mobile Branding */}
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
              <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
              <p className="text-gray-400 text-sm">
                Fill in the details to get started
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 animate-fade-in-down">
                <div className="mt-0.5 text-red-400">
                  <FiAlertCircle />
                </div>
                <div>
                  <p className="text-red-400 text-sm font-medium">Registration Error</p>
                  <p className="text-red-400/70 text-xs mt-1">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">
                  Full Name
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-purple-400 transition-colors">
                    <FiUser className="text-lg" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                    className="w-full bg-[#030712]/50 border border-white/10 text-white text-sm rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 placeholder-gray-600 transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
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
                    placeholder="name@proshnoghor.com"
                    className="w-full bg-[#030712]/50 border border-white/10 text-white text-sm rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 placeholder-gray-600 transition-all"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">
                  Phone Number
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-purple-400 transition-colors">
                    <FiPhone className="text-lg" />
                  </div>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="+880 1XXX-XXXXXX"
                    className="w-full bg-[#030712]/50 border border-white/10 text-white text-sm rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 placeholder-gray-600 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">
                  Password
                </label>
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
                    placeholder="•••••••"
                    className="w-full bg-[#030712]/50 border border-white/10 text-white text-sm rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 placeholder-gray-600 transition-all"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">
                  Confirm Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300">
                    <FiLock className={`text-lg ${isPasswordMatch ? 'text-green-500' : isPasswordMismatch ? 'text-red-500' : 'text-gray-500'}`} />
                  </div>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="•••••••"
                    className={`w-full bg-[#030712]/50 text-white text-sm rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 placeholder-gray-600 transition-all duration-300 ${
                      isPasswordMismatch 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                        : isPasswordMatch 
                          ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20' 
                          : 'border-white/10 focus:border-purple-500 focus:ring-purple-500/20'
                    }`}
                  />
                </div>
                {isPasswordMismatch && (
                  <p className="text-[10px] text-red-400 ml-1 mt-1 animate-fade-in">Passwords do not match</p>
                )}
              </div>

              {/* Role Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">
                  Role
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-purple-400 transition-colors">
                    <FiUser className="text-lg" />
                  </div>
                  <select
                    name="role_id"
                    value={formData.role_id}
                    onChange={handleChange}
                    className="w-full bg-[#030712]/50 border border-white/10 text-white text-sm rounded-xl pl-11 pr-10 py-3.5 appearance-none focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 cursor-pointer transition-all"
                  >
                    <option value={2} className="bg-[#030712]">Coaching Admin</option>
                    <option value={3} className="bg-[#030712]">Teacher</option>
                    <option value={5} className="bg-[#030712]">Student</option>
                    <option value={6} className="bg-[#030712]">Parent</option>
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-500">
                    <FiChevronDown className="text-sm" />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full relative group overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-purple-900/40 hover:shadow-purple-900/60 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </span>
                ) : (
                  <span className="relative z-10">Create Account</span>
                )}
                <FiArrowRight className="group-hover:translate-x-1 transition-transform relative z-10" />
                {/* Button Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </button>
            </form>

            {/* Footer */}
            <p className="text-center text-gray-500 text-sm mt-8">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-purple-400 font-semibold hover:text-purple-300 transition-colors"
              >
                Sign in here
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
        .animate-bounce-slow { animation: bounce-slow 4s ease-in-out infinite; }
        .animate-fade-in-left { animation: fadeInLeft 1s ease-out forwards; }
        .animate-fade-in-up { animation: fadeInUp 1s ease-out forwards; }
        .animate-fade-in-down { animation: fadeInDown 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default Register;