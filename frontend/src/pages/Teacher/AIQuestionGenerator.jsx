import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FiArrowLeft, FiCpu, FiZap } from 'react-icons/fi'

const AIQuestionGenerator = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState([])
  const [formData, setFormData] = useState({
    topic: '',
    subject_id: '',
    course_id: '',
    question_type: 'mcq',
    difficulty: 'medium',
    count: 5,
  })

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleGenerate = async (e) => {
    e.preventDefault()
    if (!formData.topic) { toast.error('Please enter a topic'); return }
    setLoading(true)
    try {
      const res = await fetch('https://smart-question-maker-backend.onrender.com/api/questions/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (data.data) {
        setGenerated(data.data)
        toast.success(`${data.data.length} questions generated!`)
      } else {
        toast.error(data.message || 'Generation failed')
      }
    } catch {
      toast.error('AI service unavailable')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#030712]/70 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center gap-4">
          <Link to="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center"><FiArrowLeft /></div>
            <span className="text-sm">Question Bank</span>
          </Link>
          <h1 className="text-lg font-bold text-white">AI Question Generator</h1>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-28 pb-20 space-y-6">
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
            <FiCpu className="text-white text-xl" />
          </div>
          <div>
            <h2 className="text-white font-bold">AI-Powered Question Generation</h2>
            <p className="text-gray-400 text-sm">Enter a topic and let AI generate questions for you automatically</p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Topic / Prompt</label>
            <textarea name="topic" value={formData.topic} onChange={handleChange} required rows={3} placeholder="e.g. Newton's Laws of Motion, Photosynthesis, World War II causes..." className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Subject ID</label>
              <input type="number" name="subject_id" value={formData.subject_id} onChange={handleChange} required placeholder="e.g. 1" className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Course ID</label>
              <input type="number" name="course_id" value={formData.course_id} onChange={handleChange} required placeholder="e.g. 1" className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Type</label>
              <select name="question_type" value={formData.question_type} onChange={handleChange} className="w-full bg-[#0B1120] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500">
                <option value="mcq">MCQ</option>
                <option value="descriptive">Descriptive</option>
                <option value="true_false">True/False</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Difficulty</label>
              <select name="difficulty" value={formData.difficulty} onChange={handleChange} className="w-full bg-[#0B1120] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Count</label>
              <input type="number" name="count" value={formData.count} onChange={handleChange} min={1} max={20} className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-purple-900/40 transition-all disabled:opacity-50">
            {loading ? (
              <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Generating...</>
            ) : (
              <><FiZap /> Generate Questions</>
            )}
          </button>
        </form>

        {generated.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Generated Questions ({generated.length})</h2>
              <button onClick={() => { setGenerated([]); toast.success('Cleared!') }} className="text-sm text-gray-500 hover:text-white transition-colors">Clear</button>
            </div>
            <div className="space-y-4">
              {generated.map((q, i) => (
                <div key={i} className="bg-white/5 border border-white/5 rounded-xl p-5">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-gray-500 font-mono text-sm">#{i + 1}</span>
                    <div className="flex gap-2">
                      <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded">{q.question_type || formData.question_type}</span>
                      <span className="text-xs bg-white/5 text-gray-400 px-2 py-0.5 rounded">{q.difficulty || formData.difficulty}</span>
                    </div>
                  </div>
                  <p className="text-gray-200 mb-3">{q.question_text}</p>
                  {q.option_text_a && (
                    <div className="grid grid-cols-2 gap-2">
                      {['a', 'b', 'c', 'd'].map(opt => q[`option_text_${opt}`] && (
                        <div key={opt} className={`text-xs p-2 rounded-lg border ${q.correct_option === opt.toUpperCase() ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/5 border-white/5 text-gray-400'}`}>
                          <span className="font-bold uppercase mr-1">{opt}.</span>{q[`option_text_${opt}`]}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button onClick={() => navigate('/questions')} className="w-full mt-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:shadow-lg transition-all">
              Save All to Question Bank
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default AIQuestionGenerator