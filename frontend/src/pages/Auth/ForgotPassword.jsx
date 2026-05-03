import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiArrowLeft, FiArrowRight, FiShield, FiCheckCircle, FiLock, FiEye, FiEyeOff, FiAlertCircle } from "react-icons/fi";
import { forgotPassword, resetPassword } from "../../services/api";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: reset
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const response = await forgotPassword({ email });
      if (response.data.success) {
        setMessage("OTP sent to your email!");
        setStep(2);
      } else {
        setMessage(response.data.message || "Failed to send OTP");
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (otp.length !== 6) return setMessage("Please enter a valid 6-digit OTP");
    setStep(3);
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    
    // Frontend validation
    if (newPassword !== confirmPassword) return setMessage("Passwords do not match");
    if (newPassword.length < 6) return setMessage("Password must be at least 6 characters");
    
    setLoading(true);
    try {
      const response = await resetPassword({ email, otp, new_password: newPassword });
      if (response.data.success) {
        setMessage("Password reset successfully!");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setMessage(response.data.message || "Reset failed");
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  // Helper for password validation styling
  const isPasswordMatch = confirmPassword.length > 0 && newPassword === confirmPassword;
  const isPasswordMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  return (
    <div className="min-h-screen bg-[#030712] flex flex-col lg:flex-row relative overflow-hidden font-sans">
      {/* --- Ambient Background Glows --- */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] -z-10 animate-pulse"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-pink-600/10 rounded-full blur-[120px] -z-10"></div>

      {/* --- LEFT SIDE: Illustration --- */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-900/20 to-transparent z-0"></div>
        
        <div className="relative z-10 w-full max-w-lg animate-fade-in-left flex flex-col items-center">
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

          <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight text-center">
            Secure <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Account Recovery
            </span>
          </h1>
          <p className="text-gray-400 text-lg mb-12 max-w-sm leading-relaxed text-center">
            Follow the steps to securely reset your password and regain access to your dashboard.
          </p>

          {/* --- CSS Illustration: Secure Shield --- */}
          <div className="relative w-full aspect-square max-w-[350px] flex items-center justify-center">
             {/* Rotating Rings */}
             <div className="absolute inset-0 border-2 border-white/5 rounded-full animate-spin-slow"></div>
             <div className="absolute inset-8 border border-purple-500/20 rounded-full animate-spin-reverse-slow"></div>

             {/* Shield Card */}
            <div className="relative z-10 w-48 h-48 bg-[#0F172A]/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl flex flex-col items-center justify-center animate-float">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center shadow-[0_0_40px_rgba(192,38,211,0.4)] mb-4 relative overflow-hidden">
                 <FiLock className="text-4xl text-white relative z-10" />
                 {/* Shine effect */}
                 <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-white/30 skew-x-[20deg] animate-shine"></div>
              </div>
              <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">AES-256 Encrypted</p>
            </div>

            {/* Floating Badge */}
            <div className="absolute -bottom-8 right-0 bg-[#1e1b4b] border border-purple-500/30 p-3 rounded-xl flex items-center gap-3 animate-bounce-slow">
               <FiShield className="text-purple-400 text-xl" />
               <div>
                 <p className="text-[10px] text-gray-500 uppercase">Status</p>
                 <p className="text-sm font-bold text-white">Protected</p>
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
          <div className="bg-[#0F172A]/60 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl animate-fade-in-up w-full flex flex-col">
            
            {/* --- PROGRESS STEPS (Moved to Right Side) --- */}
            <div className="mb-8 pt-6 pb-6 border-b border-white/5 w-full">
              <div className="flex items-center justify-between relative w-full">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -translate-y-1/2 z-0"></div>
                
                {[1, 2, 3].map((s) => (
                  <div key={s} className="relative z-10 flex flex-col items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-500 ${
                      step > s 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : step === s 
                          ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)]' 
                          : 'bg-[#0F172A] border-gray-700 text-gray-500'
                    }`}>
                      {step > s ? <FiCheckCircle className="w-4 h-4" /> : s}
                    </div>
                    <span className={`text-[10px] font-medium uppercase tracking-wider transition-colors ${
                      step >= s ? 'text-white' : 'text-gray-600'
                    }`}>
                      {s === 1 ? 'Email' : s === 2 ? 'OTP' : 'Reset'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* --- FORM CONTENT --- */}
            <div className="p-8 pt-2">
              {/* STEP 1: EMAIL */}
              {step === 1 && (
                <>
                  <h2 className="text-xl font-bold text-white mb-6 text-center">Enter Email Address</h2>
                  <form onSubmit={handleEmailSubmit} className="space-y-6">
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
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          placeholder="name@proshnoghor.com"
                          className="w-full bg-[#030712]/50 border border-white/10 text-white text-sm rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 placeholder-gray-600 transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full relative group overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-purple-900/40 hover:shadow-purple-900/60 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </span>
                      ) : (
                        <span className="relative z-10">Send OTP</span>
                      )}
                      <FiArrowRight className="group-hover:translate-x-1 transition-transform relative z-10" />
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                    </button>
                  </form>
                </>
              )}

              {/* STEP 2: OTP */}
              {step === 2 && (
                <>
                  <h2 className="text-xl font-bold text-white mb-2 text-center">Verify Identity</h2>
                  <p className="text-gray-400 text-sm text-center mb-6">{email}</p>
                  {message && <p className="text-green-400 text-sm text-center mb-6">{message}</p>}
                  <form onSubmit={handleOtpSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1 text-center">
                        Enter One-Time Password
                      </label>
                      <div className="relative group">
                        <input
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                          required
                          placeholder="• • • • • • •"
                          maxLength={6}
                          inputMode="numeric"
                          className="w-full bg-[#030712]/50 border border-white/10 text-white text-4xl tracking-[0.5em] text-center font-mono rounded-xl py-4 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 placeholder-gray-600 transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full relative group overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-purple-900/40 hover:shadow-purple-900/60 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                    >
                      <span className="relative z-10">Verify Code</span>
                      <FiArrowRight className="group-hover:translate-x-1 transition-transform relative z-10" />
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                    </button>
                  </form>
                </>
              )}

              {/* STEP 3: RESET PASSWORD */}
              {step === 3 && (
                <>
                  <h2 className="text-xl font-bold text-white mb-6 text-center">Create New Password</h2>
                  <form onSubmit={handleResetSubmit} className="space-y-4">
                    {/* New Password */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">
                        New Password
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-purple-400 transition-colors">
                          <FiLock className="text-lg" />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          placeholder="Enter new password"
                          className="w-full bg-[#030712]/50 border border-white/10 text-white text-sm rounded-xl pl-11 pr-12 py-3.5 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 placeholder-gray-600 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-white transition-colors"
                        >
                          {showPassword ? <FiEyeOff /> : <FiEye />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">
                        Confirm Password
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300">
                          <FiLock className={`text-lg ${isPasswordMatch ? 'text-green-500' : isPasswordMismatch ? 'text-red-500' : 'text-gray-500'}`} />
                        </div>
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          placeholder="Confirm new password"
                          className={`w-full bg-[#030712]/50 text-white text-sm rounded-xl pl-11 pr-12 py-3.5 focus:outline-none focus:ring-2 placeholder-gray-600 transition-all duration-300 ${
                            isPasswordMismatch 
                              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                              : isPasswordMatch 
                                ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20' 
                                : 'border-white/10 focus:border-purple-500 focus:ring-purple-500/20'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-white transition-colors"
                        >
                          {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                        </button>
                      </div>
                      {isPasswordMismatch && (
                        <p className="text-[10px] text-red-400 ml-1 animate-fade-in-down">Passwords do not match</p>
                      )}
                    </div>

                    {/* Error Message */}
                    {message && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                           <FiAlertCircle className="text-red-400 text-sm" />
                           <p className="text-red-400 text-xs">{message}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full relative group overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-purple-900/40 hover:shadow-purple-900/60 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Resetting...
                        </span>
                      ) : (
                        <span className="relative z-10">Reset Password</span>
                      )}
                      <FiArrowRight className="group-hover:translate-x-1 transition-transform relative z-10" />
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                    </button>
                  </form>
                </>
              )}
            </div>

            {/* Back Link */}
            <div className="mt-6 text-center border-t border-white/5 pt-4">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-purple-400 transition-colors"
              >
                <FiArrowLeft size={14} /> Back to Login
              </Link>
            </div>
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

export default ForgotPassword;