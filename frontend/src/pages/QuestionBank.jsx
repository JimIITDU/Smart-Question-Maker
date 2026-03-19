import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllQuestions, createQuestion, deleteQuestion } from '../services/api'
import { useAuth } from '../context/AuthContext.jsx'

const QuestionBank = () => {
  const { user } = useAuth()
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
      setSuccess('Question created successfully!')
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
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await deleteQuestion(id)
        setSuccess('Question deleted successfully!')
        fetchQuestions()
      } catch (err) {
        setError('Failed to delete question')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="bg-indigo-600 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-white text-indigo-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
            SQ
          </div>
          <span className="font-bold text-lg">Smart Question Maker</span>
        </div>
        <Link
          to="/dashboard"
          className="bg-white text-indigo-600 px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-indigo-50 transition"
        >
          ← Dashboard
        </Link>
      </nav>

      <div className="max-w-6xl mx-auto p-6">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Question Bank
          </h1>
          {(user?.role_id === 2 || user?.role_id === 3) && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              {showForm ? 'Cancel' : '+ Add Question'}
            </button>
          )}
        </div>

        {/* Success/Error messages */}
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 text-green-600 px-4 py-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        {/* Create Question Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Create New Question
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject ID
                  </label>
                  <input
                    type="number"
                    name="subject_id"
                    value={formData.subject_id}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course ID
                  </label>
                  <input
                    type="number"
                    name="course_id"
                    value={formData.course_id}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question Text
                </label>
                <textarea
                  name="question_text"
                  value={formData.question_text}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question Type
                  </label>
                  <select
                    name="question_type"
                    value={formData.question_type}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="mcq">MCQ</option>
                    <option value="descriptive">Descriptive</option>
                    <option value="true_false">True/False</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty
                  </label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Marks
                  </label>
                  <input
                    type="number"
                    name="max_marks"
                    value={formData.max_marks}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* MCQ Options */}
              {formData.question_type === 'mcq' && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Options
                  </label>
                  {['a', 'b', 'c', 'd'].map((opt) => (
                    <div key={opt} className="flex items-center gap-2">
                      <span className="font-bold text-indigo-600 uppercase w-6">
                        {opt}
                      </span>
                      <input
                        type="text"
                        name={`option_text_${opt}`}
                        value={formData[`option_text_${opt}`]}
                        onChange={handleChange}
                        placeholder={`Option ${opt.toUpperCase()}`}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Correct Option
                    </label>
                    <select
                      name="correct_option"
                      value={formData.correct_option}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Descriptive answer */}
              {formData.question_type === 'descriptive' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Answer
                  </label>
                  <textarea
                    name="expected_answer"
                    value={formData.expected_answer}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                Create Question
              </button>
            </form>
          </div>
        )}

        {/* Questions List */}
        {loading ? (
          <div className="text-center py-10 text-gray-500">
            Loading questions...
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No questions found. Create your first question!
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q) => (
              <div
                key={q.question_id}
                className="bg-white rounded-2xl shadow p-6"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        q.difficulty === 'easy'
                          ? 'bg-green-100 text-green-600'
                          : q.difficulty === 'medium'
                          ? 'bg-yellow-100 text-yellow-600'
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {q.difficulty}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-600">
                        {q.question_type}
                      </span>
                      <span className="text-xs text-gray-500">
                        {q.max_marks} mark(s)
                      </span>
                    </div>
                    <p className="text-gray-800 font-medium">
                      {q.question_text}
                    </p>
                    {q.question_type === 'mcq' && (
                      <div className="mt-2 grid grid-cols-2 gap-1">
                        {['a', 'b', 'c', 'd'].map((opt) => (
                          q[`option_text_${opt}`] && (
                            <p
                              key={opt}
                              className={`text-sm px-2 py-1 rounded ${
                                q.correct_option === opt.toUpperCase()
                                  ? 'bg-green-50 text-green-700 font-semibold'
                                  : 'text-gray-600'
                              }`}
                            >
                              {opt.toUpperCase()}. {q[`option_text_${opt}`]}
                            </p>
                          )
                        ))}
                      </div>
                    )}
                  </div>
                  {(user?.role_id === 2 || user?.role_id === 3) && (
                    <button
                      onClick={() => handleDelete(q.question_id)}
                      className="ml-4 text-red-500 hover:text-red-700 font-semibold text-sm"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default QuestionBank