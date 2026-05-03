import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiLock,
  FiArrowLeft,
  FiArrowRight,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    new_password: "",
    confirm_password: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.new_password !== formData.confirm_password) {
      toast.error("Passwords do not match");
      return;
    }
    if (formData.new_password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        "https://smart-question-maker-backend.onrender.com/api/auth/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            otp: formData.otp,
            new_password: formData.new_password,
          }),
        },
      );
      const data = await res.json();
      if (res.ok) {
        toast.success("Password reset successfully!");
        navigate("/login");
      } else {
        toast.error(data.message || "Failed to reset password");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030712] text-white relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative w-full max-w-md mx-4 p-1">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-2xl blur opacity-25"></div>

        <div className="relative bg-[#0F172A]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>

          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <FiLock className="text-white text-2xl" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Reset Password
            </h1>
            <p className="text-gray-400 text-sm">
              Enter your OTP and new password
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="group">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="name@example.com"
                className="w-full px-4 py-3 bg-[#0B1120]/50 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              />
            </div>

            <div className="group">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                OTP Code
              </label>
              <input
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                required
                maxLength={6}
                placeholder="6-digit OTP"
                className="w-full px-4 py-3 bg-[#0B1120]/50 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono tracking-widest text-center text-lg"
              />
            </div>

            <div className="group">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiLock className="text-gray-500" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 bg-[#0B1120]/50 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <div className="group">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiLock className="text-gray-500" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-[#0B1120]/50 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full relative group py-3.5 px-4 rounded-xl font-semibold text-white overflow-hidden transition-all disabled:opacity-70"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 group-hover:from-blue-500 group-hover:to-indigo-500 transition-all"></div>
              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>{" "}
                    Resetting...
                  </>
                ) : (
                  <>
                    <span>Reset Password</span>
                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              <FiArrowLeft size={14} /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
