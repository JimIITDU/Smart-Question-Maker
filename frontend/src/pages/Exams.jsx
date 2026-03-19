import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAllExams, createExam, startExam, getAllQuestions } from '../services/api'
import { useAuth } from '../context/AuthContext.jsx'

const Exams = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [exams, setExams] = useState([])
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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
      setError('Failed to load exams')
    } finally {
      setLoading(false)
    }
  }

  const fetchQuestions = async () => {
    try {
      const res = await getAllQuestions()
      setQuestions(res.data.data)
    } catch (err) {}
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
    e.preventDefault()
    setError('')
    try {
      await createExam(formData)
      setSuccess('Exam created successfully!')
      setShowForm(false)
      fetchExams()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create exam')
    }
  }

  const handleStartExam = async (id) => {
    try {
      await startExam(id)
      setSuccess('Exam started!')
      fetchExams()
    } catch (err) {
      setError('Failed to start exam')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-yellow-100 text-yellow-600'
      case 'ongoing': return 'bg-green-100 text-green-600'
      case 'completed': return 'bg-gray-100 text-gray-600'
      default: return 'bg-gray-100 text-gray-600'
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
          <h1 className="text-2xl font-bold text-gray-800">Exams</h1>
          {(user?.role_id === 2 || user?.role_id === 3) && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              {showForm ? 'Cancel' : '+ Create Exam'}
            </button>
          )}
        </div>

        {/* Messages */}
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

        {/* Create Exam Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Create New Exam
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
                    Batch ID
                  </label>
                  <input
                    type="number"
                    name="batch_id"
                    value={formData.batch_id}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Exam Type
                  </label>
                  <select
                    name="exam_type"
                    value={formData.exam_type}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="regular">Regular</option>
                    <option value="live_quiz">Live Quiz</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="datetime-local"
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Select Questions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Questions ({formData.question_ids.length} selected)
                </label>
                <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                  {questions.map((q) => (
                    <div
                      key={q.question_id}
                      className={`p-2 rounded-lg cursor-pointer flex items-center gap-2 ${
                        formData.question_ids.includes(q.question_id)
                          ? 'bg-indigo-50 border border-indigo-300'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleQuestionSelect(q.question_id)}
                    >
                      <input
                        type="checkbox"
                        checked={formData.question_ids.includes(q.question_id)}
                        onChange={() => {}}
                        className="accent-indigo-600"
                      />
                      <span className="text-sm text-gray-700">
                        {q.question_text.substring(0, 60)}...
                      </span>
                      <span className={`ml-auto px-2 py-0.5 rounded-full text-xs ${
                        q.difficulty === 'easy'
                          ? 'bg-green-100 text-green-600'
                          : q.difficulty === 'medium'
                          ? 'bg-yellow-100 text-yellow-600'
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {q.difficulty}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                Create Exam
              </button>
            </form>
          </div>
        )}

        {/* Exams List */}
        {loading ? (
          <div className="text-center py-10 text-gray-500">
            Loading exams...
          </div>
        ) : exams.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No exams found.
          </div>
        ) : (
          <div className="space-y-4">
            {exams.map((exam) => (
              <div
                key={exam.exam_id}
                className="bg-white rounded-2xl shadow p-6"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(exam.status)}`}>
                        {exam.status}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-600">
                        {exam.exam_type}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-800">
                      {exam.subject_name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Batch: {exam.batch_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Start: {new Date(exam.start_time).toLocaleString()}
                    </p>
                    {exam.access_code && (
                      <p className="text-sm font-semibold text-indigo-600 mt-1">
                        Access Code: {exam.access_code}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    {(user?.role_id === 2 || user?.role_id === 3) &&
                      exam.status === 'scheduled' && (
                        <button
                          onClick={() => handleStartExam(exam.exam_id)}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-600 transition"
                        >
                          Start Exam
                        </button>
                      )}
                    {user?.role_id === 5 &&
                      exam.status === 'ongoing' && (
                        <button
                          onClick={() => navigate(`/exams/${exam.exam_id}/take`)}
                          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
                        >
                          Take Exam
                        </button>
                      )}
                    <Link
                      to={`/results/${exam.exam_id}`}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition text-center"
                    >
                      View Results
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Exams