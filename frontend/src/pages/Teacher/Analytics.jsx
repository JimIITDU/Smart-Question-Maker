import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllExams, getAllQuestions } from '../services/api'
import { FiArrowLeft, FiBarChart2, FiFileText, FiBook } from 'react-icons/fi'

const Analytics = () => {
  const [data, setData] = useState({ exams: [], questions: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getAllExams(), getAllQuestions()])
      .then(([e, q]) => setData({ exams: e.data.data, questions: q.data.data }))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const totalExams = data.exams.length
  const ongoingExams = data.exams.filter(e => e.status === 'ongoing').length
  const completedExams = data.exams.filter(e => e.status === 'completed').length
  const totalQuestions = data.questions.length
  const easyQ = data.questions.filter(q => q.difficulty === 'easy').length
  const mediumQ = data.questions.filter(q => q.difficulty === 'medium').length
  const hardQ = data.questions.filter(q => q.difficulty === 'hard').length

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#030712]/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center gap-4">
          <Link to="/teacher" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center"><FiArrowLeft /></div>
            <span className="text-sm">Dashboard</span>
          </Link>
          <h1 className="text-lg font-bold text-white">Analytics</h1>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-28 pb-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Analytics <span className="text-cyan-400">Overview</span></h1>
          <p className="text-gray-400">Track your teaching performance</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Exams', value: totalExams, color: 'text-purple-400', icon: FiFileText },
                { label: 'Ongoing', value: ongoingExams, color: 'text-emerald-400', icon: FiBarChart2 },
                { label: 'Completed', value: completedExams, color: 'text-blue-400', icon: FiBarChart2 },
                { label: 'Questions', value: totalQuestions, color: 'text-amber-400', icon: FiBook },
              ].map((s, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <s.icon className={`${s.color} text-2xl mb-3`} />
                  <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-gray-400 text-sm mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <h2 className="text-xl font-bold text-white mb-6">Question Difficulty Distribution</h2>
              <div className="space-y-4">
                {[
                  { label: 'Easy', value: easyQ, total: totalQuestions, color: 'bg-emerald-500' },
                  { label: 'Medium', value: mediumQ, total: totalQuestions, color: 'bg-amber-500' },
                  { label: 'Hard', value: hardQ, total: totalQuestions, color: 'bg-rose-500' },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">{item.label}</span>
                      <span className="text-white font-bold">{item.value} questions</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className={`${item.color} h-2 rounded-full transition-all duration-500`} style={{ width: item.total > 0 ? `${(item.value / item.total) * 100}%` : '0%' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <h2 className="text-xl font-bold text-white mb-6">Recent Exams</h2>
              {data.exams.length === 0 ? <p className="text-gray-500">No exams yet</p> : (
                <div className="space-y-3">
                  {data.exams.slice(0, 5).map((exam) => (
                    <div key={exam.exam_id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                      <div>
                        <p className="text-white font-medium">{exam.title || 'Untitled Exam'}</p>
                        <p className="text-gray-500 text-sm">{new Date(exam.start_time).toLocaleDateString()}</p>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${exam.status === 'ongoing' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : exam.status === 'completed' ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>{exam.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default Analytics