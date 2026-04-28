import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../../services/api'

// --- Icons ---
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
)

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
)

const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
)

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
)

const ChevronDown = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
)

const Register = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role_id: 2,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await register(formData)
      localStorage.setItem('verify_email', formData.email)
      // Keeping your logic intact - alerting the OTP for testing
      alert(`Your OTP is: ${res.data.data.otp}`) 
      navigate('/verify-otp')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
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
        
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-[0_0_30px_-5px_rgba(99,102,241,0.4)]">
            <span className="text-3xl font-bold text-white">SQ</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
            Create Account
          </h1>
          <p className="text-gray-400 text-sm">
            Join the Smart Question Maker community
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3 animate-in slide-in-from-top-4 duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Name Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-1">
              Full Name
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-indigo-400 transition-colors">
                <UserIcon />
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="John Doe"
                className="w-full bg-[#151621] border border-white/10 text-white text-sm rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 placeholder-gray-600 transition-all"
              />
            </div>
          </div>

          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-1">
              Email Address
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-indigo-400 transition-colors">
                <MailIcon />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="name@example.com"
                className="w-full bg-[#151621] border border-white/10 text-white text-sm rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 placeholder-gray-600 transition-all"
              />
            </div>
          </div>

          {/* Phone Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-1">
              Phone Number
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-indigo-400 transition-colors">
                <PhoneIcon />
              </div>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="+1 234 567 890"
                className="w-full bg-[#151621] border border-white/10 text-white text-sm rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 placeholder-gray-600 transition-all"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-1">
              Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-indigo-400 transition-colors">
                <LockIcon />
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full bg-[#151621] border border-white/10 text-white text-sm rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 placeholder-gray-600 transition-all"
              />
            </div>
          </div>

          {/* Role Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-1">
              Role
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-indigo-400 transition-colors">
                <UserIcon />
              </div>
              <select
                name="role_id"
                value={formData.role_id}
                onChange={handleChange}
                className="w-full bg-[#151621] border border-white/10 text-white text-sm rounded-xl pl-11 pr-10 py-3.5 appearance-none focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 cursor-pointer transition-all"
              >
                <option value={2} className="bg-[#151621]">Coaching Admin</option>
                <option value={3} className="bg-[#151621]">Teacher</option>
                <option value={5} className="bg-[#151621]">Student</option>
                <option value={6} className="bg-[#151621]">Parent</option>
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-500">
                <ChevronDown />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full relative group overflow-hidden bg-gradient-to-r from-indigo-600 to-cyan-600 text-white py-4 rounded-xl font-semibold shadow-lg shadow-indigo-900/40 hover:shadow-indigo-900/60 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </div>
            ) : (
              <span className="relative z-10">Create Account</span>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-cyan-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-white font-medium hover:text-indigo-400 transition-colors"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register