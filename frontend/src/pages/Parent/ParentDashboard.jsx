import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getUnreadNotifications } from '../../services/api'
import { FiBarChart2, FiBell, FiUser } from 'react-icons/fi'

const ParentDashboard = () => {
  const [notifications, setNotifications] = useState(0)

  useEffect(() => {
    getUnreadNotifications()
      .then(r => setNotifications(r.data.data.length))
      .catch(() => {})
  }, [])

  const menuItems = [
    { label: "Child's Results", path: '/parent/child-results', icon: FiBarChart2, color: 'from-blue-500 to-cyan-500', desc: 'View academic performance' },
    { label: 'Notifications', path: '/notifications', icon: FiBell, color: 'from-amber-500 to-orange-500', desc: `${notifications} unread` },
    { label: 'Profile', path: '/profile', icon: FiUser, color: 'from-gray-500 to-gray-600', desc: 'Manage your profile' },
  ]

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2"><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Parent Dashboard</span></h1>
        <p className="text-gray-400">Monitor your child's academic progress</p>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 mb-8">
        <p className="text-blue-400 font-semibold mb-1">Parent Access</p>
        <p className="text-gray-400 text-sm">You can view your child's exam results, performance analytics, and receive important notifications from their coaching center.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {menuItems.map((item, i) => (
          <Link key={i} to={item.path} className="group bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:bg-white/[0.07]">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <item.icon className="text-white text-xl" />
            </div>
            <h3 className="text-white font-bold mb-1">{item.label}</h3>
            <p className="text-gray-500 text-sm">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default ParentDashboard
