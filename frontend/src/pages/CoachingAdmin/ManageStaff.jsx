import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FiArrowLeft, FiUserPlus } from 'react-icons/fi'

const ManageStaff = () => {
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' })

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('https://smart-question-maker-backend.onrender.com/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ ...formData, role_id: 4 })
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Staff account created!')
        setShowForm(false)
        setFormData({ name: '', email: '', password: '', phone: '' })
      } else {
        toast.error(data.message || 'Failed to create staff')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#030712]/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <Link to="/admin" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center"><FiArrowLeft /></div>
            <span className="text-sm">Dashboard</span>
          </Link>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all">
            <FiUserPlus /> {showForm ? 'Cancel' : 'Add Staff'}
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-28 pb-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Manage <span className="text-rose-400">Staff</span></h1>
          <p className="text-gray-400">Create and manage staff accounts</p>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8 space-y-4">
            <h2 className="text-lg font-bold text-white">Create Staff Account</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Staff's full name" className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-rose-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="staff@example.com" className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-rose-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="••••••••" className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-rose-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Phone</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="01700000000" className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-rose-500" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50">
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Create Staff Account'}
            </button>
          </form>
        )}

        <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
          <FiUserPlus className="text-4xl text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">Staff list coming soon</p>
          <p className="text-gray-600 text-sm">Use the button above to add staff accounts</p>
        </div>
      </main>
    </div>
  )
}

export default ManageStaff