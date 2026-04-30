import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllQuestions, deleteQuestion } from '../../services/api.js'
import { useAuth } from '../../context/AuthContext.jsx'

// --- Icons ---
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
const CheckCircle = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>

// Class options
const CLASS_OPTIONS = [
  '1', '2', '3', '4', '5', '6', '7', '8',
  '9-10 (Secondary)', '11-12(Higher Secondary)', 'Bachelor(pass)',
  'Bachelor(hons)', 'Masters', 'MPhil', 'others'
]

// Paper options
const PAPER_OPTIONS = ['1st', '2nd', '3rd']

// Chapter number options (1-50)
const CHAPTER_OPTIONS = Array.from({ length: 50 }, (_, i) => (i + 1).toString())

// School level classes (1-12) - for Subject/Course label logic
const SCHOOL_CLASSES = [
  '1st', '2nd', '3rd', '4', '5', '6', '7', '8',
  '9-10 (Secondary)', '11-12(Higher Secondary)'
]

const isSchoolClass = (className) => SCHOOL_CLASSES.includes(className)

const QuestionBank = () => {
  const { user } = useAuth()
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [filters, setFilters] = useState({
    class_name: '',
    subject_name: '',
    paper: '',
    chapter: '',
    chapter_name: '',
    topic: '',
  })

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async (searchFilters = {}) => {
    setLoading(true)
    setError('')
    try {
      const res = await getAllQuestions(searchFilters)
      setQuestions(res.data.data)
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to load questions'
      console.error('Error loading questions:', err)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const handleSearch = (e) => {
    e.preventDefault()
    const activeFilters = {}
    Object.keys(filters).forEach(key => {
      if (filters[key].trim()) {
        activeFilters[key] = filters[key].trim()
      }
    })
    fetchQuestions(activeFilters)
  }

  const handleClearFilters = () => {
    setFilters({
      class_name: '',
      subject_name: '',
      paper: '',
      chapter: '',
      chapter_name: '',
      topic: '',
    })
    fetchQuestions({})
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this question?')) {
      try {
        await deleteQuestion(id)
        setSuccess('Question deleted successfully!')
        fetchQuestions()
      } catch (err) {
        setError('Failed to delete question')
      }
    }
  }

  const getDifficultyColor = (diff) => {
    switch(diff) {
      case 'easy': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      case 'medium': return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      case 'hard': return 'bg-rose-500/10 text-rose-400 border-rose-500/20'
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    }
  }

  // Determine Subject/Course label based on class filter selection
  const subjectCourseLabel = isSchoolClass(filters.class_name) ? 'Subject' : 'Course'

  return (
    <div className="min-h-screen bg-[#0B0C15] pb-20">
      
      {/* --- Ambient Background --- */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Question <span className="text-indigo-400">Bank</span>
            </h1>
            <p className="text-gray-400 text-sm">Search and manage your question database.</p>
          </div>
          {(user?.role_id === 2 || user?.role_id === 3) && (
            <Link
              to="/create-question"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-lg shadow-indigo-900/40 hover:shadow-indigo-900/60 hover:scale-[1.02]"
            >
              <PlusIcon />
              Create Question
            </Link>
          )}
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3 animate-in slide-in-from-top-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-3 animate-in slide-in-from-top-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            {success}
          </div>
        )}

        {/* Search Filters */}
        <div className="bg-[#13151f] border border-white/10 rounded-2xl p-6 mb-10 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-4">Search Questions</h2>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Class</label>
                <select
                  name="class_name"
                  value={filters.class_name}
                  onChange={handleFilterChange}
                  className="w-full bg-[#0B0C15] border border-white/10 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 appearance-none"
                >
                  <option value="" className="bg-[#0B0C15]">All Classes</option>
                  {CLASS_OPTIONS.map((cls) => (
                    <option key={cls} value={cls} className="bg-[#0B0C15]">{cls}</option>
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
                  className="w-full bg-[#0B0C15] border border-white/10 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Paper</label>
                <select
                  name="paper"
                  value={filters.paper}
                  onChange={handleFilterChange}
                  className="w-full bg-[#0B0C15] border border-white/10 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 appearance-none"
                >
                  <option value="" className="bg-[#0B0C15]">All Papers</option>
                  {PAPER_OPTIONS.map((p) => (
                    <option key={p} value={p} className="bg-[#0B0C15]">{p}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Chapter</label>
                <select
                  name="chapter"
                  value={filters.chapter}
                  onChange={handleFilterChange}
                  className="w-full bg-[#0B0C15] border border-white/10 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 appearance-none"
                >
                  <option value="" className="bg-[#0B0C15]">All Chapters</option>
                  {CHAPTER_OPTIONS.map((ch) => (
                    <option key={ch} value={ch} className="bg-[#0B0C15]">Chapter {ch}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Chapter Name</label>
                <input
                  type="text"
                  name="chapter_name"
                  value={filters.chapter_name}
                  onChange={handleFilterChange}
                  placeholder="e.g. Quadratic Equations"
                  className="w-full bg-[#0B0C15] border border-white/10 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Topic</label>
                <input
                  type="text"
                  name="topic"
                  value={filters.topic}
                  onChange={handleFilterChange}
                  placeholder="e.g. Nature of Roots"
                  className="w-full bg-[#0B0C15] border border-white/10 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-lg shadow-indigo-900/40 hover:shadow-indigo-900/60 hover:scale-[1.02] transition-all"
              >
                <SearchIcon />
                Search
              </button>
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-6 py-3 rounded-xl font-semibold bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 transition-all"
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        {/* Questions List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-[#13151f]/50">
            <p className="text-gray-500 text-lg">No questions found.</p>
            <p className="text-gray-600 text-sm mt-2">Use the search filters above or create a new question.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {questions.map((q) => (
              <div
                key={q.question_id}
                className="relative bg-[#13151f] border border-white/5 rounded-2xl p-6 md:p-8 hover:border-white/10 transition-all group"
              >
                {/* Top Bar */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${getDifficultyColor(q.difficulty)}`}>
                      {q.difficulty}
                    </span>
                    <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {q.question_type}
                    </span>
                    <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-white/5 text-gray-400 border border-white/10">
                      {q.max_marks} Mark{q.max_marks > 1 ? 's' : ''}
                    </span>
                    {q.is_multiple_correct && (
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Multiple Correct
                      </span>
                    )}
                  </div>

                  {(user?.role_id === 2 || user?.role_id === 3) && (
                    <button
                      onClick={() => handleDelete(q.question_id)}
                      className="text-gray-600 hover:text-red-400 transition-colors p-1"
                      title="Delete"
                    >
                      <TrashIcon />
                    </button>
                  )}
                </div>

                {/* Classification Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {q.class_name && (
                    <span className="px-2 py-1 rounded-md text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {q.class_name}
                    </span>
                  )}
                  {q.subject_name && (
                    <span className="px-2 py-1 rounded-md text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      {isSchoolClass(q.class_name) ? 'Subject' : 'Course'}: {q.subject_name}
                    </span>
                  )}
                  {q.paper && (
                    <span className="px-2 py-1 rounded-md text-xs font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20">
                      Paper: {q.paper}
                    </span>
                  )}
                  {q.chapter && (
                    <span className="px-2 py-1 rounded-md text-xs font-medium bg-pink-500/10 text-pink-400 border border-pink-500/20">
                      Ch {q.chapter}{q.chapter_name ? `: ${q.chapter_name}` : ''}
                    </span>
                  )}
                  {q.topic && (
                    <span className="px-2 py-1 rounded-md text-xs font-medium bg-teal-500/10 text-teal-400 border border-teal-500/20">
                      {q.topic}
                    </span>
                  )}
                </div>

                {/* Question Text */}
                <h3 className="text-lg md:text-xl text-white font-medium mb-6 leading-relaxed">
                  {q.question_text}
                </h3>

                {/* Options Display */}
                {q.question_type === 'mcq' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {['a', 'b', 'c', 'd'].map((opt) => {
                      const optText = q[`option_text_${opt}`]
                      const correctOptions = q.correct_option ? q.correct_option.split(',').map(o => o.trim().toUpperCase()) : []
                      const isCorrect = correctOptions.includes(opt.toUpperCase())
                      if (!optText) return null

                      return (
                        <div
                          key={opt}
                          className={`flex items-center gap-3 p-3 rounded-lg border text-sm ${
                            isCorrect
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                              : 'bg-white/5 border-white/5 text-gray-400'
                          }`}
                        >
                          <span className="font-bold uppercase w-4 text-center text-gray-500">{opt}</span>
                          <span className="truncate">{optText}</span>
                          {isCorrect && <div className="ml-auto"><CheckCircle /></div>}
                        </div>
                      )
                    })}
                  </div>
                )}

                {q.question_type === 'true_false' && (
                  <div className="flex gap-3">
                    <div className={`px-4 py-2 rounded-lg text-sm font-medium border ${q.correct_option === 'True' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/5 text-gray-500'}`}>
                      True
                    </div>
                    <div className={`px-4 py-2 rounded-lg text-sm font-medium border ${q.correct_option === 'False' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/5 text-gray-500'}`}>
                      False
                    </div>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default QuestionBank
