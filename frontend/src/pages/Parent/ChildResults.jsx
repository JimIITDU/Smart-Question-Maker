import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllExams } from '../../services/api'
import { FiArrowLeft, FiBarChart2 } from 'react-icons/fi'

const ChildResults = () => {
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllExams()
      .then(r => setExams(r.data.data.filter(e => e.status === 'completed')))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#030712]/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center gap-4">
          <Link to="/parent" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center"><FiArrowLeft /></div>
            <span className="text-sm">Dashboard</span>
          </Link>
          <h1 className="text-lg font-bold text-white">Child Results</h1>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-28 pb-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Child's <span className="text-blue-400">Results</span></h1>
          <p className="text-gray-400">Academic performance overview</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : exams.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
            <FiBarChart2 className="text-4xl text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">No results yet</p>
            <p className="text-gray-600 text-sm">Results will appear here after exams are completed</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {exams.map((exam) => (
              <div key={exam.exam_id} className="bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl p-6 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-gray-500/10 text-gray-400 border border-gray-500/20">Completed</span>
                  <span className="text-xs text-gray-500">{exam.exam_type}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{exam.title || 'Untitled Exam'}</h3>
                <p className="text-gray-500 text-sm mb-4">{new Date(exam.start_time).toLocaleDateString()}</p>
                <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <FiBarChart2 className="text-blue-400" />
                  <span className="text-blue-400 text-sm font-medium">View detailed results</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default ChildResults