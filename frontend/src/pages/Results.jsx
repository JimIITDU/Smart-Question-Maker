import React, { useState, useEffect } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { getResults } from '../services/api'

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
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl font-semibold">Loading results...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="bg-indigo-600 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-white text-indigo-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
            SQ
          </div>
          <span className="font-bold text-lg">Smart Question Maker</span>
        </div>
        <Link
          to="/exams"
          className="bg-white text-indigo-600 px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-indigo-50 transition"
        >
          ← Back to Exams
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto p-6">

        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Exam Results
        </h1>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Summary card */}
        {summary && (
          <div className={`rounded-2xl shadow p-6 mb-6 text-white ${
            summary.result_status === 'pass'
              ? 'bg-green-500'
              : 'bg-red-500'
          }`}>
            <div className="text-center">
              <div className="text-5xl mb-2">
                {summary.result_status === 'pass' ? '🎉' : '😞'}
              </div>
              <h2 className="text-2xl font-bold uppercase">
                {summary.result_status}
              </h2>
              <p className="text-4xl font-bold mt-2">
                {summary.percentage}%
              </p>
              <p className="mt-2 opacity-90">
                {summary.obtained_marks} / {summary.total_marks} marks
              </p>
            </div>
          </div>
        )}

        {/* Detailed results */}
        {results?.results?.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800">
              Question Breakdown
            </h2>
            {results.results.map((r, index) => (
              <div
                key={r.result_id}
                className="bg-white rounded-2xl shadow p-6"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 mb-2">
                      Q{index + 1}. {r.question_text}
                    </p>
                    {r.question_type === 'mcq' && (
                      <p className="text-sm text-gray-500">
                        Correct Answer: {r.correct_option}
                      </p>
                    )}
                  </div>
                  <div className={`ml-4 px-3 py-1 rounded-full font-semibold text-sm ${
                    parseFloat(r.marks_obtained) > 0
                      ? 'bg-green-100 text-green-600'
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {r.marks_obtained} marks
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No results yet */}
        {!summary && results?.results?.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            No results available yet.
          </div>
        )}

        <Link
          to="/dashboard"
          className="block w-full mt-6 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition text-center"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}

export default Results