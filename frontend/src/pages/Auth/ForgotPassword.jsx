import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
// FIXED: Added FiArrowLeft to the imports below
import { FiArrowLeft, FiMail, FiLock, FiArrowRight, FiShield, FiCheckCircle, FiEye, FiEyeOff, FiRefreshCw, FiX, FiAlertTriangle } from "react-icons/fi";
import { forgotPassword, resetPassword } from "../../services/api";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  
  // Form Data
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState(""); // Internal state
  
  // Toast State (For Popups)
  const [toast, setToast] = useState({ visible: false, type: 'success', message: '' });

  // Resend Timer State
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // --- Timer Effect ---
  useEffect(() => {
    let interval;
    if (step === 2 && resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  // --- Toast Helper ---
  const showToast = (type, message) => {
    setToast({ visible: true, type, message });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  // --- Handlers ---

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const response = await forgotPassword({ email });
      
      if (response.data.success) {
        showToast('success', 'OTP sent successfully!');
        setStep(2);
        // Reset Timer
        setResendTimer(30);
        setCanResend(false);
      } else {
        showToast('error', response.data.message || "Failed to send OTP");
      }
    } catch (error) {
      // RED POPUP
      const errMsg = error.response?.data?.message || "Email not registered or server error.";
      showToast('error', errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    setLoading(true);
    try {
      const response = await forgotPassword({ email }); 
      if (response.data.success) {
        showToast('success', 'New OTP sent!');
        setResendTimer(30);
        setCanResend(false);
        setOtp("");
      } else {
        showToast('error', 'Failed to resend OTP');
      }
    } catch (error) {
      showToast('error', 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    
    // --- DEBUGGING LOGS ---
    console.log("--- SUBMITTING RESET REQUEST ---");
    console.log("Email:", email);
    console.log("OTP (Raw String):", otp);
    console.log("OTP Length:", otp.length);
    console.log("New Password:", newPassword);
    // -----------------------

    if (otp.length !== 6) return showToast('error', 'Please enter a valid 6-digit OTP');
    if (newPassword !== confirmPassword) return showToast('error', 'Passwords do not match');
    if (newPassword.length < 6) return showToast('error', 'Password must be at least 6 characters');
    
    setLoading(true);
    try {
      // Sending data
      const payload = { email, otp, new_password: newPassword };
      console.log("Sending Payload to API:", payload); 

      const response = await resetPassword(payload);
      console.log("API Response:", response.data);

      if (response.data.success) {
        showToast('success', 'Password reset successfully!');
        setTimeout(() => navigate("/login"), 1500);
      } else {
        showToast('error', response.data.message || "Reset failed");
      }
    } catch (error) {
      console.error("API Error:", error);
      showToast('error', error.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  // Helper for password validation styling
  const isPasswordMatch = confirmPassword.length > 0 && newPassword === confirmPassword;
  const isPasswordMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  // Helper to go back to Step 1
  const goBackToEmail = () => {
    setStep(1);
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-[#030712] flex flex-col lg:flex-row relative overflow-hidden font-sans">
      
      {/* --- Ambient Background Glows (Exact Match to Login) --- */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] -z-10 animate-pulse"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-pink-600/10 rounded-full blur-[120px] -z-10"></div>

      {/* --- TOAST NOTIFICATION SYSTEM --- */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toast.visible && (
          <div 
            className={`pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl backdrop-blur-xl border transform transition-all duration-500 ${
              toast.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-white animate-slideInRight' 
                : 'bg-red-500/10 border-red-500/20 text-white animate-slideInRight'
            }`}
          >
            <div className={`p-1.5 rounded-full ${toast.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
              {toast.type === 'success' ? <FiCheckCircle className="w-4 h-4" /> : <FiAlertTriangle className="w-4 h-4" />}
            </div>
            <div>
              <h4 className="font-bold text-sm">{toast.type === 'success' ? 'Success' : 'Error'}</h4>
              <p className="text-xs opacity-90">{toast.message}</p>
            </div>
            <button onClick={() => setToast(prev => ({...prev, visible: false}))} className="ml-2 hover:bg-white/10 rounded-full p-1 transition-colors">
              <FiX className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

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
            Secure <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Account Recovery
            </span>
          </h1>
          <p className="text-gray-400 text-lg mb-12 max-w-sm leading-relaxed">
            Follow steps to securely reset your password and regain access to your dashboard.
          </p>

          {/* --- CSS Illustration: The "AI Security Portal" --- */}
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

              {/* Shield Icon Container */}
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 p-1 shadow-[0_0_40px_rgba(192,38,211,0.3)] mb-4 relative overflow-hidden">
                  <div className="w-full h-full rounded-full bg-[#030712] flex items-center justify-center relative">
                    <FiLock className="text-5xl text-gray-300" />
                    {/* Scanning Beam (Matching Login style) */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-white/50 shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-scan"></div>
                  </div>
                </div>
                <div className="w-32 h-2 bg-gray-700 rounded-full mb-2"></div>
                <div className="w-20 h-2 bg-gray-800 rounded-full"></div>
              </div>

              {/* Security Badges */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-3 rounded-lg border border-white/5 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-xs">
                    <FiCheckCircle className="w-3 h-3" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 uppercase">Status</span>
                    <span className="text-xs font-bold text-green-400">Verified</span>
                  </div>
                </div>
                <div className="bg-white/5 p-3 rounded-lg border border-white/5 flex items-center gap-2">
                  <FiLock className="text-pink-400 text-sm" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 uppercase">Protocol</span>
                    <span className="text-xs font-bold text-white">AES-256</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Floating Element */}
            <div className="absolute -bottom-10 -right-10 bg-[#1e1b4b] border border-purple-500/30 p-3 rounded-xl animate-bounce-slow opacity-80">
              <FiShield className="text-purple-400 text-2xl" />
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

          {/* Form Card (Exact Match to Login Style) */}
          <div className="bg-[#0F172A]/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl animate-fade-in-up">
            
            {/* --- CENTERED PROGRESS STEPS --- */}
            <div className="mb-10 pt-2 pb-6 w-full">
              <div className="flex items-center justify-center relative w-full max-w-[200px] mx-auto">
                {/* Connecting Line Background */}
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -translate-y-1/2 z-0"></div>
                
                {/* Active Progress Line */}
                <div 
                  className={`absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 -translate-y-1/2 z-0 transition-all duration-500 ${
                    step === 1 ? 'w-0' : 'w-full'
                  }`}
                ></div>
                
                {/* Step 1 Circle */}
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-500 bg-[#030712] shadow-lg ${
                    step > 1 
                      ? 'border-green-500 text-green-500 ring-4 ring-green-500/10' 
                      : step === 1 
                        ? 'border-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]' 
                        : 'border-white/10 text-gray-600'
                  }`}>
                    {step > 1 ? <FiCheckCircle className="w-5 h-5" /> : '1'}
                  </div>
                  <span className={`text-[10px] font-medium uppercase tracking-wider transition-colors ${
                    step >= 1 ? 'text-white' : 'text-gray-600'
                  }`}>Identity</span>
                </div>

                {/* Spacer */}
                <div className="w-16"></div>

                {/* Step 2 Circle */}
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-500 bg-[#030712] shadow-lg ${
                    step > 2 
                      ? 'border-green-500 text-green-500 ring-4 ring-green-500/10' 
                      : step === 2 
                        ? 'border-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]' 
                        : 'border-white/10 text-gray-600'
                  }`}>
                    {step > 2 ? <FiCheckCircle className="w-5 h-5" /> : '2'}
                  </div>
                  <span className={`text-[10px] font-medium uppercase tracking-wider transition-colors ${
                    step >= 2 ? 'text-white' : 'text-gray-600'
                  }`}>Security</span>
                </div>
              </div>
            </div>

            {/* --- FORM CONTENT --- */}
            <div className="p-2">
              
              {/* STEP 1: EMAIL */}
              {step === 1 && (
                <>
                  <h2 className="text-2xl font-bold text-white mb-2 text-center">Find your account</h2>
                  <p className="text-gray-400 text-sm text-center mb-8">Enter email associated with your account.</p>
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
                      className="w-full relative group overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-purple-900/40 hover:shadow-purple-900/60 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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

              {/* STEP 2: OTP & PASSWORD */}
              {step === 2 && (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white">Verify & Reset</h2>
                      <p className="text-gray-500 text-xs mt-1 font-medium">{email}</p>
                    </div>
                    
                    {/* ENLARGED WRONG EMAIL BUTTON */}
                    <button 
                      onClick={goBackToEmail}
                      className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide text-gray-400 bg-[#030712]/50 border border-white/10 hover:border-purple-500/50 hover:text-white hover:bg-purple-500/10 transition-all duration-300 flex items-center gap-2 shadow-sm"
                    >
                      <FiArrowLeft size={14} /> Wrong Email?
                    </button>
                  </div>

                  {message && <div className={`p-3 rounded-lg text-xs font-medium mb-4 text-center ${message.includes("sent") ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                    {message}
                  </div>}

                  <form onSubmit={handleResetSubmit} className="space-y-4">
                    {/* OTP Input */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                         <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">
                            One-Time Password
                         </label>
                         {/* Resend Button */}
                         <button 
                           type="button"
                           onClick={handleResendOtp}
                           disabled={!canResend}
                           className={`text-xs font-bold flex items-center gap-1.5 px-2 py-1 rounded transition-all ${canResend ? 'text-purple-400 hover:bg-purple-500/10' : 'text-gray-600 cursor-not-allowed'}`}
                         >
                           <FiRefreshCw size={12} className={!canResend ? '' : 'animate-spin'} />
                           {canResend ? 'Resend Code' : `Wait ${resendTimer}s`}
                         </button>
                      </div>
                      <div className="relative group">
                        <input
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                          required
                          placeholder="• • • • •"
                          maxLength={6}
                          inputMode="numeric"
                          className="w-full bg-[#030712]/50 border border-white/10 text-white text-3xl tracking-[0.5em] text-center font-mono rounded-xl py-4 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 placeholder-gray-600 transition-all"
                        />
                      </div>
                    </div>

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
                      {isPasswordMismatch && <p className="text-[10px] text-red-400 ml-1 animate-fade-in-down">Passwords do not match</p>}
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full relative group overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-purple-900/40 hover:shadow-purple-900/60 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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

            {/* Back Link (Only in Step 1) */}
            {step === 1 && (
               <div className="mt-6 text-center border-t border-white/5 pt-4">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-purple-400 transition-colors font-medium"
                >
                  <FiArrowLeft size={14} /> Back to Login
                </Link>
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

      {/* Custom Animations (Matching Login) */}
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
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-scan { animation: scan 2s linear infinite; }
        .animate-bounce-slow { animation: bounce-slow 4s ease-in-out infinite; }
        .animate-fade-in-left { animation: fadeInLeft 1s ease-out forwards; }
        .animate-fade-in-up { animation: fadeInUp 1s ease-out forwards; }
        .animate-fade-in-down { animation: fadeInDown 0.5s ease-out forwards; }
        .animate-slideInRight { animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
};

export default ForgotPassword;