import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getExamById, getExamQuestions, submitExam } from '../../services/api'

// --- Icons ---
const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
)

const CheckCircle = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
)

const SquareCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><polyline points="9 11 12 14 22 4"/></svg>
)

const TakeExam = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [exam, setExam] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [timeLeft, setTimeLeft] = useState(null)

  useEffect(() => {
    fetchExamData()
  }, [])

  useEffect(() => {
    if (timeLeft === null) return
    if (timeLeft <= 0) {
      handleSubmit(true) // auto submit when time runs out
      return
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
    return () => clearTimeout(timer)
  }, [timeLeft])

  const fetchExamData = async () => {
    try {
      const examRes = await getExamById(id)
      const questionsRes = await getExamQuestions(id)
      setExam(examRes.data.data)
      setQuestions(questionsRes.data.data)

      const endTime = new Date(examRes.data.data.end_time)
      const now = new Date()
      const diff = Math.floor((endTime - now) / 1000)
      setTimeLeft(diff > 0 ? diff : 0)
    } catch (err) {
      setError('Failed to load exam')
    } finally {
      setLoading(false)
    }
  }

  // Handle single answer (true_false, descriptive)
  const handleSingleAnswer = (question_id, value, type) => {
    setAnswers(prev => ({
      ...prev,
      [question_id]: {
        question_id,
        ...(type === 'true_false'
          ? { selected_option: value }
          : { descriptive_answer: value }),
      },
    }))
  }

  // Handle multiple MCQ selections
  const handleMCQAnswer = (question_id, option) => {
    setAnswers(prev => {
      const current = prev[question_id] || { question_id, selected_options: [] }
      const currentOptions = current.selected_options || []
      
      const newOptions = currentOptions.includes(option)
        ? currentOptions.filter(o => o !== option)
        : [...currentOptions, option]
      
      return {
        ...prev,
        [question_id]: {
          question_id,
          selected_options: newOptions,
        },
      }
    })
  }

  const handleSubmit = async (isAuto = false) => {
    const answeredCount = Object.keys(answers).length
    // Log to debug: console.log("Total Questions:", questions.length, "Answered:", answeredCount, "Answers:", answers);
    
    if (!isAuto && questions.length > answeredCount && !submitting) {
        if(!window.confirm(`You have only answered ${answeredCount} out of ${questions.length} questions. Are you sure you want to submit?`)) {
            return;
        }
    }

    setSubmitting(true)
    try {
      const answersArray = Object.values(answers)
      const res = await submitExam(id, { answers: answersArray })
      navigate(`/results/${id}`, {
        state: { summary: res.data.data }
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit exam')
      setSubmitting(false)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getDifficultyColor = (diff) => {
    switch(diff) {
      case 'easy': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      case 'medium': return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      case 'hard': return 'bg-rose-500/10 text-rose-400 border-rose-500/20'
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    }
  }

  // Check if a question has been answered
  const isQuestionAnswered = (q) => {
    const answer = answers[q.question_id]
    if (!answer) return false
    if (q.question_type === 'mcq') {
      return answer.selected_options && answer.selected_options.length > 0
    }
    if (q.question_type === 'true_false') {
      return !!answer.selected_option
    }
    if (q.question_type === 'descriptive') {
      return !!answer.descriptive_answer && answer.descriptive_answer.trim().length > 0
    }
    return false
  }

  const answeredCount = questions.filter(isQuestionAnswered).length

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0C15] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-gray-400">Initializing Exam Environment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0B0C15] pb-40 text-gray-200 font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* --- Sticky Exam Header --- */}
      <header className="sticky top-0 z-50 bg-[#0B0C15]/90 backdrop-blur-xl border-b border-white/5 shadow-lg">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
              {exam?.subject_name}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              {questions.length} Questions • <span className="text-indigo-400 font-medium">{answeredCount} Answered</span>
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-xl border font-mono text-lg font-bold tracking-wider flex items-center gap-2 ${
              timeLeft < 60 
                ? 'bg-red-500/10 border-red-500/50 text-red-500 animate-pulse' 
                : timeLeft < 300
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-white/5 border-white/10 text-white'
            }`}>
              <ClockIcon />
              {formatTime(timeLeft)}
            </div>
            <button
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="hidden md:flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:shadow-lg hover:shadow-indigo-500/20 transition-all disabled:opacity-50 active:scale-95"
            >
              {submitting ? 'Submitting...' : 'Submit Exam'}
            </button>
          </div>
        </div>
        {/* Progress Line */}
        <div className="w-full h-1 bg-white/5">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all duration-500"
            style={{ width: `${(answeredCount / questions.length) * 100}%` }}
          ></div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 pt-8">
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-8 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
            {error}
          </div>
        )}

        {/* Questions List */}
        <div className="space-y-8">
          {questions.map((q, index) => {
            const currentAnswer = answers[q.question_id]
            const isAnswered = isQuestionAnswered(q)
            
            return (
            <div
              key={q.question_id}
              className="relative bg-[#13151f] border border-white/5 rounded-2xl p-6 md:p-8 hover:border-white/10 transition-colors"
            >
              {/* Question Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <span className={`flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm border ${
                    isAnswered
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                  }`}>
                    {isAnswered ? <CheckCircle /> : index + 1}
                  </span>
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${getDifficultyColor(q.difficulty)}`}>
                    {q.difficulty}
                  </span>
                </div>
                <span className="text-gray-500 text-sm font-medium bg-white/5 px-2 py-1 rounded">
                  {q.max_marks} Mark{q.max_marks > 1 ? 's' : ''}
                </span>
              </div>

              {/* Question Text */}
              <h2 className="text-xl md:text-2xl font-medium text-white mb-8 leading-relaxed">
                {q.question_text}
              </h2>

              {/* MCQ Options - MULTI-SELECT SUPPORT */}
              {q.question_type === 'mcq' && (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500 mb-2">Select all that apply:</p>
                  {['A', 'B', 'C', 'D'].map((opt) => {
                    const optionText = q[`option_text_${opt.toLowerCase()}`]
                    if (!optionText) return null
                    const selectedOptions = currentAnswer?.selected_options || []
                    const isSelected = selectedOptions.includes(opt)
                    
                    return (
                      <label
                        key={opt}
                        onClick={(e) => {
                          e.preventDefault()
                          handleMCQAnswer(q.question_id, opt)
                        }}
                        className={`group relative flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-200 select-none ${
                          isSelected 
                            ? 'bg-indigo-600/10 border-indigo-500/50 shadow-[0_0_20px_-10px_rgba(99,102,241,0.3)]' 
                            : 'bg-[#0B0C15] border-white/5 hover:border-white/20 hover:bg-white/5 active:scale-[0.99]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          className="hidden" 
                        />
                        
                        <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors shrink-0 pointer-events-none ${
                          isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-gray-600 group-hover:border-gray-400'
                        }`}>
                          {isSelected && <span className="text-white text-xs">✓</span>}
                        </div>
                        <div className="flex-1 pointer-events-none">
                          <span className="text-xs font-bold text-gray-500 mb-0.5 block">Option {opt}</span>
                          <span className={`text-base font-medium ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                            {optionText}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="absolute right-4 text-indigo-400 pointer-events-none">
                             <SquareCheck />
                          </div>
                        )}
                      </label>
                    )
                  })}
                  {currentAnswer?.selected_options?.length > 0 && (
                    <p className="text-xs text-indigo-400 mt-1">
                      Selected: {currentAnswer.selected_options.sort().join(', ')}
                    </p>
                  )}

                </div>
              )}

              {/* True/False Options */}
              {q.question_type === 'true_false' && (
                <div className="grid grid-cols-2 gap-4">
                  {['True', 'False'].map((opt) => {
                    const isSelected = currentAnswer?.selected_option === opt
                    return (
                      <label
                        key={opt}
                        onClick={(e) => {
                            e.preventDefault()
                            handleSingleAnswer(q.question_id, opt, 'true_false')
                        }}
                        className={`relative group flex items-center justify-center gap-3 p-6 rounded-xl border cursor-pointer transition-all duration-200 select-none ${
                          isSelected 
                            ? 'bg-indigo-600/10 border-indigo-500/50 text-white' 
                            : 'bg-[#0B0C15] border-white/5 hover:border-white/20 hover:bg-white/5 text-gray-400 active:scale-[0.99]'
                        }`}
                      >
                         <input
                          type="radio"
                          name={`question_${q.question_id}`}
                          value={opt}
                          checked={isSelected}
                          className="hidden"
                        />
                        <span className="text-lg font-bold pointer-events-none">{opt}</span>
                        {isSelected && <CheckCircle className="w-5 h-5 text-indigo-400 pointer-events-none" />}
                      </label>
                    )
                  })}
                </div>
              )}

              {/* Descriptive Input */}
              {q.question_type === 'descriptive' && (
                <div className="relative group">
                  <textarea
                    rows={8}
                    placeholder="Type your detailed answer here..."
                    value={currentAnswer?.descriptive_answer || ''}
                    onChange={(e) =>
                      handleSingleAnswer(q.question_id, e.target.value, 'descriptive')
                    }
                    className="w-full bg-[#0B0C15] border border-white/10 rounded-xl p-4 text-gray-300 focus:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all resize-none"
                  ></textarea>
                </div>
              )}

            </div>
          )})}
        </div>

        {/* Mobile Submit Button (Sticky Bottom) */}
        <div className="md:hidden fixed bottom-0 left-0 w-full p-4 bg-[#0B0C15]/90 backdrop-blur-xl border-t border-white/5 z-40">
          <button
            onClick={() => handleSubmit(false)}
            disabled={submitting}
            className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-900/40 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          >
            {submitting ? 'Submitting...' : 'Submit Exam'}
          </button>
        </div>

      </div>
    </div>
  )
}

export default TakeExam
