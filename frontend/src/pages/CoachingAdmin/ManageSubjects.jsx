import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllSubjects, createSubject, getAllCourses } from '../services/api'
import toast from 'react-hot-toast'
import { FiArrowLeft, FiPlus, FiTrash2, FiBook } from 'react-icons/fi'

const ManageSubjects = () => {
  const [subjects, setSubjects] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ course_id: '', subject_name: '', subject_code: '', teacher_user_id: '' })

  const fetchData = () => {
    Promise.all([getAllSubjects(), getAllCourses()])
      .then(([s, c]) => { setSubjects(s.data.data); setCourses(c.data.data) })
      .catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await createSubject(formData)
      toast.success('Subject created!')
      setShowForm(false)
      setFormData({ course_id: '', subject_name: '', subject_code: '', teacher_user_id: '' })
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create subject')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this subject?')) return
    try {
      await fetch(`https://smart-question-maker-backend.onrender.com/api/academic/subjects/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      toast.success('Subject deleted!')
      fetchData()
    } catch {
      toast.error('Failed to delete subject')
    }
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#030712]/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <Link to="/admin" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center"><FiArrowLeft /></div>
            <span className="text-sm">Dashboard</span>
          </Link>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all">
            <FiPlus /> {showForm ? 'Cancel' : 'Add Subject'}
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-28 pb-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Manage <span className="text-violet-400">Subjects</span></h1>
          <p className="text-gray-400">Create and assign subjects to courses</p>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8 space-y-4">
            <h2 className="text-lg font-bold text-white">Create New Subject</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Course</label>
                <select name="course_id" value={formData.course_id} onChange={handleChange} required className="w-full bg-[#0B1120] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-violet-500">
                  <option value="">Select Course</option>
                  {courses.map(c => <option key={c.course_id} value={c.course_id}>{c.course_title}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Subject Name</label>
                <input type="text" name="subject_name" value={formData.subject_name} onChange={handleChange} required placeholder="e.g. Physics" className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Subject Code</label>
                <input type="text" name="subject_code" value={formData.subject_code} onChange={handleChange} placeholder="e.g. PHY101" className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Teacher User ID</label>
                <input type="number" name="teacher_user_id" value={formData.teacher_user_id} onChange={handleChange} placeholder="e.g. 5" className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-violet-500" />
              </div>
            </div>
            <button type="submit" className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all">Create Subject</button>
          </form>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
          </div>
        ) : subjects.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
            <FiBook className="text-4xl text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">No subjects yet</p>
            <button onClick={() => setShowForm(true)} className="text-violet-400 hover:text-violet-300 font-medium">Create your first subject</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {subjects.map((subject) => (
              <div key={subject.subject_id} className="bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl p-6 transition-all">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center mb-4">
                  <FiBook className="text-violet-400 text-lg" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{subject.subject_name}</h3>
                <p className="text-violet-400 text-sm mb-1">{subject.course_title}</p>
                {subject.subject_code && <p className="text-gray-500 text-xs mb-4 font-mono">{subject.subject_code}</p>}
                <button onClick={() => handleDelete(subject.subject_id)} className="w-full flex items-center justify-center gap-2 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-sm font-semibold hover:bg-red-500/20 transition-all">
                  <FiTrash2 size={14} /> Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default ManageSubjects