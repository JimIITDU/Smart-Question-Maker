import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FiArrowLeft, FiPlus, FiEdit, FiTrash2, FiCheck, FiX, FiToggleLeft, FiToggleRight } from 'react-icons/fi'
import { getAllSubscriptionPlans, createSubscriptionPlan, updateSubscriptionPlan, deleteSubscriptionPlan, toggleSubscriptionPlanStatus } from '../../services/api'

const ManageSubscriptionPlans = () => {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)
  const [formData, setFormData] = useState({ 
    name: '', 
    price: '', 
    features: '', 
    max_students: '', 
    max_courses: '', 
    max_exams: '', 
    ai_questions_limit: '', 
    support_level: '',
    is_active: true 
  })

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const res = await getAllSubscriptionPlans()
      setPlans(res.data.data || [])
    } catch (err) {
      toast.error('Failed to load plans')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = {
        name: formData.name,
        price: parseInt(formData.price) || 0,
        features: formData.features.split(',').map(f => f.trim()).filter(f => f),
        max_students: formData.max_students ? parseInt(formData.max_students) : null,
        max_courses: formData.max_courses ? parseInt(formData.max_courses) : null,
        max_exams: formData.max_exams ? parseInt(formData.max_exams) : null,
        ai_questions_limit: formData.ai_questions_limit ? parseInt(formData.ai_questions_limit) : null,
        support_level: formData.support_level || 'Email',
        is_active: true
      }

      if (editingPlan) {
        await updateSubscriptionPlan(editingPlan.plan_id, data)
        toast.success('Plan updated!')
      } else {
        await createSubscriptionPlan(data)
        toast.success('Plan created!')
      }
      
      setShowForm(false)
      setEditingPlan(null)
      setFormData({ name: '', price: '', features: '', max_students: '', max_courses: '', max_exams: '', ai_questions_limit: '', support_level: '', is_active: true })
      fetchPlans()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save plan')
    }
  }

  const handleEdit = (plan) => {
    setEditingPlan(plan)
    setFormData({
      name: plan.name || '',
      price: plan.price?.toString() || '',
      features: plan.features?.join(', ') || '',
      max_students: plan.max_students?.toString() || '',
      max_courses: plan.max_courses?.toString() || '',
      max_exams: plan.max_exams?.toString() || '',
      ai_questions_limit: plan.ai_questions_limit?.toString() || '',
      support_level: plan.support_level || 'Email',
      is_active: plan.is_active ?? true
    })
    setShowForm(true)
  }

  const handleDelete = async (planId) => {
    if (!window.confirm('Delete this plan? This cannot be undone.')) return
    try {
      await deleteSubscriptionPlan(planId)
      toast.success('Plan deleted')
      fetchPlans()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete plan')
    }
  }

  const handleToggle = async (plan) => {
    try {
      await toggleSubscriptionPlanStatus(plan.plan_id, { is_active: !plan.is_active })
      toast.success(`Plan ${!plan.is_active ? 'activated' : 'deactivated'}`)
      fetchPlans()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle plan status')
    }
  }

  const cancelForm = () => {
    setShowForm(false)
    setEditingPlan(null)
    setFormData({ name: '', price: '', features: '', max_students: '', max_courses: '', max_exams: '', ai_questions_limit: '', support_level: '', is_active: true })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] text-white">
        <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#030712]/70 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center gap-4">
            <Link to="/super-admin" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center"><FiArrowLeft /></div>
              <span className="text-sm">Dashboard</span>
            </Link>
            <h1 className="text-lg font-bold text-white">Manage Subscription Plans</h1>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-6 pt-28 pb-20">
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          </div>
        </main>
      </div>
    )
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
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">{editingPlan ? 'Edit Plan' : 'Create New Plan'}</h2>
              <button type="button" onClick={cancelForm} className="text-gray-400 hover:text-white">
                <FiX size={20} />
              </button>
            </div>
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
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Max Students</label>
                <input type="number" name="max_students" value={formData.max_students} onChange={handleChange} placeholder="e.g. 500" className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Max Courses</label>
                <input type="number" name="max_courses" value={formData.max_courses} onChange={handleChange} placeholder="e.g. 50" className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Max Exams</label>
                <input type="number" name="max_exams" value={formData.max_exams} onChange={handleChange} placeholder="e.g. 100" className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">AI Questions Limit/month</label>
                <input type="number" name="ai_questions_limit" value={formData.ai_questions_limit} onChange={handleChange} placeholder="0 for unlimited, leave empty for no AI" className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Support Level</label>
                <input type="text" name="support_level" value={formData.support_level} onChange={handleChange} placeholder="e.g. 24/7, Priority, Email" className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Features (comma separated)</label>
              <textarea name="features" value={formData.features} onChange={handleChange} rows={2} placeholder="Unlimited students, Custom domain, Priority support" className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 resize-none" />
            </div>
            <button type="submit" className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all">
              {editingPlan ? 'Update Plan' : 'Create Plan'}
            </button>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.plan_id} className={`bg-white/5 border rounded-2xl p-8 transition-all hover:border-white/20 ${!plan.is_active ? 'opacity-60' : ''}`}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(plan)} className="text-gray-500 hover:text-blue-400 transition-colors">
                    <FiEdit size={16} />
                  </button>
                  <button onClick={() => handleToggle(plan)} className={`transition-colors ${plan.is_active ? 'text-emerald-500 hover:text-emerald-400' : 'text-gray-500 hover:text-gray-400'}`}>
                    {plan.is_active ? <FiToggleRight size={16} /> : <FiToggleLeft size={16} />}
                  </button>
                  <button onClick={() => handleDelete(plan.plan_id)} className="text-gray-500 hover:text-red-400 transition-colors">
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">৳{plan.price || 0}</span>
                {plan.price > 0 && <span className="text-gray-400 text-sm">/month</span>}
                {plan.price === 0 && <span className="text-gray-400 text-sm">forever</span>}
              </div>
              <ul className="space-y-3 mb-6">
                {plan.max_students && (
                  <li className="flex items-center gap-3 text-sm text-gray-300">
                    <FiCheck className="text-emerald-400 flex-shrink-0" />
                    Up to {plan.max_students} students
                  </li>
                )}
                {plan.max_courses && (
                  <li className="flex items-center gap-3 text-sm text-gray-300">
                    <FiCheck className="text-emerald-400 flex-shrink-0" />
                    Up to {plan.max_courses} courses
                  </li>
                )}
                {plan.max_exams && (
                  <li className="flex items-center gap-3 text-sm text-gray-300">
                    <FiCheck className="text-emerald-400 flex-shrink-0" />
                    Up to {plan.max_exams} exams
                  </li>
                )}
                {plan.ai_questions_limit !== undefined && (
                  <li className="flex items-center gap-3 text-sm text-gray-300">
                    <FiCheck className="text-emerald-400 flex-shrink-0" />
                    {plan.ai_questions_limit === 0 ? 'No AI questions' : plan.ai_questions_limit ? `AI: ${plan.ai_questions_limit}/mo` : 'AI questions unlimited'}
                  </li>
                )}
                {plan.support_level && (
                  <li className="flex items-center gap-3 text-sm text-gray-300">
                    <FiCheck className="text-emerald-400 flex-shrink-0" />
                    {plan.support_level} support
                  </li>
                )}
              </ul>
              <div className={`text-center py-2 rounded-xl text-xs font-bold ${plan.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400'}`}>
                {plan.is_active ? 'Active' : 'Inactive'}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default ManageSubscriptionPlans
