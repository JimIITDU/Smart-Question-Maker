import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getExamById, getExamQuestions, getResults } from '../../services/api'
import { FiArrowLeft } from 'react-icons/fi'

const ExamDetails = () => {
  const { id } = useParams()
  const [exam, setExam] = useState(null)
  const [questions, setQuestions] = useState([])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const [e, q, r] = await Promise.all([
          getExamById(id),
          getExamQuestions(id),
          getResults(id),
        ])
        setExam(e.data.data)
        setQuestions(q.data.data)
        setResults(r.data.data?.results || [])
      } catch {} finally { setLoading(false) }
    }
    fetch()
  }, [id])

  if (loading) return <div className="min-h-screen bg-[#030712] flex items-center justify-center"><div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div></div>

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#030712]/70 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center gap-4">
          <Link to="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center"><FiArrowLeft /></div>
            <span className="text-sm">Manage Exams</span>
          </Link>
          <h1 className="text-lg font-bold text-white">Exam Details</h1>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 pt-28 pb-20 space-y-6">
        {exam && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">{exam.title || 'Untitled Exam'}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Status', value: exam.status },
                { label: 'Type', value: exam.exam_type },
                { label: 'Duration', value: `${exam.duration_minutes} mins` },
                { label: 'Access Code', value: exam.access_code || 'N/A' },
              ].map((item, i) => (
                <div key={i} className="bg-white/5 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{item.label}</p>
                  <p className="text-white font-bold">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-4">Questions ({questions.length})</h2>
          {questions.length === 0 ? <p className="text-gray-500">No questions added</p> : (
            <div className="space-y-3">
              {questions.map((q, i) => (
                <div key={q.question_id} className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-gray-500 font-mono text-sm w-6">{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-gray-200 text-sm">{q.question_text}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">{q.question_type}</span>
                      <span className="text-xs text-gray-400 bg-white/5 px-2 py-0.5 rounded">{q.difficulty}</span>
                      <span className="text-xs text-gray-400 bg-white/5 px-2 py-0.5 rounded">{q.max_marks} marks</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-4">Student Results ({results.length})</h2>
          {results.length === 0 ? <p className="text-gray-500">No submissions yet</p> : (
            <div className="space-y-2">
              {results.map((r, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-gray-300 text-sm">{r.student_name || `Student #${r.student_id}`}</p>
                  <div className="flex gap-3 items-center">
                    <span className="text-white font-bold">{r.marks_obtained} pts</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${r.result_status === 'pass' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>{r.result_status || 'pending'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default ExamDetails