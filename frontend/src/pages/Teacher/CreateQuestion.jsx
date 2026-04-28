import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createQuestion } from '../services/api'
import toast from 'react-hot-toast'
import { FiArrowLeft, FiSave } from 'react-icons/fi'

const CreateQuestion = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
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
    source: 'manual',
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await createQuestion(formData)
      toast.success('Question created successfully!')
      navigate('/questions')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create question')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#030712]/70 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center gap-4">
          <Link to="/questions" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center"><FiArrowLeft /></div>
            <span className="text-sm">Question Bank</span>
          </Link>
          <h1 className="text-lg font-bold text-white">Create Question</h1>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-28 pb-20">
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Subject ID</label>
              <input type="number" name="subject_id" value={formData.subject_id} onChange={handleChange} required placeholder="e.g. 1" className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Course ID</label>
              <input type="number" name="course_id" value={formData.course_id} onChange={handleChange} required placeholder="e.g. 1" className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Question Text</label>
            <textarea name="question_text" value={formData.question_text} onChange={handleChange} required rows={4} placeholder="Enter your question here..." className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none" />
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Type</label>
              <select name="question_type" value={formData.question_type} onChange={handleChange} className="w-full bg-[#0B1120] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500">
                <option value="mcq">MCQ</option>
                <option value="descriptive">Descriptive</option>
                <option value="true_false">True/False</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Difficulty</label>
              <select name="difficulty" value={formData.difficulty} onChange={handleChange} className="w-full bg-[#0B1120] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Max Marks</label>
              <input type="number" name="max_marks" value={formData.max_marks} onChange={handleChange} min={1} className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500" />
            </div>
          </div>

          {formData.question_type === 'mcq' && (
            <div className="bg-white/5 rounded-xl p-6 space-y-4">
              <label className="text-sm font-semibold text-gray-300">Answer Options</label>
              <div className="grid grid-cols-2 gap-4">
                {['a', 'b', 'c', 'd'].map((opt) => (
                  <div key={opt} className="relative">
                    <span className="absolute left-3 top-3 font-bold text-blue-400 uppercase text-sm">{opt}</span>
                    <input type="text" name={`option_text_${opt}`} value={formData[`option_text_${opt}`]} onChange={handleChange} placeholder={`Option ${opt.toUpperCase()}`} className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:border-blue-500 text-sm" />
                  </div>
                ))}
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Correct Option</label>
                <div className="flex gap-2">
                  {['A', 'B', 'C', 'D'].map((opt) => (
                    <button type="button" key={opt} onClick={() => setFormData({ ...formData, correct_option: opt })} className={`flex-1 py-2 rounded-xl font-bold border transition-all ${formData.correct_option === opt ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {formData.question_type === 'descriptive' && (
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Expected Answer (Reference)</label>
              <textarea name="expected_answer" value={formData.expected_answer} onChange={handleChange} rows={3} placeholder="Reference answer for evaluation..." className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 resize-none" />
            </div>
          )}

          {formData.question_type === 'true_false' && (
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Correct Answer</label>
              <div className="flex gap-4">
                {['True', 'False'].map((opt) => (
                  <button type="button" key={opt} onClick={() => setFormData({ ...formData, correct_option: opt })} className={`flex-1 py-3 rounded-xl font-bold border transition-all ${formData.correct_option === opt ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-gray-400'}`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-blue-900/40 transition-all disabled:opacity-50">
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><FiSave /> Save Question</>}
          </button>
        </form>
      </main>
    </div>
  )
}

export default CreateQuestion