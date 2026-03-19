import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { verifyOTP } from '../services/api'

const VerifyOTP = () => {
  const navigate = useNavigate()
  const email = localStorage.getItem('verify_email')
  useEffect(() => {
  // If no email in localStorage redirect to register
  if (!email) {
    navigate('/register')
  }
}, [])

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="bg-indigo-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold">SQ</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Verify Your Email
          </h1>
          <p className="text-gray-500 mt-1">
            Enter the OTP sent to
          </p>
          <p className="text-indigo-600 font-semibold">
            {email}
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Success message */}
        {success && (
          <div className="bg-green-50 text-green-600 px-4 py-3 rounded-lg mb-6 text-sm">
            {success} Redirecting to login...
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enter OTP
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              placeholder="Enter 6 digit OTP"
              maxLength={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-center text-2xl tracking-widest"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition duration-200 disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Wrong email?{' '}
          <Link
            to="/register"
            className="text-indigo-600 font-semibold hover:underline"
          >
            Go back to register
          </Link>
        </p>

      </div>
    </div>
  )
}

export default VerifyOTP