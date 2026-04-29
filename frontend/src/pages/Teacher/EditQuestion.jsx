﻿import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getQuestionById, API } from '../../services/api'

import toast from 'react-hot-toast'
import { FiArrowLeft, FiSave, FiCheckSquare } from 'react-icons/fi'

const EditQuestion = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [formData, setFormData] = useState({
    question_text: '',
    question_type: 'mcq',
    difficulty: 'easy',
    max_marks: 1,
    option_text_a: '',
    option_text_b: '',
    option_text_c: '',
    option_text_d: '',
    correct_option: '',
    expected_answer: '',
  })

  // Track multiple correct options as array
  const [selectedCorrectOptions, setSelectedCorrectOptions] = useState([])

  useEffect(() => {
    getQuestionById(id)
      .then((res) => {
        const q = res.data.data
        if (!q) {
          toast.error('Question not found')
          return
        }
        setFormData(q)
        // Parse comma-separated correct_option into array
        if (q.correct_option) {
          const options = q.correct_option.split(',').map((opt) => opt.trim().toUpperCase())
          setSelectedCorrectOptions(options)
        }
      })
      .catch((err) => {
        const msg = err.response?.data?.message || err.message || 'Failed to load question'
        console.error('Error loading question:', err)
        toast.error(msg)
      })
      .finally(() => setFetching(false))
  }, [id])


  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  // Handle multiple correct option selection
  const toggleCorrectOption = (opt) => {
    setSelectedCorrectOptions((prev) => {
      const newSelection = prev.includes(opt)
        ? prev.filter((o) => o !== opt)
        : [...prev, opt]
      
      // Update formData with comma-separated string
      setFormData((fd) => ({
        ...fd,
        correct_option: newSelection.sort().join(','),
      }))
      
      return newSelection
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await API.put(`/questions/${id}`, formData)
      toast.success('Question updated!')

      navigate('/questions')
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update question'
      console.error('Error updating question:', err)
      toast.error(msg)

    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <div className="min-h-screen bg-[#030712] flex items-center justify-center"><div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div></div>

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#030712]/70 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center gap-4">
          <Link to="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center"><FiArrowLeft /></div>
            <span className="text-sm">Question Bank</span>
          </Link>
          <h1 className="text-lg font-bold text-white">Edit Question</h1>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-28 pb-20">
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Question Text</label>
            <textarea name="question_text" value={formData.question_text} onChange={handleChange} required rows={4} className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 resize-none" />
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
                    <input type="text" name={`option_text_${opt}`} value={formData[`option_text_${opt}`] || ''} onChange={handleChange} className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:border-blue-500 text-sm" />
                  </div>
                ))}
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                  Correct Option(s) <span className="text-blue-400 normal-case font-normal">- Select all that apply</span>
                </label>
                <div className="flex gap-2">
                  {['A', 'B', 'C', 'D'].map((opt) => (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => toggleCorrectOption(opt)}
                      className={`flex-1 py-2 rounded-xl font-bold border transition-all flex items-center justify-center gap-2 ${
                        selectedCorrectOptions.includes(opt)
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {selectedCorrectOptions.includes(opt) && <FiCheckSquare className="text-sm" />}
                      {opt}
                    </button>
                  ))}
                </div>
                {selectedCorrectOptions.length > 1 && (
                  <p className="text-xs text-emerald-400 mt-2">
                    Multiple correct answers selected: {selectedCorrectOptions.sort().join(', ')}
                  </p>
                )}
              </div>
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

          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50">
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><FiSave /> Update Question</>}
          </button>
        </form>
      </main>
    </div>
  )
}

export default EditQuestion
