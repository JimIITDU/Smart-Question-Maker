import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiShield, FiMail, FiArrowRight, FiLock, FiCheckCircle } from "react-icons/fi"; // Using Feather Icons
import { verifyOTP } from "../../services/api";

const VerifyOTP = () => {
  const navigate = useNavigate();
  const email = localStorage.getItem("verify_email");

  useEffect(() => {
    // If no email in localStorage redirect to register
    if (!email) {
      navigate("/register");
    }
  }, [navigate]);

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await verifyOTP({ email, otp });
      const { token, user } = response.data.data;

      // Auto-login: store token and user data
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.removeItem("verify_email");

      setSuccess("Verification Successful! Welcome to ProshnoGhor.");

      // Redirect to dashboard immediately
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid code. Please try again.");
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
            Secure Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Account Access
            </span>
          </h1>
          <p className="text-gray-400 text-lg mb-12 max-w-sm leading-relaxed">
            We need to verify it's you. Please enter the 6-digit code sent to your email.
          </p>

          {/* --- CSS Illustration: Secure Shield --- */}
          <div className="relative w-full aspect-square max-w-[350px] mx-auto flex items-center justify-center">
            {/* Spinning Rings */}
            <div className="absolute inset-0 border-2 border-white/5 rounded-full animate-spin-slow"></div>
            <div className="absolute inset-8 border border-purple-500/20 rounded-full animate-spin-reverse-slow"></div>
            
            {/* Shield Card */}
            <div className="relative z-10 w-48 h-48 bg-[#0F172A]/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl flex flex-col items-center justify-center animate-float">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center shadow-[0_0_40px_rgba(192,38,211,0.4)] mb-4 relative overflow-hidden">
                <FiLock className="text-4xl text-white relative z-10" />
                {/* Shine effect */}
                <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-white/30 skew-x-[20deg] animate-shine"></div>
              </div>
              <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">Encrypted</p>
            </div>

            {/* Floating Badge */}
            <div className="absolute -bottom-10 right-0 bg-[#1e1b4b] border border-purple-500/30 p-3 rounded-xl flex items-center gap-3 animate-bounce-slow">
              <FiShield className="text-purple-400 text-xl" />
              <div>
                <p className="text-[10px] text-gray-500 uppercase">Status</p>
                <p className="text-sm font-bold text-white">Secure</p>
              </div>
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
            
            {!success ? (
              <>
                <div className="mb-8 text-center">
                  <h2 className="text-2xl font-bold text-white mb-2">Verify Your Email</h2>
                  <p className="text-gray-400 text-sm">
                    Enter the 6-digit code sent to:
                  </p>
                  <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                    <FiMail className="text-purple-400 text-xs" />
                    <span className="text-sm font-medium text-purple-300 truncate max-w-[200px]">
                      {email}
                    </span>
                  </div>
                </div>

                {/* Error Alert */}
                {error && (
                  <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 animate-fade-in-down">
                    <div className="mt-0.5 text-red-400">
                      <FiShield />
                    </div>
                    <div>
                      <p className="text-red-400 text-sm font-medium">Verification Failed</p>
                      <p className="text-red-400/70 text-xs mt-1">{error}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* OTP Input */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1 text-center">
                      Authentication Code
                    </label>
                    <div className="relative group">
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, "");
                          setOtp(value);
                        }}
                        required
                        placeholder="• • • • • • •"
                        maxLength={6}
                        inputMode="numeric"
                        className="w-full bg-[#030712]/50 border border-white/10 text-white text-4xl tracking-[0.5em] text-center font-mono rounded-xl py-4 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 placeholder-gray-600 transition-all"
                      />
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-600">
                        <FiLock className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Verify Button */}
                  <button
                    type="submit"
                    disabled={loading || otp.length < 6}
                    className="w-full relative group overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-purple-900/40 hover:shadow-purple-900/60 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Verifying...
                      </span>
                    ) : (
                      <span className="relative z-10">Verify Account</span>
                    )}
                    <FiArrowRight className="group-hover:translate-x-1 transition-transform relative z-10" />
                    {/* Button Glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  </button>
                </form>

                <p className="text-center text-gray-500 text-sm mt-6">
                  Wrong email?{" "}
                  <Link
                    to="/register"
                    className="text-purple-400 font-semibold hover:text-purple-300 transition-colors"
                  >
                    Change email
                  </Link>
                </p>
              </>
            ) : (
              // Success State
              <div className="flex flex-col items-center justify-center py-12 animate-fade-in-up">
                <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-6 relative">
                   <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping"></div>
                  <FiCheckCircle className="text-5xl text-green-400 relative z-10" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Verified Successfully</h2>
                <p className="text-gray-400 text-sm text-center mb-8">
                  {success}
                </p>
                <div className="flex items-center text-purple-400 text-sm gap-2 animate-pulse">
                  <span>Redirecting you to dashboard</span>
                  <FiArrowRight />
                </div>
              </div>
            )}
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
        @keyframes shine {
          0% { left: -100%; }
          20% { left: 200%; }
          100% { left: 200%; }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse-slow {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
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
        .animate-shine { animation: shine 3s infinite linear; }
        .animate-bounce-slow { animation: bounce-slow 4s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 10s linear infinite; }
        .animate-spin-reverse-slow { animation: spin-reverse-slow 15s linear infinite; }
        .animate-fade-in-left { animation: fadeInLeft 1s ease-out forwards; }
        .animate-fade-in-up { animation: fadeInUp 1s ease-out forwards; }
        .animate-fade-in-down { animation: fadeInDown 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default VerifyOTP;