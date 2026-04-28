import React, { useState, useEffect } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { getResults } from '../../services/api'

// --- Icons ---
const ArrowLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
)

const Trophy = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
)

const AlertCircle = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
)

const Check = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
)

const X = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
)

const Results = () => {
  const { id } = useParams()
  const location = useLocation()
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const summary = location.state?.summary

  useEffect(() => {
    fetchResults()
  }, [])

  const fetchResults = async () => {
    try {
      const res = await getResults(id)
      setResults(res.data.data)
    } catch (err) {
      setError('Failed to load results')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0C15] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
           <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
           <p className="text-gray-400">Calculating your performance...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0B0C15] relative overflow-hidden">
      
      {/* --- Ambient Background --- */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* --- Navbar --- */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0B0C15]/70 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 h-20 flex justify-between items-center">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 group text-gray-400 hover:text-white transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
              <ArrowLeft />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Back to Exams</span>
              <span className="text-xs text-gray-600">Exit Results</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-xs text-white">
              SQ
             </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-4xl mx-auto px-6 pt-28 pb-20">

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-8 flex items-center gap-3">
            <AlertCircle />
            {error}
          </div>
        )}

        {/* --- Summary Hero Card --- */}
        {summary && (
          <div className={`
            rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden mb-12 transition-all duration-700 animate-in fade-in slide-in-from-bottom-4
            ${summary.result_status === 'pass'
              ? 'bg-gradient-to-br from-emerald-600 to-teal-800 text-white shadow-emerald-900/40'
              : 'bg-gradient-to-br from-rose-600 to-orange-800 text-white shadow-rose-900/40'
            }
          `}>
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIiBmaWxsLW9wYWNpdHk9IjAuMSIgZmlsbD0id2hpdGUiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjEiLz48L3N2Zz4=')] opacity-30"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              {/* Icon Circle */}
              <div className="flex-shrink-0 w-32 h-32 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
                 {summary.result_status === 'pass' ? <Trophy /> : <AlertCircle />}
              </div>

              {/* Stats */}
              <div className="flex-1 text-center md:text-left">
                <div className="inline-block px-4 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/10 text-xs font-bold uppercase tracking-wider mb-3">
                  Result: {summary.result_status}
                </div>
                <h1 className="text-6xl md:text-7xl font-bold tracking-tight mb-2 drop-shadow-lg">
                  {summary.percentage}%
                </h1>
                <p className="text-xl text-white/80 font-medium">
                  {summary.obtained_marks} <span className="text-white/40">/ {summary.total_marks}</span> Marks
                </p>
                <p className="mt-4 text-white/60 text-sm max-w-md">
                  {summary.result_status === 'pass' 
                    ? "Excellent work! You've demonstrated a strong understanding of the material." 
                    : "Keep pushing. Review the breakdown below to identify areas for improvement."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* --- Question Breakdown --- */}
        {results?.results?.length > 0 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 delay-200 duration-700">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold text-white">Detailed Analysis</h2>
              <div className="h-px flex-1 bg-white/10"></div>
            </div>

            {results.results.map((r, index) => {
              const isCorrect = parseFloat(r.marks_obtained) > 0
              
              return (
                <div
                  key={r.result_id}
                  className="relative bg-[#13151f] border border-white/5 rounded-2xl p-6 md:p-8 overflow-hidden hover:border-white/10 transition-colors group"
                >
                  {/* Status Side Border */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>

                  <div className="flex justify-between items-start gap-6">
                    
                    {/* Question Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-gray-500 font-mono text-sm">0{index + 1}</span>
                        <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${isCorrect ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'}`}>
                           {isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                      </div>
                      
                      <h3 className="text-lg text-gray-200 font-medium mb-2 leading-relaxed">
                        {r.question_text}
                      </h3>
                      
                      {r.question_type === 'mcq' && (
                        <div className="mt-3 flex items-center gap-2 text-sm bg-white/5 p-3 rounded-lg border border-white/5">
                          <span className="text-gray-500 font-semibold">Answer:</span>
                          <span className="text-indigo-400 font-mono">{r.correct_option}</span>
                        </div>
                      )}
                    </div>

                    {/* Score Badge */}
                    <div className={`flex-shrink-0 w-16 h-16 rounded-xl flex flex-col items-center justify-center border shadow-sm ${
                      isCorrect 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                    }`}>
                      <span className="text-2xl font-bold">{isCorrect ? <Check /> : <X />}</span>
                      <span className="text-[10px] uppercase font-bold mt-1">{r.marks_obtained} pts</span>
                    </div>

                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* No Results State */}
        {!summary && results?.results?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 text-gray-600">
               <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/></svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Results Found</h3>
            <p className="text-gray-500 mb-8">It looks like the results haven't been processed yet.</p>
            <Link to="/exams" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Return to Exams
            </Link>
          </div>
        )}

      </main>
    </div>
  )
}

export default Results