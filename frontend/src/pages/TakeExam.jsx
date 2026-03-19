import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getExamById, getExamQuestions, submitExam } from '../services/api'

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
      handleSubmit()
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

      // Calculate time left
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

  const handleAnswer = (question_id, value, type) => {
    setAnswers({
      ...answers,
      [question_id]: {
        question_id,
        ...(type === 'mcq'
          ? { selected_option: value }
          : { descriptive_answer: value }),
      },
    })
  }

  const handleSubmit = async () => {
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
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl font-semibold">Loading exam...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Exam header */}
      <div className="bg-indigo-600 text-white px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-md">
        <div>
          <h1 className="font-bold text-lg">
            {exam?.subject_name}
          </h1>
          <p className="text-indigo-200 text-sm">
            {questions.length} questions
          </p>
        </div>
        <div className="flex items-center gap-4">
          {timeLeft !== null && (
            <div className={`font-bold text-lg ${timeLeft < 300 ? 'text-red-300' : 'text-white'}`}>
              ⏱ {formatTime(timeLeft)}
            </div>
          )}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-indigo-50 transition disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Exam'}
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-6">

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Questions */}
        <div className="space-y-6">
          {questions.map((q, index) => (
            <div
              key={q.question_id}
              className="bg-white rounded-2xl shadow p-6"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-indigo-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  q.difficulty === 'easy'
                    ? 'bg-green-100 text-green-600'
                    : q.difficulty === 'medium'
                    ? 'bg-yellow-100 text-yellow-600'
                    : 'bg-red-100 text-red-600'
                }`}>
                  {q.difficulty}
                </span>
                <span className="text-xs text-gray-500 ml-auto">
                  {q.max_marks} mark(s)
                </span>
              </div>

              <p className="text-gray-800 font-medium mb-4">
                {q.question_text}
              </p>

              {/* MCQ Options */}
              {q.question_type === 'mcq' && (
                <div className="space-y-2">
                  {['A', 'B', 'C', 'D'].map((opt) => (
                    q[`option_text_${opt.toLowerCase()}`] && (
                      <label
                        key={opt}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition ${
                          answers[q.question_id]?.selected_option === opt
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question_${q.question_id}`}
                          value={opt}
                          checked={answers[q.question_id]?.selected_option === opt}
                          onChange={() => handleAnswer(q.question_id, opt, 'mcq')}
                          className="accent-indigo-600"
                        />
                        <span className="font-semibold text-indigo-600">
                          {opt}.
                        </span>
                        <span className="text-gray-700">
                          {q[`option_text_${opt.toLowerCase()}`]}
                        </span>
                      </label>
                    )
                  ))}
                </div>
              )}

              {/* Descriptive */}
              {q.question_type === 'descriptive' && (
                <textarea
                  rows={4}
                  placeholder="Write your answer here..."
                  value={answers[q.question_id]?.descriptive_answer || ''}
                  onChange={(e) =>
                    handleAnswer(q.question_id, e.target.value, 'descriptive')
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              )}

              {/* True/False */}
              {q.question_type === 'true_false' && (
                <div className="flex gap-4">
                  {['True', 'False'].map((opt) => (
                    <label
                      key={opt}
                      className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer border flex-1 justify-center transition ${
                        answers[q.question_id]?.selected_option === opt
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question_${q.question_id}`}
                        value={opt}
                        checked={answers[q.question_id]?.selected_option === opt}
                        onChange={() => handleAnswer(q.question_id, opt, 'mcq')}
                        className="accent-indigo-600"
                      />
                      <span className="font-semibold text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Submit button at bottom */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit Exam'}
        </button>
      </div>
    </div>
  )
}

export default TakeExam