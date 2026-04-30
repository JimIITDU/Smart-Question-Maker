import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createExam, getAllQuestions } from '../../services/api'
import toast from 'react-hot-toast'
import { FiArrowLeft, FiSave, FiSearch, FiClock, FiX } from 'react-icons/fi'

// Class options (same as CreateQuestion)
const CLASS_OPTIONS = [
  '1st', '2nd', '3rd', '4', '5', '6', '7', '8',
  '9-10 (Secondary)', '11-12(Higher Secondary)',
  'Bachelor(hons)', 'Masters', 'MPhil', 'others'
]

// Paper options
const PAPER_OPTIONS = ['1st', '2nd', '3rd']

// Chapter number options (1-50)
const CHAPTER_OPTIONS = Array.from({ length: 50 }, (_, i) => (i + 1).toString())

// Question type options
const QUESTION_TYPE_OPTIONS = ['mcq', 'descriptive', 'true_false']

// Difficulty options
const DIFFICULTY_OPTIONS = ['easy', 'medium', 'hard']

// School level classes - for Subject/Course label logic
const SCHOOL_CLASSES = [
  '1st', '2nd', '3rd', '4', '5', '6', '7', '8',
  '9-10 (Secondary)', '11-12(Higher Secondary)'
]

const isSchoolClass = (className) => SCHOOL_CLASSES.includes(className)

const CreateExam = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [questions, setQuestions] = useState([])
  
  // State for comprehensive filters (matching QuestionBank)
  const [filters, setFilters] = useState({
    class_name: '',
    subject_name: '',
    paper: '',
    chapter: '',
    chapter_name: '',
    topic: '',
    question_type: '',
    difficulty: '',
  })

  // Search filter (for question text search)
  const [searchText, setSearchText] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    exam_type: 'regular',
    duration_minutes: 60,
    start_time: '',
    end_time: '',
    hours_open: 24, // For live quiz - how many hours it stays open
    question_ids: [],
  })

  // Determine Subject/Course label based on class filter selection
  const subjectCourseLabel = isSchoolClass(filters.class_name) ? 'Subject' : 'Course'

  const isLiveQuiz = formData.exam_type === 'live_quiz'

  // Fetch questions with filters from API - auto-applies when filters change
  const fetchQuestions = useCallback(async (searchFilters = {}) => {
    setLoading(true)
    try {
      const res = await getAllQuestions(searchFilters)
      setQuestions(res.data.data)
    } catch (err) {
      console.error('Error fetching questions:', err)
      toast.error('Failed to load questions')
    } finally {
      setLoading(false)
    }
  }, [])

  // Auto-fetch when filters change
  useEffect(() => {
    const activeFilters = {}
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key].trim()) {
        activeFilters[key] = filters[key].trim()
      }
    })
    fetchQuestions(activeFilters)
  }, [filters, fetchQuestions])

  // Initial fetch
  useEffect(() => {
    fetchQuestions({})
  }, [fetchQuestions])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  // Handler for filter inputs - auto-applies
  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters({ ...filters, [name]: value })
  }

// Handle search text change - auto-filters client side
  const handleSearchChange = (e) => {
    setSearchText(e.target.value)
  }

  // Clear all filters - reset to initial state
  const handleClearFilters = () => {
    setFilters({
      class_name: '',
      subject_name: '',
      paper: '',
      chapter: '',
      chapter_name: '',
      topic: '',
      question_type: '',
      difficulty: '',
    })
    setSearchText('')
    // Refetch all questions
    fetchQuestions({})
  }

  const toggleQuestion = (id) => {
    const ids = formData.question_ids
    setFormData({ ...formData, question_ids: ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id] })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.question_ids.length === 0) { toast.error('Select at least one question'); return }
    setLoading(true)
    try {
      // For live quiz, calculate end_time based on start_time + hours_open
      let examData = { ...formData }
      if (formData.exam_type === 'live_quiz' && formData.start_time) {
        const start = new Date(formData.start_time)
        const end = new Date(start.getTime() + (formData.hours_open || 24) * 60 * 60 * 1000)
        examData.end_time = end.toISOString().slice(0, 16)
      }
      await createExam(examData)
      toast.success('Exam created successfully!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create exam')
    } finally {
      setLoading(false)
    }
  }

  // Filter questions based on search text (client-side)
  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = !searchText || q.question_text.toLowerCase().includes(searchText.toLowerCase())
    return matchesSearch
  })

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#030712]/70 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center gap-4">
          <Link to="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center"><FiArrowLeft /></div>
            <span className="text-sm">Manage Exams</span>
          </Link>
          <h1 className="text-lg font-bold text-white">Create Exam</h1>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-28 pb-20">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Exam Details Section */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
            <h2 className="text-lg font-bold text-white">Exam Details</h2>

            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Exam Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="e.g. Mid Term Exam" className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500" />
            </div>

