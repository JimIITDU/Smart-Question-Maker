import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getAllExams, getAllQuestions } from '../../services/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts'
import { FiFileText, FiBarChart2, FiBook } from 'react-icons/fi'

// Class options
const CLASS_OPTIONS = [
  '1', '2', '3', '4', '5', '6', '7', '8',
  '9-10 (Secondary)', '11-12(Higher Secondary)', 'Bachelor(pass)',
  'Bachelor(hons)', 'Masters', 'MPhil', 'others'
]

const PAPER_OPTIONS = ['1st', '2nd']

const SCHOOL_CLASSES = [
  '1', '2', '3', '4', '5', '6', '7', '8',
  '9-10 (Secondary)', '11-12(Higher Secondary)'
]

const isSchoolClass = (className) => SCHOOL_CLASSES.includes(className)

const Analytics = () => {
  const [data, setData] = useState({ exams: [], questions: [] })
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    class_name: '',
    subject_name: '',
    paper: '',
    chapter: '',
    chapter_name: '',
    topic: '',
  })

  const fetchData = useCallback(async (searchFilters = {}) => {
    setLoading(true)
    try {
      const [examsRes, questionsRes] = await Promise.all([
        getAllExams(),
        getAllQuestions(searchFilters)
      ])
      setData({
        exams: examsRes.data?.data || [],
        questions: questionsRes.data?.data || []
      })
    } catch (err) {
      console.error('Failed to fetch data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData(filters)
  }, [filters, fetchData])

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const handleSearch = (e) => {
    e.preventDefault()
    const activeFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v && v.trim())
    )
    fetchData(activeFilters)
  }

  const handleClearFilters = () => {
    const resetFilters = {
      class_name: '',
      subject_name: '',
      paper: '',
      chapter: '',
      chapter_name: '',
      topic: '',
    }
    setFilters(resetFilters)
    fetchData({})
  }

  const subjectCourseLabel = isSchoolClass(filters.class_name) ? 'Subject' : 'Course'

  // Chart Data
  const difficultyData = [
    { name: 'Easy', value: data.questions.filter(q => q.difficulty === 'easy').length },
    { name: 'Medium', value: data.questions.filter(q => q.difficulty === 'medium').length },
    { name: 'Hard', value: data.questions.filter(q => q.difficulty === 'hard').length }
  ]

  const typeData = [
    { name: 'MCQ', value: data.questions.filter(q => q.question_type === 'mcq').length },
    { name: 'True/False', value: data.questions.filter(q => q.question_type === 'true_false').length },
    { name: 'Descriptive', value: data.questions.filter(q => q.question_type === 'descriptive').length }
  ]

  const totalExams = data.exams.length
  const ongoingExams = data.exams.filter(e => e.status === 'ongoing').length
  const completedExams = data.exams.filter(e => e.status === 'completed').length
  const totalQuestions = data.questions.length

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Question <span className="text-cyan-400">Analytics</span></h1>
        <p className="text-gray-400">Analyze your question distribution and performance</p>
      </div>

      {/* Filters */}
      <div className="bg-[#13151f] border border-white/10 rounded-2xl p-6 mb-10">
        <h2 className="text-lg font-bold text-white mb-4">Filter Questions</h2>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Class</label>
              <select
                name="class_name"
                value={filters.class_name}
                onChange={handleFilterChange}
                className="w-full bg-[#0B0C15] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500"
              >
                <option value="">All Classes</option>
                {CLASS_OPTIONS.map((cls) => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">{subjectCourseLabel}</label>
              <input
                type="text"
                name="subject_name"
                value={filters.subject_name}
                onChange={handleFilterChange}
                placeholder={`Search ${subjectCourseLabel.toLowerCase()}`}
                className="w-full bg-[#0B0C15] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {(filters.class_name === '9-10 (Secondary)' || filters.class_name === '11-12(Higher Secondary)') && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Paper</label>
                <select
                  name="paper"
                  value={filters.paper}
                  onChange={handleFilterChange}
                  className="w-full bg-[#0B0C15] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">All Papers</option>
                  {PAPER_OPTIONS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Chapter</label>
              <select
                name="chapter"
                value={filters.chapter}
                onChange={handleFilterChange}
                className="w-full bg-[#0B0C15] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500"
              >
                <option value="">All Chapters</option>
                {Array.from({ length: 50 }, (_, i) => (i + 1).toString()).map((ch) => (
                  <option key={ch} value={ch}>Chapter {ch}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-indigo-600 to-cyan-600 text-white hover:shadow-lg transition-all"
            >
              Apply Filter
            </button>
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-6 py-3 rounded-xl font-semibold bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
            >
              Clear Filters
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Exams', value: totalExams, color: 'text-purple-400', icon: FiFileText },
              { label: 'Ongoing', value: ongoingExams, color: 'text-emerald-400', icon: FiBarChart2 },
              { label: 'Completed', value: completedExams, color: 'text-blue-400', icon: FiBarChart2 },
              { label: 'Total Questions', value: totalQuestions, color: 'text-amber-400', icon: FiBook },
            ].map((s, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <s.icon className={`${s.color} text-3xl mb-4`} />
                <p className={`text-4xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-gray-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-6">Questions by Difficulty</h2>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={difficultyData}>
                  <CartesianGrid stroke="#ffffff10" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Bar dataKey="value">
                    {difficultyData.map((_, index) => (
                      <Cell key={index} fill={['#10b981', '#f59e0b', '#ef4444'][index]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-6">Questions by Type</h2>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={typeData}>
                  <CartesianGrid stroke="#ffffff10" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Bar dataKey="value">
                    {typeData.map((_, index) => (
                      <Cell key={index} fill={['#8b5cf6', '#06b6d4', '#ec4899'][index]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Exams */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h2 className="text-xl font-bold mb-6">Recent Exams</h2>
            {data.exams.length === 0 ? (
              <p className="text-gray-500 py-8 text-center">No exams found</p>
            ) : (
              <div className="space-y-3">
                {data.exams.slice(0, 5).map((exam) => (
                  <div key={exam.exam_id} className="flex justify-between items-center p-5 bg-white/5 rounded-xl border border-white/5">
                    <div>
                      <p className="font-medium">{exam.title || 'Untitled Exam'}</p>
                      <p className="text-sm text-gray-500">{new Date(exam.start_time).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-4 py-1 text-xs font-bold rounded-full capitalize border ${
                      exam.status === 'ongoing' ? 'border-emerald-500 text-emerald-400' : 
                      exam.status === 'completed' ? 'border-gray-500 text-gray-400' : 
                      'border-amber-500 text-amber-400'
                    }`}>
                      {exam.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default Analytics