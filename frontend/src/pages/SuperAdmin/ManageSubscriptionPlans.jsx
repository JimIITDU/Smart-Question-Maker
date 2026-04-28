import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FiArrowLeft, FiPlus, FiEdit, FiTrash2, FiCheck } from 'react-icons/fi'

const ManageSubscriptionPlans = () => {
  const [plans, setPlans] = useState([
    { id: 1, name: 'Free', price: 0, features: ['50 students', '5 courses', 'Basic exams'], active: true },
    { id: 2, name: 'Basic', price: 999, features: ['200 students', '20 courses', 'AI questions (50/mo)'], active: true },
    { id: 3, name: 'Pro', price: 2999, features: ['Unlimited students', 'Unlimited courses', 'AI unlimited'], active: true },
  ])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', price: '', features: '' })

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    const newPlan = {
      id: plans.length + 1,
      name: formData.name,
      price: parseInt(formData.price),
      features: formData.features.split(',').map(f => f.trim()),
      active: true,
    }
    setPlans([...plans, newPlan])
    toast.success('Plan created!')
    setShowForm(false)
    setFormData({ name: '', price: '', features: '' })
  }

  const handleDelete = (id) => {
    if (!window.confirm('Delete this plan?')) return
    setPlans(plans.filter(p => p.id !== id))
    toast.success('Plan deleted')
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#030712]/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <Link to="/super-admin" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center"><FiArrowLeft /></div>
            <span className="text-sm">Dashboard</span>
          </Link>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all">
            <FiPlus /> {showForm ? 'Cancel' : 'New Plan'}
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-28 pb-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Subscription <span className="text-purple-400">Plans</span></h1>
          <p className="text-gray-400">Manage platform subscription plans</p>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8 space-y-4">
            <h2 className="text-lg font-bold text-white">Create New Plan</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Plan Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Enterprise" className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Price (BDT/month)</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} required placeholder="e.g. 4999" className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Features (comma separated)</label>
              <textarea name="features" value={formData.features} onChange={handleChange} required rows={2} placeholder="Unlimited students, Custom domain, Priority support" className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 resize-none" />
            </div>
            <button type="submit" className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all">Create Plan</button>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-white/5 border border-white/10 rounded-2xl p-8 transition-all hover:border-white/20">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                <div className="flex gap-2">
                  <button className="text-gray-500 hover:text-blue-400 transition-colors"><FiEdit size={16} /></button>
                  <button onClick={() => handleDelete(plan.id)} className="text-gray-500 hover:text-red-400 transition-colors"><FiTrash2 size={16} /></button>
                </div>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">৳{plan.price}</span>
                {plan.price > 0 && <span className="text-gray-400 text-sm">/month</span>}
              </div>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                    <FiCheck className="text-emerald-400 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className={`text-center py-2 rounded-xl text-xs font-bold ${plan.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400'}`}>
                {plan.active ? 'Active' : 'Inactive'}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default ManageSubscriptionPlans