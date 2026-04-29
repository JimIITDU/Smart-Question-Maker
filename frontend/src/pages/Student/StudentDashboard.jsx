import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { getAllExams, getUnreadNotifications } from '../../services/api'
import { FiBook, FiFileText, FiBarChart2, FiBell, FiUser, FiZap } from 'react-icons/fi'

const StudentDashboard = () => {
  const { user, logoutUser } = useAuth() // Added logoutUser
  const [stats, setStats] = useState({ exams: 0, notifications: 0 })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [e, n] = await Promise.all([
          getAllExams(),
          getUnreadNotifications(),
        ])
        setStats({
          exams: e.data.data.length,
          notifications: n.data.data.length,
        })
      } catch {}
    }
    fetchStats()
  }, [])

  const menuItems = [
    { label: 'My Exams', path: '/student/exams', icon: FiFileText, color: 'from-blue-600 to-cyan-600', desc: 'View scheduled exams' },
    { label: 'Join Live Quiz', path: '/student/join-quiz', icon: FiZap, color: 'from-emerald-600 to-teal-600', desc: 'Join with access code' },
    { label: 'My Results', path: '/student/results', icon: FiBarChart2, color: 'from-purple-600 to-pink-600', desc: 'View your performance' },
    { label: 'Study Materials', path: '/student/study-materials', icon: FiBook, color: 'from-amber-600 to-orange-600', desc: 'Access learning resources' },
    { label: 'Notifications', path: '/notifications', icon: FiBell, color: 'from-rose-600 to-pink-600', desc: `${stats.notifications} unread` },
    { label: 'Profile', path: '/profile', icon: FiUser, color: 'from-gray-600 to-gray-700', desc: 'Manage your profile' },
  ]

  return (
    <div className="min-h-screen bg-[#030712] text-white relative overflow-hidden font-sans">
      
      {/* Ambient Background (Subtle) */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/5 rounded-full blur-[120px]"></div>
      </div>

      {/* --- THE NAVBAR YOU REQUESTED --- */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#030712]/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white">SQ</div>
            <div>
              <p className="text-sm font-semibold text-white">{user?.name}</p>
              <p className="text-xs text-gray-500">Student</p>
            </div>
          </div>
          <button onClick={logoutUser} className="text-gray-500 hover:text-red-400 transition-colors text-sm">Logout</button>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-20">
        
        {/* Header */}
        <div className="mb-10 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">{user?.name}</span> 👋
          </h1>
          <p className="text-gray-500 text-lg">Your learning command center.</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Available Exams', value: stats.exams, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
            { label: 'Notifications', value: stats.notifications, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
          ].map((s, i) => (
            <div key={i} className={`${s.bg} ${s.border} backdrop-blur-md rounded-2xl p-6 text-center border shadow-lg hover:scale-105 transition-transform duration-300`}>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-gray-400 text-sm mt-1 uppercase tracking-wide font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Grid Menu */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, i) => (
            <Link 
              key={i} 
              to={item.path} 
              className="group relative bg-[#0B0C15]/50 hover:bg-[#0B0C15]/80 border border-white/5 hover:border-white/10 rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl overflow-hidden"
            >
              {/* Hover Gradient Glow */}
              <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
              
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-lg shadow-black/40 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <item.icon className="text-2xl" />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all">
                {item.label}
              </h3>
              
              <div className="flex items-center justify-between mt-auto">
                <p className="text-sm text-gray-500 group-hover:text-gray-300 transition-colors">{item.desc}</p>
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  )
}

export default StudentDashboard