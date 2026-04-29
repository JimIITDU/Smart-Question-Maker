import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllBatches, createBatch, getAllCourses } from '../../services/api'
import toast from 'react-hot-toast'
import { FiArrowLeft, FiPlus, FiTrash2, FiUsers } from 'react-icons/fi'

const ManageBatches = () => {
  const [batches, setBatches] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    course_id: '',
    batch_name: '',
    batch_code: '',
    start_date: '',
    end_date: '',
    batch_type: 'regular',
    class_shift: 'morning',
    max_students: 30,
  })

  const fetchData = () => {
    Promise.all([getAllBatches(), getAllCourses()])
      .then(([b, c]) => { setBatches(b.data.data); setCourses(c.data.data) })
      .catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await createBatch(formData)
      toast.success('Batch created!')
      setShowForm(false)
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create batch')
    }
  }

  const statusColor = (s) => ({
    upcoming: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    running: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    completed: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
  }[s] || 'bg-gray-500/10 text-gray-400')

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#030712]/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <Link to="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center"><FiArrowLeft /></div>
            <span className="text-sm">Dashboard</span>
          </Link>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all">
            <FiPlus /> {showForm ? 'Cancel' : 'Add Batch'}
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-28 pb-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Manage <span className="text-purple-400">Batches</span></h1>
          <p className="text-gray-400">Create and manage student batches</p>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8 space-y-4">
            <h2 className="text-lg font-bold text-white">Create New Batch</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Course</label>
                <select name="course_id" value={formData.course_id} onChange={handleChange} required className="w-full bg-[#0B1120] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500">
                  <option value="">Select Course</option>
                  {courses.map(c => <option key={c.course_id} value={c.course_id}>{c.course_title}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Batch Name</label>
                <input type="text" name="batch_name" value={formData.batch_name} onChange={handleChange} required placeholder="e.g. Batch A 2024" className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Batch Code</label>
                <input type="text" name="batch_code" value={formData.batch_code} onChange={handleChange} placeholder="e.g. BA2024" className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Max Students</label>
                <input type="number" name="max_students" value={formData.max_students} onChange={handleChange} min={1} className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Type</label>
                <select name="batch_type" value={formData.batch_type} onChange={handleChange} className="w-full bg-[#0B1120] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500">
                  <option value="regular">Regular</option>
                  <option value="crash">Crash</option>
                  <option value="weekend">Weekend</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Shift</label>
                <select name="class_shift" value={formData.class_shift} onChange={handleChange} className="w-full bg-[#0B1120] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500">
                  <option value="morning">Morning</option>
                  <option value="day">Day</option>
                  <option value="evening">Evening</option>
                  <option value="night">Night</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Start Date</label>
                <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 [color-scheme:dark]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">End Date</label>
                <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 [color-scheme:dark]" />
              </div>
            </div>
            <button type="submit" className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg transition-all">Create Batch</button>
          </form>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          </div>
        ) : batches.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
            <p className="text-gray-500 text-lg mb-2">No batches yet</p>
            <button onClick={() => setShowForm(true)} className="text-purple-400 hover:text-purple-300 font-medium">Create your first batch</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {batches.map((batch) => (
              <div key={batch.batch_id} className="bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl p-6 transition-all">
                <div className="flex justify-between items-start mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColor(batch.status)}`}>{batch.status}</span>
                  <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">{batch.batch_type}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{batch.batch_name}</h3>
                <p className="text-indigo-400 text-sm mb-3">{batch.course_title}</p>
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                  <FiUsers size={14} />
                  <span>{batch.current_students || 0} / {batch.max_students} students</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5 mb-4">
                  <div className="bg-purple-500 h-1.5 rounded-full transition-all" style={{ width: `${batch.max_students > 0 ? ((batch.current_students || 0) / batch.max_students) * 100 : 0}%` }}></div>
                </div>
                <Link to={`/coaching-admin/students`} className="w-full flex items-center justify-center gap-2 py-2 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl text-sm font-semibold hover:bg-purple-500/20 transition-all">
                  <FiUsers size={14} /> Manage Students
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default ManageBatches