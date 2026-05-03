import React, { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FiMail, FiArrowLeft, FiArrowRight } from "react-icons/fi";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(
        "https://smart-question-maker-backend.onrender.com/api/auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );
      const data = await res.json();
      if (res.ok) {
        setSent(true);
        toast.success("Reset OTP sent to your email!");
      } else {
        toast.error(data.message || "Failed to send reset email");
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

          {!sent ? (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <FiMail className="text-white text-2xl" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  Forgot Password?
                </h1>
                <p className="text-gray-400 text-sm">
                  Enter your email and we'll send you a reset OTP
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="group">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 group-focus-within:text-blue-400 transition-colors">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiMail className="text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="name@example.com"
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
                        Sending...
                      </>
                    ) : (
                      <>
                        <span>Send Reset OTP</span>
                        <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 mx-auto mb-4 bg-emerald-500/20 rounded-2xl flex items-center justify-center">
                <svg
                  className="text-emerald-400 w-8 h-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">OTP Sent!</h2>
              <p className="text-gray-400 text-sm mb-6">
                Check your email for the reset OTP. Use it on the reset password
                page.
              </p>
              <Link
                to="/reset-password"
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Go to Reset Password <FiArrowRight />
              </Link>
            </div>
          )}

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

export default ForgotPassword;
