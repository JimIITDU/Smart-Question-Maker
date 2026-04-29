import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAllExams, createExam, startExam, getAllQuestions } from '../../services/api.js'
import { useAuth } from '../../context/AuthContext.jsx'

// --- Icons ---
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
const PlayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
const ClipboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
const ChartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>

const Exams = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [exams, setExams] = useState([])
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  // NEW STATE: For the generated access code popup
  const [generatedCode, setGeneratedCode] = useState('')

  const [formData, setFormData] = useState({
    subject_id: '',
    batch_id: '',
    exam_type: 'regular',
    start_time: '',
    end_time: '',
    question_ids: [],
  })

  useEffect(() => {
    fetchExams()
    fetchQuestions()
  }, [])

  const fetchExams = async () => {
    try {
      const res = await getAllExams()
      setExams(res.data.data)
    } catch (err) {
      console.error('fetchExams error:', err)
      setError('Failed to load exams')
    } finally {

      setLoading(false)
    }
  }

  const fetchQuestions = async () => {
    try {
      const res = await getAllQuestions()
      setQuestions(res.data.data)
    } catch (err) {
      console.error('fetchQuestions error:', err)
    }

  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleQuestionSelect = (question_id) => {
    const ids = formData.question_ids
    if (ids.includes(question_id)) {
      setFormData({
        ...formData,
        question_ids: ids.filter((id) => id !== question_id),
      })
    } else {
      setFormData({
        ...formData,
        question_ids: [...ids, question_id],
      })
    }
  }

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  try {
    const res = await createExam(formData);
    
    // Capture the code from your backend response structure
    if (res.data.success) {
      setGeneratedCode(res.data.data.access_code); 
      setSuccess('Exam created successfully!');
      setShowForm(false);
      fetchExams();
      
      // Reset form...
      setFormData({
        subject_id: '', batch_id: '', exam_type: 'regular',
        start_time: '', end_time: '', question_ids: [],
      });
    }
  } catch (err) {
    console.error('createExam error:', err)
    setError(err.response?.data?.message || 'Failed to create exam');
  }

};

  const handleStartExam = async (id) => {
    try {
      await startExam(id)
      setSuccess('Exam started!')
      fetchExams()
    } catch (err) {
      console.error('startExam error:', err)
      setError('Failed to start exam')
    }

  }

  const getStatusInfo = (status) => {
    switch (status) {
      case 'scheduled': return { color: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-500/20', label: 'Scheduled' }
      case 'ongoing': return { color: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500/20', label: 'Ongoing' }
      case 'completed': return { color: 'bg-gray-500', text: 'text-gray-400', border: 'border-gray-500/20', label: 'Completed' }
      default: return { color: 'bg-gray-500', text: 'text-gray-400', border: 'border-gray-500/20', label: 'Unknown' }
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0C15] pb-20">

      {/* --- Success Modal for Access Code --- */}
{generatedCode && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#0B0C15]/80 backdrop-blur-sm animate-in fade-in duration-300">
    <div className="bg-[#13151f] border border-indigo-500/30 rounded-3xl p-8 max-w-md w-full shadow-[0_0_50px_-12px_rgba(79,70,229,0.5)] text-center">
      <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Exam Created!</h2>
      <p className="text-gray-400 mb-6">Share this access code with your students to let them join the live quiz.</p>
      
      <div className="bg-[#0B0C15] border border-white/10 rounded-2xl p-6 mb-6 group relative">
        <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 block mb-2">Access Code</span>
        <div className="text-4xl font-mono font-black text-indigo-400 tracking-widest uppercase">
          {generatedCode}
        </div>
      </div>

      <div className="flex gap-3">
        <button 
          onClick={() => {
            navigator.clipboard.writeText(generatedCode);
            setSuccess('Code copied to clipboard!');
          }}
          className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-semibold transition-all border border-white/10"
        >
          Copy Code
        </button>
        <button 
          onClick={() => setGeneratedCode('')}
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-600/20"
        >
          Done
        </button>
      </div>
    </div>
  </div>
)}
      
      {/* --- Ambient Background --- */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* --- Navbar --- */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#0B0C15]/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
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

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Exams</h1>
          <div className="flex gap-2">
            {user?.role_id === 5 && (
              <Link
                to="/join-quiz"
                className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition"
              >
                🎯 Join Live Quiz
              </Link>
            )}
            {(user?.role_id === 2 || user?.role_id === 3) && (
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                {showForm ? 'Cancel' : '+ Create Exam'}
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

        {/* Create Exam Form Drawer */}
        {showForm && (
          <div className="bg-[#13151f] border border-white/10 rounded-2xl p-8 mb-12 shadow-2xl animate-in fade-in slide-in-from-top-8 duration-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Create New Exam</h2>
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
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Batch ID</label>
                  <input
                    type="number"
                    name="batch_id"
                    value={formData.batch_id}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 2023"
                    className="w-full bg-[#0B0C15] border border-white/10 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Type</label>
                  <select
                    name="exam_type"
                    value={formData.exam_type}
                    onChange={handleChange}
                    className="w-full bg-[#0B0C15] border border-white/10 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 appearance-none"
                  >
                    <option value="regular" className="bg-[#0B0C15]">Regular</option>
                    <option value="live_quiz" className="bg-[#0B0C15]">Live Quiz</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Start Time</label>
                  <input
                    type="datetime-local"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#0B0C15] border border-white/10 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 [color-scheme:dark]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">End Time</label>
                  <input
                    type="datetime-local"
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#0B0C15] border border-white/10 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* ✅ FIXED: Removed invalid {exam.exam_type} reference */}
              {formData.exam_type === 'live_quiz' && (
                <div className="mt-4 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-center">
                  <p className="text-sm text-indigo-400">
                    Live Quiz mode selected. An access code will be generated after creation.
                  </p>
                </div>
              )}

              {/* Questions Selector */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Select Questions</label>
                  <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">
                    {formData.question_ids.length} selected
                  </span>
                </div>
                <div className="bg-[#0B0C15] border border-white/10 rounded-xl p-4 max-h-60 overflow-y-auto space-y-2 custom-scrollbar">
                  {questions.length > 0 ? questions.map((q) => {
                    const isSelected = formData.question_ids.includes(q.question_id)
                    return (
                      <div
                        key={q.question_id}
                        onClick={() => handleQuestionSelect(q.question_id)}
                        className={`group p-3 rounded-lg cursor-pointer border transition-all duration-200 flex items-center justify-between ${
                          isSelected 
                            ? 'bg-indigo-500/10 border-indigo-500/50' 
                            : 'hover:bg-white/5 border-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-gray-600'}`}>
                            {isSelected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                          </div>
                          <span className="text-sm text-gray-300 truncate w-full">
                            {q.question_text.substring(0, 60)}...
                          </span>
                        </div>
                        <span className={`ml-4 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            q.difficulty === 'easy' ? 'bg-emerald-500/10 text-emerald-400' :
                            q.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
                          }`}>
                          {q.difficulty}
                        </span>
                      </div>
                    )
                  }) : (
                    <p className="text-center text-gray-500 text-sm py-4">No questions found in bank.</p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 text-white py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-indigo-900/40 transition-all"
              >
                Create Exam
              </button>
            </form>
          </div>
        )}

        {/* Exams Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
        ) : exams.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-[#13151f]/50">
            <p className="text-gray-500 text-lg">No exams scheduled at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {exams.map((exam) => {
              const status = getStatusInfo(exam.status)
              return (
                <div
                  key={exam.exam_id}
                  className="group relative bg-[#13151f] border border-white/5 rounded-2xl p-6 hover:border-white/10 hover:shadow-[0_0_30px_-15px_rgba(99,102,241,0.15)] transition-all duration-300 flex flex-col h-full"
                >
                  {/* Status Dot Indicator */}
                  <div className={`absolute top-0 right-0 mt-4 mr-4 w-2.5 h-2.5 rounded-full shadow-[0_0_10px_currentColor] ${status.color}`}></div>

                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${status.border} ${status.text}`}>
                      {status.label}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-gray-300 border border-white/10">
                      {exam.exam_type}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">
                      {exam.subject_name || 'Untitled Exam'}
                    </h3>
                    
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" x2="20" y1="8" y2="14"/><line x1="23" x2="17" y1="11" y2="11"/></svg>
                        {exam.batch_name}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        {new Date(exam.start_time).toLocaleDateString()} at {new Date(exam.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      {exam.access_code && (
                        <div className="mt-2 p-2 bg-white/5 rounded border border-white/5 text-center">
                          <span className="text-xs text-gray-500 block uppercase tracking-wide">Access Code</span>
                          <span className="text-lg font-mono text-indigo-400">{exam.access_code}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 mt-auto pt-4 border-t border-white/5">
                    {(user?.role_id === 2 || user?.role_id === 3) && exam.status === 'scheduled' && (
                      <button
                        onClick={() => handleStartExam(exam.exam_id)}
                        className="w-full flex items-center justify-center gap-2 bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-600/20 py-2.5 rounded-xl font-semibold text-sm transition-all"
                      >
                        <PlayIcon /> Start Exam
                      </button>
                    )}
                    {user?.role_id === 5 && exam.status === 'ongoing' && (
                      <button
                        onClick={() => navigate(`/exams/${exam.exam_id}/take`)}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white hover:bg-indigo-500 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-indigo-900/20"
                      >
                        <ClipboardIcon /> Take Exam
                      </button>
                    )}
                    <Link
                      to={`/results/${exam.exam_id}`}
                      className="w-full flex items-center justify-center gap-2 bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 border border-white/5 py-2.5 rounded-xl font-semibold text-sm transition-all"
                    >
                      <ChartIcon /> View Results
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

export default Exams
