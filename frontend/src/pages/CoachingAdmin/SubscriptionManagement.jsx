import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowLeft, FiCreditCard, FiCheck } from 'react-icons/fi'

const SubscriptionManagement = () => {
  const [current] = useState('free')

  const plans = [
    { name: 'Free', price: 0, features: ['Up to 50 students', '5 courses', 'Basic exams', 'Email support'], color: 'border-white/10', badge: 'bg-gray-500/10 text-gray-400' },
    { name: 'Basic', price: 999, features: ['Up to 200 students', '20 courses', 'All exam types', 'AI questions (50/mo)', 'Priority support'], color: 'border-blue-500/30', badge: 'bg-blue-500/10 text-blue-400' },
    { name: 'Pro', price: 2999, features: ['Unlimited students', 'Unlimited courses', 'All exam types', 'AI questions unlimited', 'Analytics dashboard', '24/7 support'], color: 'border-purple-500/30', badge: 'bg-purple-500/10 text-purple-400' },
  ]

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#030712]/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center gap-4">
          <Link to="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center"><FiArrowLeft /></div>
            <span className="text-sm">Dashboard</span>
          </Link>
          <h1 className="text-lg font-bold text-white">Subscription</h1>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-28 pb-20">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Subscription <span className="text-teal-400">Plans</span></h1>
          <p className="text-gray-400">Choose the right plan for your coaching center</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <div key={i} className={`bg-white/5 border rounded-2xl p-8 transition-all ${plan.color} ${i === 2 ? 'relative overflow-hidden' : ''}`}>
              {i === 2 && (
                <div className="absolute top-4 right-4 px-3 py-1 bg-purple-500 text-white text-xs font-bold rounded-full">Popular</div>
              )}
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold mb-4 ${plan.badge}`}>{plan.name}</div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">৳{plan.price}</span>
                {plan.price > 0 && <span className="text-gray-400 text-sm">/month</span>}
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-3 text-sm text-gray-300">
                    <FiCheck className="text-emerald-400 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button className={`w-full py-3 rounded-xl font-bold transition-all ${current === plan.name.toLowerCase() ? 'bg-white/10 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:shadow-lg'}`}>
                {current === plan.name.toLowerCase() ? 'Current Plan' : 'Upgrade'}
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default SubscriptionManagement