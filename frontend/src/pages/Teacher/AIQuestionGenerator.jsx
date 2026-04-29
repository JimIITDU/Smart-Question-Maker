﻿﻿﻿import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { aiGenerate, bulkCreateQuestions } from '../../services/api'
import { FiArrowLeft, FiCpu, FiZap, FiSettings, FiBookOpen, FiTarget, FiZap as FiLightning } from 'react-icons/fi'

const AIQuestionGenerator = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState([])
  const [formData, setFormData] = useState({
    mode: 'random',
    topic: '',
    hints: '',
    subject_id: '',
    course_id: '',
    question_type: 'mcq',
    difficulty: 'medium',
    count: 5,
  })

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleGenerate = async (e) => {
    e.preventDefault()
    if (formData.mode === 'random' && !formData.topic) { toast.error('Please enter a topic'); return }
    if (formData.mode === 'guided' && (!formData.topic || !formData.hints)) { toast.error('Topic and hints required for guided mode'); return }
    if (formData.mode === 'zero-shot' && !formData.subject_id) { toast.error('Subject ID required for zero-shot mode'); return }
    setLoading(true)
    try {
      const data = await aiGenerate(formData)
      setGenerated(data.data)
      toast.success(`${data.data.length} questions generated!`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Generation failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAll = async () => {
    if (generated.length === 0) return
    try {
      await bulkCreateQuestions({ questions: generated })
      toast.success('Questions saved to bank!')
      setGenerated([])
      navigate('/teacher/questions')
    } catch (err) {
      toast.error('Save failed')
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
            <p className="text-gray-400 text-sm">{formData.mode === 'manual' ? 'Manual entry mode' : formData.mode === 'random' ? 'Pure AI based on topic' : formData.mode === 'guided' ? 'AI with teacher hints' : 'Subject-based zero-shot AI'}</p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Mode</label>
            <select name="mode" value={formData.mode} onChange={handleChange} className="w-full bg-[#0B1120] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500">
              <option value="manual">Manual (Create form)</option>
              <option value="random">Random (Topic-based)</option>
              <option value="guided">Guided (Hints/Structure)</option>
              <option value="zero-shot">Zero-Shot (Subject only)</option>
            </select>
          </div>

          {formData.mode === 'manual' && (
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <Link to="/teacher/create-question" className="w-full block text-center py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all">
                Open Manual Mode
              </Link>
            </div>
          )}

          {formData.mode !== 'manual' && (
            <>
              {(formData.mode === 'random' || formData.mode === 'guided') && (
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Topic / Prompt</label>
                  <textarea name="topic" value={formData.topic} onChange={handleChange} rows={3} placeholder="e.g. Newton's Laws of Motion" className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 resize-none" />
                </div>
              )}

              {formData.mode === 'guided' && (
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Hints / Structure</label>
                  <textarea name="hints" value={formData.hints} onChange={handleChange} rows={3} placeholder="e.g. Include diagram, multiple correct, focus on applications..." className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 resize-none" />
                </div>
              )}

              {formData.mode === 'zero-shot' && (
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Subject ID</label>
                    <input type="number" name="subject_id" value={formData.subject_id} onChange={handleChange} required placeholder="e.g. physics=1" className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500" />
                  </div>
                </div>
              )}

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
                  <input type="number" name="count" value={formData.count} onChange={handleChange} min="1" max="20" className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500" />
                </div>
              </div>
            </>
          )}

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
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded">{q.question_type || formData.question_type}</span>
                      <span className="text-xs bg-white/5 text-gray-400 px-2 py-0.5 rounded">{q.difficulty || formData.difficulty}</span>
                      {q.is_multiple_correct && (
                        <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">Multiple Correct</span>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-200 mb-3">{q.question_text}</p>
                  {q.option_text_a && (
                    <div className="grid grid-cols-2 gap-2">
                      {(() => {
                        const correctOpts = q.correct_option ? q.correct_option.split(',').map(o => o.trim().toUpperCase()) : [];
                        return ['a', 'b', 'c', 'd'].map(opt => q[`option_text_${opt}`] && (
                          <div key={opt} className={`text-xs p-2 rounded-lg border ${correctOpts.includes(opt.toUpperCase()) ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/5 border-white/5 text-gray-400'}`}>
                            <span className="font-bold uppercase mr-1">{opt}.</span>{q[`option_text_${opt}`]}
                            {correctOpts.includes(opt.toUpperCase()) && <span className="ml-1 text-emerald-300">✓</span>}
                          </div>
                        ));
                      })()}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSaveAll} className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-emerald-900/40 transition-all">
                Save All to Bank
              </button>
              <button onClick={() => setGenerated([])} className="px-6 py-3 bg-white/10 text-gray-400 border border-white/10 rounded-xl hover:bg-white/20 transition-all">
                Clear
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default AIQuestionGenerator