{/* Type and Duration in first row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Type</label>
                <select name="exam_type" value={formData.exam_type} onChange={handleChange} className="w-full bg-[#0B1120] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500">
                  <option value="regular">Regular Exam</option>
                  <option value="live_quiz">Live Quiz</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Duration (mins)</label>
                <input type="number" name="duration_minutes" value={formData.duration_minutes} onChange={handleChange} min={1} className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500" />
              </div>
            </div>

            {/* Start Time and End Time/Hours Open in same row - side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Start Time</label>
                <input type="datetime-local" name="start_time" value={formData.start_time} onChange={handleChange} required className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 [color-scheme:dark]" />
              </div>
              
              {isLiveQuiz ? (
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Hours Open</label>
                  <div className="relative">
                    <FiClock className="absolute left-4 top-3.5 text-gray-500" />
                    <input type="number" name="hours_open" value={formData.hours_open} onChange={handleChange} min={1} max={168} className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-purple-500" placeholder="24" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Quiz available for this many hours after start</p>
                </div>
              ) : (
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">End Time <span className="text-gray-500 normal-case font-normal">(optional)</span></label>
                  <input type="datetime-local" name="end_time" value={formData.end_time} onChange={handleChange} className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 [color-scheme:dark]" />
                </div>
              )}
            </div>

            {/* Description helper */}
            <div className={`p-4 rounded-xl border ${isLiveQuiz ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-blue-500/10 border-blue-500/20'}`}>
              <p className={`text-sm ${isLiveQuiz ? 'text-emerald-400' : 'text-blue-400'}`}>
                {isLiveQuiz 
                  ? 'Live Quiz: Students can attempt once within the time window. Results shown after completion.' 
                  : 'Regular Exam: Students can attempt multiple times within the available time window.'}
              </p>
            </div>
          </div>

          {/* Select Questions Section */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white">Select Questions</h2>
              <span className="text-sm font-bold text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full">{formData.question_ids.length} selected</span>
            </div>

{/* Comprehensive Filters Section - auto-applies when changed */}
            <div className="bg-[#0B1120] border border-white/10 rounded-xl p-4 mb-6">
              {/* Filter Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Class Filter */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Class</label>
                  <select
                    name="class_name"
                    value={filters.class_name}
                    onChange={handleFilterChange}
                    className="w-full bg-[#13151f] border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 appearance-none"
                  >
                    <option value="" className="bg-[#13151f]">All Classes</option>
                    {CLASS_OPTIONS.map((cls) => (
                      <option key={cls} value={cls} className="bg-[#13151f]">{cls}</option>
                    ))}
                  </select>
                </div>

                {/* Subject/Course Filter */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">{subjectCourseLabel}</label>
                  <input
                    type="text"
                    name="subject_name"
                    value={filters.subject_name}
                    onChange={handleFilterChange}
                    placeholder={`Search ${subjectCourseLabel.toLowerCase()}...`}
                    className="w-full bg-[#13151f] border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Paper Filter */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Paper</label>
                  <select
                    name="paper"
                    value={filters.paper}
                    onChange={handleFilterChange}
                    className="w-full bg-[#13151f] border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 appearance-none"
                  >
                    <option value="" className="bg-[#13151f]">All Papers</option>
                    {PAPER_OPTIONS.map((p) => (
                      <option key={p} value={p} className="bg-[#13151f]">{p}</option>
                    ))}
                  </select>
                </div>

                {/* Chapter Filter */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Chapter</label>
                  <select
                    name="chapter"
                    value={filters.chapter}
                    onChange={handleFilterChange}
                    className="w-full bg-[#13151f] border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 appearance-none"
                  >
                    <option value="" className="bg-[#13151f]">All Chapters</option>
                    {CHAPTER_OPTIONS.map((ch) => (
                      <option key={ch} value={ch} className="bg-[#13151f]">Chapter {ch}</option>
                    ))}
                  </select>
                </div>

                {/* Chapter Name Filter */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Chapter Name</label>
                  <input
                    type="text"
                    name="chapter_name"
                    value={filters.chapter_name}
                    onChange={handleFilterChange}
                    placeholder="e.g. Quadratic Equations"
                    className="w-full bg-[#13151f] border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Topic Filter */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Topic</label>
                  <input
                    type="text"
                    name="topic"
                    value={filters.topic}
                    onChange={handleFilterChange}
                    placeholder="e.g. Nature of Roots"
                    className="w-full bg-[#13151f] border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Question Type Filter */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Type</label>
                  <select
                    name="question_type"
                    value={filters.question_type}
                    onChange={handleFilterChange}
                    className="w-full bg-[#13151f] border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 appearance-none"
                  >
                    <option value="" className="bg-[#13151f]">All Types</option>
                    {QUESTION_TYPE_OPTIONS.map((qt) => (
                      <option key={qt} value={qt} className="bg-[#13151f]">{qt.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                {/* Difficulty Filter */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Difficulty</label>
                  <select
                    name="difficulty"
                    value={filters.difficulty}
                    onChange={handleFilterChange}
                    className="w-full bg-[#13151f] border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 appearance-none"
                  >
                    <option value="" className="bg-[#13151f]">All Levels</option>
                    {DIFFICULTY_OPTIONS.map((diff) => (
                      <option key={diff} value={diff} className="bg-[#13151f]">{diff.charAt(0).toUpperCase() + diff.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>

{/* Search Text (client-side) */}
              <div className="mt-4">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1">Search in Results</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <FiSearch className="absolute left-3 top-2.5 text-gray-500" />
                    <input 
                      type="text" 
                      name="searchText" 
                      value={searchText} 
                      onChange={handleSearchChange} 
                      placeholder="Search by question text..." 
                      className="w-full bg-[#13151f] border border-white/10 text-white rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-1 text-sm"
                    title="Clear all filters"
                  >
                    <FiX className="w-4 h-4" />
                    Clear
                  </button>
                </div>
              </div>
</div>

            {/* Questions List */}
            <div className="max-h-72 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                </div>
              ) : filteredQuestions.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  {filters.class_name || filters.subject_name || filters.paper || filters.chapter || filters.chapter_name || filters.topic || filters.question_type || filters.difficulty || searchText
                    ? 'No questions match your filters.' 
                    : 'No questions in bank.'} 
                  {!filters.class_name && !filters.subject_name && !filters.paper && !filters.chapter && !filters.chapter_name && !filters.topic && !filters.question_type && !filters.difficulty && !searchText && (
                    <Link to="/create-question" className="text-purple-400 hover:text-purple-300 ml-2">Create some first.</Link>
                  )}
                </p>
              ) : (
                filteredQuestions.map((q) => {
                  const selected = formData.question_ids.includes(q.question_id)
                  return (
                    <div key={q.question_id} onClick={() => toggleQuestion(q.question_id)} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all ${selected ? 'bg-purple-500/10 border-purple-500/30' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                      <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${selected ? 'bg-purple-600 border-purple-500' : 'border-gray-600'}`}>
                        {selected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <p className="text-sm text-gray-300 flex-1 truncate">{q.question_text}</p>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded flex-shrink-0 ${q.difficulty === 'easy' ? 'bg-emerald-500/10 text-emerald-400' : q.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'}`}>{q.difficulty}</span>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50">
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><FiSave /> Create Exam</>}
          </button>
        </form>
      </main>
    </div>
  )
}

export default CreateExam
