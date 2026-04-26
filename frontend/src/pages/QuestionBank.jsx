import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAllQuestions, createQuestion, deleteQuestion } from '../services/api'
import { useAuth } from '../context/AuthContext.jsx'

// --- Icons ---
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
const CheckCircle = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>


const QuestionBank = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    subject_id: '',
    course_id: '',
    question_text: '',
    question_type: 'mcq',
    difficulty: 'easy',
    max_marks: 1,
    option_text_a: '',
    option_text_b: '',
    option_text_c: '',
    option_text_d: '',
    correct_option: 'A',
    expected_answer: '',
  })

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    try {
      const res = await getAllQuestions()
      setQuestions(res.data.data)
    } catch (err) {
      setError('Failed to load questions')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      await createQuestion(formData)
      setSuccess('Question added to bank successfully!')
      setShowForm(false)
      fetchQuestions()
      setFormData({
        subject_id: '',
        course_id: '',
        question_text: '',
        question_type: 'mcq',
        difficulty: 'easy',
        max_marks: 1,
        option_text_a: '',
        option_text_b: '',
        option_text_c: '',
        option_text_d: '',
        correct_option: 'A',
        expected_answer: '',
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create question')
    }
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

  return (
    <div className="min-h-screen bg-[#0B0C15] pb-20">
      
      {/* --- Ambient Background --- */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* --- Navbar --- */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#0B0C15]/70 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-20 flex justify-between items-center">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Dashboard</span>
              <span className="text-xs text-gray-600">Back</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-xs text-white">
              SQ
             </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Question <span className="text-indigo-400">Bank</span>
            </h1>
            <p className="text-gray-400 text-sm">Create, manage, and review your question database.</p>
          </div>
          <div className="flex items-center gap-3">
            {(user?.role_id === 2 || user?.role_id === 3) && (
              <button
                onClick={() => navigate('/ai-generate')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
              >
                ✨ Generate with AI
              </button>
            )}
            {(user?.role_id === 2 || user?.role_id === 3) && (
              <button
                onClick={() => setShowForm(!showForm)}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                showForm
                  ? 'bg-white text-[#0B0C15] hover:bg-gray-200'
                  : 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-lg shadow-indigo-900/40 hover:shadow-indigo-900/60 hover:scale-[1.02]'
              }`}
            >
              <PlusIcon />
              {showForm ? 'Cancel' : 'Add Question'}
            </button>
          )}
          </div>
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

        {/* Create Question Form Drawer */}
        {showForm && (
          <div className="bg-[#13151f] border border-white/10 rounded-2xl p-8 mb-12 shadow-2xl animate-in fade-in slide-in-from-top-8 duration-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Create New Question</h2>
              <div className="h-px flex-1 bg-white/10 mx-4"></div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Subject ID</label>
                  <input
                    type="number"
                    name="subject_id"
                    value={formData.subject_id}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 101"
                    className="w-full bg-[#0B0C15] border border-white/10 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Course ID</label>
                  <input
                    type="number"
                    name="course_id"
                    value={formData.course_id}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 2023"
                    className="w-full bg-[#0B0C15] border border-white/10 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Question Text</label>
                <textarea
                  name="question_text"
                  value={formData.question_text}
                  onChange={handleChange}
                  required
                  rows={3}
                  placeholder="Enter the question here..."
                  className="w-full bg-[#0B0C15] border border-white/10 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Type</label>
                  <select
                    name="question_type"
                    value={formData.question_type}
                    onChange={handleChange}
                    className="w-full bg-[#0B0C15] border border-white/10 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 appearance-none"
                  >
                    <option value="mcq" className="bg-[#0B0C15]">MCQ</option>
                    <option value="descriptive" className="bg-[#0B0C15]">Descriptive</option>
                    <option value="true_false" className="bg-[#0B0C15]">True/False</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Difficulty</label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                    className="w-full bg-[#0B0C15] border border-white/10 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 appearance-none"
                  >
                    <option value="easy" className="bg-[#0B0C15]">Easy</option>
                    <option value="medium" className="bg-[#0B0C15]">Medium</option>
                    <option value="hard" className="bg-[#0B0C15]">Hard</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Max Marks</label>
                  <input
                    type="number"
                    name="max_marks"
                    value={formData.max_marks}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#0B0C15] border border-white/10 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              {/* MCQ Options Input */}
              {formData.question_type === 'mcq' && (
                <div className="bg-[#0B0C15] p-5 rounded-xl border border-white/5 space-y-4">
                  <label className="text-sm font-medium text-gray-300">Answer Options</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['a', 'b', 'c', 'd'].map((opt) => (
                      <div key={opt} className="relative">
                        <span className="absolute left-3 top-3 font-bold text-indigo-400 uppercase">{opt}</span>
                        <input
                          type="text"
                          name={`option_text_${opt}`}
                          value={formData[`option_text_${opt}`]}
                          onChange={handleChange}
                          placeholder={`Option ${opt.toUpperCase()}`}
                          className="w-full bg-[#0B0C15] border border-white/10 text-gray-300 text-sm rounded-lg pl-8 pr-4 py-2 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="pt-2">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 block">Correct Option</label>
                    <div className="flex gap-2">
                      {['A', 'B', 'C', 'D'].map((opt) => (
                        <button
                          type="button"
                          key={opt}
                          onClick={() => setFormData({...formData, correct_option: opt})}
                          className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all ${
                            formData.correct_option === opt 
                              ? 'bg-indigo-600 border-indigo-500 text-white' 
                              : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Descriptive Answer Input */}
              {formData.question_type === 'descriptive' && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Expected Answer (Reference)</label>
                  <textarea
                    name="expected_answer"
                    value={formData.expected_answer}
                    onChange={handleChange}
                    rows={3}
                    placeholder="For reference only..."
                    className="w-full bg-[#0B0C15] border border-white/10 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 text-white py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-indigo-900/40 transition-all"
              >
                Create Question
              </button>
            </form>
          </div>
        )}

        {/* Questions List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-[#13151f]/50">
            <p className="text-gray-500 text-lg">No questions found in the bank.</p>
            {(user?.role_id === 2 || user?.role_id === 3) && (
              <button onClick={() => setShowForm(true)} className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm font-medium">Create the first one</button>
            )}
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

                {/* Question Text */}
                <h3 className="text-lg md:text-xl text-white font-medium mb-6 leading-relaxed">
                  {q.question_text}
                </h3>

                {/* Options Display */}
                {q.question_type === 'mcq' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {['a', 'b', 'c', 'd'].map((opt) => {
                      const optText = q[`option_text_${opt}`]
                      const isCorrect = q.correct_option === opt.toUpperCase()
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