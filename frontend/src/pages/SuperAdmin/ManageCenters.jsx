import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAllCenters, approveCenter, rejectCenter, suspendCenter } from '../../services/api'
import toast from 'react-hot-toast'
import { FiArrowLeft, FiCheck, FiX, FiEye } from 'react-icons/fi'

const ManageCenters = () => {
  const navigate = useNavigate()
  const [centers, setCenters] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const fetchCenters = () => {
    getAllCenters()
      .then(r => setCenters(r.data.data))
      .catch(() => toast.error('Failed to load centers'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchCenters() }, [])

  const handleApprove = async (id) => {
    try {
      await approveCenter(id)
      toast.success('Center approved!')
      fetchCenters()
    } catch {
      toast.error('Failed to approve center')
    }
  }

  const handleReject = async (id) => {
    if (!window.confirm('Reject this center application?')) return
    try {
      await rejectCenter(id)
      toast.success('Center rejected')
      fetchCenters()
    } catch {
      toast.error('Failed to reject center')
    }
  }

  const handleSuspend = async (id) => {
    if (!window.confirm('Suspend this center?')) return
    try {
      await suspendCenter(id)
      toast.success('Center suspended')
      fetchCenters()
    } catch {
      toast.error('Failed to suspend center')
    }
  }

  const statusColor = (s) => ({
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    inactive: 'bg-red-500/10 text-red-400 border-red-500/20',
  }[s] || 'bg-gray-500/10 text-gray-400')

  const filtered = filter === 'all' ? centers : centers.filter(c => c.status === filter)

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#030712]/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center gap-4">
          <Link to="/super-admin" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center"><FiArrowLeft /></div>
            <span className="text-sm">Dashboard</span>
          </Link>
          <h1 className="text-lg font-bold text-white">Manage Centers</h1>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-28 pb-20">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Coaching <span className="text-blue-400">Centers</span></h1>
            <p className="text-gray-400">Review and manage all coaching center applications</p>
          </div>
          <div className="flex gap-2">
            {['all', 'pending', 'active', 'inactive'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${filter === f ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
            <p className="text-gray-500 text-lg">No centers found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((center) => (
              <div key={center.coaching_center_id} className="bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl p-6 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-white">{center.center_name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColor(center.status)}`}>{center.status}</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400">
                      <span>📍 {center.location || 'N/A'}</span>
                      <span>📞 {center.contact_number || 'N/A'}</span>
                      <span>✉️ {center.email || 'N/A'}</span>
                      <span>📅 {center.created_at ? new Date(center.created_at).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button onClick={() => navigate(`/super-admin/centers/${center.coaching_center_id}`)} className="flex items-center gap-1 px-3 py-2 bg-white/5 text-gray-300 border border-white/10 rounded-xl text-sm hover:bg-white/10 transition-all">
                      <FiEye size={14} /> View
                    </button>
                    {center.status === 'pending' && (
                      <>
                        <button onClick={() => handleApprove(center.coaching_center_id)} className="flex items-center gap-1 px-3 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-sm hover:bg-emerald-500/20 transition-all">
                          <FiCheck size={14} /> Approve
                        </button>
                        <button onClick={() => handleReject(center.coaching_center_id)} className="flex items-center gap-1 px-3 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-sm hover:bg-red-500/20 transition-all">
                          <FiX size={14} /> Reject
                        </button>
                      </>
                    )}
                    {center.status === 'active' && (
                      <button onClick={() => handleSuspend(center.coaching_center_id)} className="flex items-center gap-1 px-3 py-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl text-sm hover:bg-amber-500/20 transition-all">
                        <FiX size={14} /> Suspend
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default ManageCenters