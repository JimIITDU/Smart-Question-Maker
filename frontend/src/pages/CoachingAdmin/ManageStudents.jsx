import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllBatches } from '../../services/api'
import toast from 'react-hot-toast'
import { FiArrowLeft, FiUsers, FiUserPlus } from 'react-icons/fi'

const ManageStudents = () => {
  const [batches, setBatches] = useState([])
  const [students, setStudents] = useState([])
  const [selectedBatch, setSelectedBatch] = useState('')
  const [loading, setLoading] = useState(true)
  const [enrollData, setEnrollData] = useState({ batch_id: '', user_id: '' })
  const [showEnrollForm, setShowEnrollForm] = useState(false)

  useEffect(() => {
    getAllBatches()
      .then(r => setBatches(r.data.data))
      .catch(() => toast.error('Failed to load batches'))
      .finally(() => setLoading(false))
  }, [])

  const fetchStudents = async (batchId) => {
    try {
      const res = await fetch(`https://smart-question-maker-backend.onrender.com/api/academic/batches/${batchId}/students`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await res.json()
      setStudents(data.data || [])
    } catch {
      toast.error('Failed to load students')
    }
  }

  const handleBatchSelect = (batchId) => {
    setSelectedBatch(batchId)
    if (batchId) fetchStudents(batchId)
    else setStudents([])
  }

  const handleEnroll = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('https://smart-question-maker-backend.onrender.com/api/academic/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(enrollData)
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Student enrolled!')
        setShowEnrollForm(false)
        if (selectedBatch) fetchStudents(selectedBatch)
      } else {
        toast.error(data.message || 'Failed to enroll')
      }
    } catch {
      toast.error('Failed to enroll student')
    }
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#030712]/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <Link to="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center"><FiArrowLeft /></div>
            <span className="text-sm">Dashboard</span>
          </Link>
          <button onClick={() => setShowEnrollForm(!showEnrollForm)} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all">
            <FiUserPlus /> {showEnrollForm ? 'Cancel' : 'Enroll Student'}
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-28 pb-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Manage <span className="text-emerald-400">Students</span></h1>
          <p className="text-gray-400">Enroll and manage students in batches</p>
        </div>

        {showEnrollForm && (
          <form onSubmit={handleEnroll} className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8 space-y-4">
            <h2 className="text-lg font-bold text-white">Enroll Student in Batch</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Select Batch</label>
                <select name="batch_id" value={enrollData.batch_id} onChange={(e) => setEnrollData({ ...enrollData, batch_id: e.target.value })} required className="w-full bg-[#0B1120] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500">
                  <option value="">Select Batch</option>
                  {batches.map(b => <option key={b.batch_id} value={b.batch_id}>{b.batch_name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Student User ID</label>
                <input type="number" value={enrollData.user_id} onChange={(e) => setEnrollData({ ...enrollData, user_id: e.target.value })} required placeholder="e.g. 10" className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500" />
              </div>
            </div>
            <button type="submit" className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:shadow-lg transition-all">Enroll Student</button>
          </form>
        )}

        <div className="mb-6">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Filter by Batch</label>
          <select value={selectedBatch} onChange={(e) => handleBatchSelect(e.target.value)} className="w-full md:w-64 bg-[#0B1120] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500">
            <option value="">All Batches</option>
            {batches.map(b => <option key={b.batch_id} value={b.batch_id}>{b.batch_name}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
          </div>
        ) : !selectedBatch ? (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
            <FiUsers className="text-4xl text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500">Select a batch to view enrolled students</p>
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
            <p className="text-gray-500">No students enrolled in this batch yet</p>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/5">
              <h2 className="text-lg font-bold text-white">Enrolled Students ({students.length})</h2>
            </div>
            <div className="divide-y divide-white/5">
              {students.map((student) => (
                <div key={student.user_id} className="flex items-center justify-between p-5 hover:bg-white/5 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center font-bold text-emerald-400">
                      {student.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-medium">{student.name}</p>
                      <p className="text-gray-500 text-sm">{student.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    {student.roll_number && <span className="bg-white/5 px-3 py-1 rounded-full font-mono">{student.roll_number}</span>}
                    <span className="text-gray-500">{student.phone}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default ManageStudents