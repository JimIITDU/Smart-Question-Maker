import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createExam, getAllQuestions } from '../services/api'
import toast from 'react-hot-toast'
import { FiArrowLeft, FiSave } from 'react-icons/fi'

const CreateExam = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [questions, setQuestions] = useState([])
  const [formData, setFormData] = useState({
    subject_id: '',
    batch_id: '',
    title: '',
    exam_type: 'regular',
    duration_minutes: 60,
    start_time: '',
    end_time: '',
    question_ids: [],
  })

  useEffect(() => {
    getAllQuestions().then(r => setQuestions(r.data.data)).catch(() => {})
  }, [])

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const toggleQuestion = (id) => {
    const ids = formData.question_ids
    setFormData({ ...formData, question_ids: ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id] })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.question_ids.length === 0) { toast.error('Select at least one question'); return }
    setLoading(true)
    try {
      await createExam(formData)
      toast.success('Exam created successfully!')
      navigate('/exams/manage')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create exam')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#030712]/70 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center gap-4">
          <Link to="/exams/manage" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center"><FiArrowLeft /></div>
            <span className="text-sm">Manage Exams</span>
          </Link>
          <h1 className="text-lg font-bold text-white">Create Exam</h1>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-28 pb-20">
        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
            <h2 className="text-lg font-bold text-white">Exam Details</h2>

            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Exam Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="e.g. Mid Term Exam" className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500" />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Subject ID</label>
                <input type="number" name="subject_id" value={formData.subject_id} onChange={handleChange} required placeholder="e.g. 1" className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Batch ID</label>
                <input type="number" name="batch_id" value={formData.batch_id} onChange={handleChange} required placeholder="e.g. 1" className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Type</label>
                <select name="exam_type" value={formData.exam_type} onChange={handleChange} className="w-full bg-[#0B1120] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500">
                  <option value="regular">Regular</option>
                  <option value="live_quiz">Live Quiz</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Duration (mins)</label>
                <input type="number" name="duration_minutes" value={formData.duration_minutes} onChange={handleChange} min={1} className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Start Time</label>
                <input type="datetime-local" name="start_time" value={formData.start_time} onChange={handleChange} required className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 [color-scheme:dark]" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">End Time</label>
              <input type="datetime-local" name="end_time" value={formData.end_time} onChange={handleChange} required className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 [color-scheme:dark]" />
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white">Select Questions</h2>
              <span className="text-sm font-bold text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full">{formData.question_ids.length} selected</span>
            </div>
            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {questions.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No questions in bank. <Link to="/questions/create" className="text-purple-400">Create some first.</Link></p>
              ) : questions.map((q) => {
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
              })}
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