import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { verifyOTP } from '../services/api'

// --- Icons ---
const ShieldCheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
)

const VerifyOTP = () => {
  const navigate = useNavigate()
  const email = localStorage.getItem('verify_email')
  
  useEffect(() => {
    // If no email in localStorage redirect to register
    if (!email) {
      navigate('/register')
    }
  }, [navigate])

  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await verifyOTP({ email, otp })
      setSuccess('Email verified successfully!')
      localStorage.removeItem('verify_email')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0C15] flex items-center justify-center relative overflow-hidden p-4">
      
      {/* --- Ambient Background Effects --- */}
      <div className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* --- Glass Card --- */}
      <div className="relative z-10 w-full max-w-md p-8 bg-[#0B0C15]/60 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-500">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-[0_0_30px_-5px_rgba(99,102,241,0.4)] text-white">
            <ShieldCheckIcon />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
            Verify Your Email
          </h1>
          <p className="text-gray-400 text-sm mb-4">
            We sent a 6-digit code to
          </p>
          {/* Email Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
            <span className="text-indigo-400 text-sm font-medium truncate max-w-[200px]">
              {email}
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3 animate-in slide-in-from-top-4 duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" x2="9" y1="9" y2="15"/><line x1="9" x2="15" y1="9" y2="15"/></svg>
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex flex-col items-center justify-center gap-2 animate-in zoom-in-95 duration-300">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <p className="text-green-400 text-sm font-medium text-center">{success}</p>
            <p className="text-gray-500 text-xs">Redirecting to login...</p>
          </div>
        )}

        {/* Form */}
        {!success && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 text-center">
                One-Time Password
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => {
                  // Allow only numbers
                  const value = e.target.value.replace(/[^0-9]/g, '')
                  setOtp(value)
                }}
                required
                placeholder="000000"
                maxLength={6}
                inputMode="numeric" // Optimizes mobile keyboard
                className="w-full bg-[#151621] border border-white/10 text-white text-3xl tracking-[0.5em] text-center font-mono rounded-xl py-4 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 placeholder-gray-700 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full relative group overflow-hidden bg-gradient-to-r from-indigo-600 to-cyan-600 text-white py-4 rounded-xl font-semibold shadow-lg shadow-indigo-900/40 hover:shadow-indigo-900/60 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </div>
              ) : (
                <span className="relative z-10">Verify OTP</span>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-cyan-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </button>
          </form>
        )}

        {/* Footer */}
        {!success && (
          <p className="text-center text-gray-500 text-sm mt-8">
            Wrong email?{' '}
            <Link
              to="/register"
              className="text-white font-medium hover:text-indigo-400 transition-colors"
            >
              Change it here
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}

export default VerifyOTP