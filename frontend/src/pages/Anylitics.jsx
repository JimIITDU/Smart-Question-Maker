import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getExamAnalytics } from '../services/api'
import Navbar from '../components/Navbar.jsx'

const Analytics = () => {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const res = await getExamAnalytics(id)
      setData(res.data.data)
    } catch (err) {
      setError('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl font-semibold">Loading analytics...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Exam Analytics
          </h1>
          <Link
            to="/exams"
            className="bg-white text-gray-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition border"
          >
            ← Back to Exams
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {data && (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-2xl shadow p-6 text-center">
                <p className="text-3xl font-bold text-indigo-600">
                  {data.analytics.total_students || 0}
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Total Students
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow p-6 text-center">
                <p className="text-3xl font-bold text-green-600">
                  {data.analytics.passed || 0}
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Passed
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow p-6 text-center">
                <p className="text-3xl font-bold text-red-600">
                  {data.analytics.failed || 0}
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Failed
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow p-6 text-center">
                <p className="text-3xl font-bold text-yellow-600">
                  {parseFloat(data.analytics.avg_percentage || 0).toFixed(1)}%
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Average Score
                </p>
              </div>
            </div>

            {/* Score range */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="font-bold text-gray-800 mb-2">
                  Highest Score
                </h2>
                <p className="text-4xl font-bold text-green-600">
                  {parseFloat(data.analytics.highest || 0).toFixed(1)}%
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="font-bold text-gray-800 mb-2">
                  Lowest Score
                </h2>
                <p className="text-4xl font-bold text-red-600">
                  {parseFloat(data.analytics.lowest || 0).toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Pass/Fail rate bar */}
            <div className="bg-white rounded-2xl shadow p-6 mb-6">
              <h2 className="font-bold text-gray-800 mb-4">
                Pass/Fail Rate
              </h2>
              {data.analytics.total_students > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                  <div
                    className="bg-green-500 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{
                      width: `${(data.analytics.passed / data.analytics.total_students) * 100}%`
                    }}
                  >
                    {Math.round((data.analytics.passed / data.analytics.total_students) * 100)}% Pass
                  </div>
                </div>
              )}
            </div>

            {/* Student results table */}
            {data.students.length > 0 && (
              <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="font-bold text-gray-800 mb-4">
                  Student Results
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-3 text-left font-semibold text-gray-600">
                          Student
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-600">
                          Email
                        </th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-600">
                          Questions
                        </th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-600">
                          Marks Obtained
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.students.map((student, index) => (
                        <tr
                          key={index}
                          className="border-t border-gray-100 hover:bg-gray-50"
                        >
                          <td className="px-4 py-3 font-medium text-gray-800">
                            {student.student_name}
                          </td>
                          <td className="px-4 py-3 text-gray-500">
                            {student.email}
                          </td>
                          <td className="px-4 py-3 text-center text-gray-600">
                            {student.questions_attempted}
                          </td>
                          <td className="px-4 py-3 text-center font-semibold text-indigo-600">
                            {parseFloat(student.total_obtained).toFixed(1)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* No students yet */}
            {data.students.length === 0 && (
              <div className="bg-white rounded-2xl shadow p-6 text-center text-gray-500">
                No students have taken this exam yet.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Analytics