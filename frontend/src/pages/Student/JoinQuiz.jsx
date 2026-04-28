import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { joinExam } from '../../services/api'

// --- Icons ---
const TargetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
)

const ArrowLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
)

const JoinQuiz = () => {
  const navigate = useNavigate()
  const [accessCode, setAccessCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await joinExam({ access_code: accessCode })
      const exam = res.data.data.exam
      navigate(`/exams/${exam.exam_id}/take`)
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid access code')
      // Shake animation effect could go here
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0C15] flex flex-col">
      
      {/* --- Ambient Background --- */}
      <div className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* --- Navbar --- */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#0B0C15]/70 backdrop-blur-xl">
        <div className="max-w-md mx-auto px-6 h-20 flex justify-between items-center">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
              <ArrowLeft />
            </div>
          </Link>

          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-xs text-white">
              SQ
             </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 flex-1 flex items-center justify-center p-4">
        
        <div className="w-full max-w-md bg-[#0B0C15]/60 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 md:p-10 animate-in fade-in zoom-in-95 duration-500">
          
          {/* Icon & Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-[0_0_40px_-10px_rgba(99,102,241,0.4)] text-white animate-pulse-slow">
              <TargetIcon />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
              Join Live Quiz
            </h1>
            <p className="text-gray-400 text-sm">
              Enter the 6-digit code provided by your teacher
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3 animate-in slide-in-from-top-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-3">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-widest text-center block">
                Access Code
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={accessCode}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase()
                    // Allow only alphanumeric
                    const filtered = val.replace(/[^A-Z0-9]/g, '')
                    setAccessCode(filtered)
                  }}
                  required
                  placeholder="------"
                  maxLength={6}
                  className="w-full bg-[#151621] border border-white/10 text-white text-4xl md:text-5xl font-mono text-center rounded-2xl p-4 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 placeholder-gray-700 tracking-[0.5em] transition-all [color-scheme:dark]"
                />
                {/* Glow Effect behind input */}
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-cyan-600 rounded-2xl opacity-0 group-focus-within:opacity-20 blur transition-opacity -z-10"></div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || accessCode.length < 6}
              className="w-full relative group overflow-hidden bg-gradient-to-r from-indigo-600 to-cyan-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-900/40 hover:shadow-indigo-900/60 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Joining...
                </div>
              ) : (
                <span className="relative z-10">Join Now</span>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-cyan-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </button>

          </form>
        </div>
      </main>
    </div>
  )
}

export default JoinQuiz