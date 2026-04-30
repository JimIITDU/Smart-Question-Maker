import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowLeft, FiCreditCard, FiCheck, FiCheckCircle, FiAlertCircle } from 'react-icons/fi'
import { getSubscriptionPlans, getMySubscription, upgradeSubscription } from '../../services/api'
import toast from 'react-hot-toast'

const SubscriptionManagement = () => {
  const [plans, setPlans] = useState([])
  const [currentSubscription, setCurrentSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plansRes, subRes] = await Promise.all([
          getSubscriptionPlans(),
          getMySubscription().catch(() => ({ data: { data: null } }))
        ])
        setPlans(plansRes.data.data || [])
        setCurrentSubscription(subRes.data.data)
      } catch (err) {
        toast.error('Failed to load subscription data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleUpgrade = async (planId) => {
    if (!window.confirm('Are you sure you want to upgrade your subscription?')) return
    
    setUpgrading(true)
    try {
      await upgradeSubscription(planId)
      toast.success('Subscription upgraded successfully!')
      // Refresh data
      const subRes = await getMySubscription()
      setCurrentSubscription(subRes.data.data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upgrade subscription')
    } finally {
      setUpgrading(false)
    }
  }

  const getCurrentPlanName = () => {
    if (!currentSubscription) return 'Free'
    return currentSubscription.plan_name || 'Free'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] text-white">
        <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#030712]/70 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center gap-4">
            <Link to="/coaching-admin" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center"><FiArrowLeft /></div>
              <span className="text-sm">Dashboard</span>
            </Link>
            <h1 className="text-lg font-bold text-white">Subscription</h1>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-6 pt-28 pb-20">
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin"></div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#030712]/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center gap-4">
          <Link to="/coaching-admin" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center"><FiArrowLeft /></div>
            <span className="text-sm">Dashboard</span>
          </Link>
          <h1 className="text-lg font-bold text-white">Subscription</h1>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-28 pb-20">
        {/* Current Subscription Status */}
        <div className="mb-8 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border border-teal-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-500/20 flex items-center justify-center">
                <FiCreditCard className="text-teal-400 text-xl" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Current Plan</p>
                <p className="text-2xl font-bold text-white">{getCurrentPlanName()}</p>
                {currentSubscription?.subscription_end && (
                  <p className="text-gray-500 text-sm">
                    Expires: {new Date(currentSubscription.subscription_end).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FiCheckCircle className="text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Active</span>
            </div>
          </div>
        </div>

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Subscription <span className="text-teal-400">Plans</span></h1>
          <p className="text-gray-400">Choose the right plan for your coaching center</p>
        </div>

        {currentSubscription?.status !== 'active' && (
          <div className="mb-6 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3">
            <FiAlertCircle className="text-amber-400 flex-shrink-0" />
            <p className="text-amber-400 text-sm">Your center must be approved before you can upgrade your subscription.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => {
            const isCurrentPlan = getCurrentPlanName() === plan.name
            const isUpgrade = plan.price > 0
            
            return (
              <div key={plan.plan_id || i} className={`bg-white/5 border rounded-2xl p-8 transition-all ${isCurrentPlan ? 'border-teal-500/30' : 'border-white/10'} ${i === 2 ? 'relative overflow-hidden' : ''}`}>
                {i === 2 && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-purple-500 text-white text-xs font-bold rounded-full">Popular</div>
                )}
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold mb-4 ${
                  plan.name === 'Free' ? 'bg-gray-500/10 text-gray-400' :
                  plan.name === 'Basic' ? 'bg-blue-500/10 text-blue-400' :
                  'bg-purple-500/10 text-purple-400'
                }`}>
                  {plan.name}
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">৳{plan.price || 0}</span>
                  {plan.price > 0 && <span className="text-gray-400 text-sm">/month</span>}
                  {plan.price === 0 && <span className="text-gray-400 text-sm">forever</span>}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features && plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm text-gray-300">
                      <FiCheck className="text-emerald-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
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
                  {plan.ai_questions_limit !== undefined && (
                    <li className="flex items-center gap-3 text-sm text-gray-300">
                      <FiCheck className="text-emerald-400 flex-shrink-0" />
                      {plan.ai_questions_limit === 0 ? 'No' : plan.ai_questions_limit} AI questions/month
                    </li>
                  )}
                  {plan.support_level && (
                    <li className="flex items-center gap-3 text-sm text-gray-300">
                      <FiCheck className="text-emerald-400 flex-shrink-0" />
                      {plan.support_level} support
                    </li>
                  )}
                </ul>
                <button 
                  disabled={isCurrentPlan || currentSubscription?.status !== 'active' || upgrading}
                  onClick={() => handleUpgrade(plan.plan_id)}
                  className={`w-full py-3 rounded-xl font-bold transition-all ${
                    isCurrentPlan 
                      ? 'bg-white/10 text-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:shadow-lg'
                  }`}
                >
                  {isCurrentPlan 
                    ? 'Current Plan' 
                    : upgrading 
                      ? 'Upgrading...' 
                      : 'Upgrade'
                  }
                </button>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}

export default SubscriptionManagement
