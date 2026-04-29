import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllExams, startExam } from '../../services/api'
import toast from 'react-hot-toast'
import { FiArrowLeft, FiZap, FiUsers, FiPlay, FiStopCircle } from 'react-icons/fi'

const LiveQuiz = () => {
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllExams()
      .then(r => setExams(r.data.data.filter(e => e.exam_type === 'live_quiz')))
      .catch(() => toast.error('Failed to load quizzes'))
      .finally(() => setLoading(false))
  }, [])

  const handleStart = async (id) => {
    try {
      await startExam(id)
      toast.success('Live quiz started!')
      setExams(exams.map(e => e.exam_id === id ? { ...e, status: 'ongoing' } : e))
    } catch {
      toast.error('Failed to start quiz')
    }
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#030712]/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <Link to="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center"><FiArrowLeft /></div>
            <span className="text-sm">Dashboard</span>
          </Link>
          <Link to="/teacher/exams/create" className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all">
            <FiZap /> New Live Quiz
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-28 pb-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Live <span className="text-emerald-400">Quiz</span></h1>
          <p className="text-gray-400">Manage and host real-time quiz sessions</p>
        </div>

        <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-6 mb-8 flex items-center gap-4">
          <FiZap className="text-emerald-400 text-3xl flex-shrink-0" />
          <div>
            <h3 className="text-white font-bold">How Live Quiz Works</h3>
            <p className="text-gray-400 text-sm">Create an exam with type "Live Quiz", start it, and share the access code with students. They join using /join-quiz.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
          </div>
        ) : exams.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
            <FiZap className="text-4xl text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-4">No live quizzes yet</p>
            <Link to="/exams/create" className="text-emerald-400 hover:text-emerald-300 font-medium">Create a live quiz</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {exams.map((exam) => (
              <div key={exam.exam_id} className="bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl p-6 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-3 h-3 rounded-full ${exam.status === 'ongoing' ? 'bg-emerald-500 animate-pulse' : exam.status === 'completed' ? 'bg-gray-500' : 'bg-amber-500'}`}></div>
                  <span className="text-xs text-gray-500 font-mono">{exam.status}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{exam.title || 'Live Quiz'}</h3>
                {exam.access_code && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center mb-4">
                    <p className="text-xs text-gray-500 mb-1">Access Code</p>
                    <p className="text-2xl font-mono font-bold text-emerald-400">{exam.access_code}</p>
                  </div>
                )}
                <div className="flex gap-2 pt-4 border-t border-white/5">
                  {exam.status === 'scheduled' && (
                    <button onClick={() => handleStart(exam.exam_id)} className="flex-1 flex items-center justify-center gap-2 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-sm font-semibold hover:bg-emerald-500/20 transition-all">
                      <FiPlay /> Start
                    </button>
                  )}
                  {exam.status === 'ongoing' && (
                    <div className="flex-1 flex items-center justify-center gap-2 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-sm font-semibold">
                      <FiUsers /> Live Now
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default LiveQuiz