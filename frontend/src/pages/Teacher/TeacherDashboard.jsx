import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getAllQuestions, getAllExams, getUnreadNotifications } from '../services/api'
import { FiBook, FiFileText, FiBarChart2, FiUpload, FiCpu, FiZap, FiBell, FiUser } from 'react-icons/fi'

const TeacherDashboard = () => {
  const { user, logoutUser } = useAuth()
  const [stats, setStats] = useState({ questions: 0, exams: 0, notifications: 0 })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [q, e, n] = await Promise.all([
          getAllQuestions(),
          getAllExams(),
          getUnreadNotifications(),
        ])
        setStats({
          questions: q.data.data.length,
          exams: e.data.data.length,
          notifications: n.data.data.length,
        })
      } catch {}
    }
    fetchStats()
  }, [])

  const menuItems = [
    { label: 'Question Bank', path: '/questions', icon: FiBook, color: 'from-blue-500 to-cyan-500', desc: 'Create and manage questions' },
    { label: 'Create Question', path: '/questions/create', icon: FiFileText, color: 'from-indigo-500 to-blue-500', desc: 'Add a new question' },
    { label: 'AI Generator', path: '/questions/ai-generate', icon: FiCpu, color: 'from-purple-500 to-pink-500', desc: 'Generate questions with AI' },
    { label: 'Manage Exams', path: '/exams/manage', icon: FiFileText, color: 'from-violet-500 to-purple-500', desc: 'View and manage exams' },
    { label: 'Create Exam', path: '/exams/create', icon: FiZap, color: 'from-amber-500 to-orange-500', desc: 'Schedule a new exam' },
    { label: 'Live Quiz', path: '/live-quiz', icon: FiZap, color: 'from-emerald-500 to-teal-500', desc: 'Start a live quiz session' },
    { label: 'Upload Material', path: '/materials/upload', icon: FiUpload, color: 'from-rose-500 to-pink-500', desc: 'Share study materials' },
    { label: 'Analytics', path: '/analytics', icon: FiBarChart2, color: 'from-cyan-500 to-blue-500', desc: 'View performance analytics' },
    { label: 'Notifications', path: '/notifications', icon: FiBell, color: 'from-yellow-500 to-amber-500', desc: `${stats.notifications} unread` },
    { label: 'Profile', path: '/profile', icon: FiUser, color: 'from-gray-500 to-gray-600', desc: 'Manage your profile' },
  ]

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#030712]/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white">SQ</div>
            <div>
              <p className="text-sm font-semibold text-white">{user?.name}</p>
              <p className="text-xs text-gray-500">Teacher</p>
            </div>
          </div>
          <button onClick={logoutUser} className="text-gray-500 hover:text-red-400 transition-colors text-sm">Logout</button>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-20">
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-2">Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">{user?.name}</span> 👋</h1>
          <p className="text-gray-400">Your teaching dashboard</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Questions', value: stats.questions, color: 'text-blue-400' },
            { label: 'Exams', value: stats.exams, color: 'text-purple-400' },
            { label: 'Notifications', value: stats.notifications, color: 'text-amber-400' },
          ].map((s, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-gray-400 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems.map((item, i) => (
            <Link key={i} to={item.path} className="group bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl p-6 transition-all hover:-translate-y-1">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <item.icon className="text-white text-xl" />
              </div>
              <h3 className="text-white font-bold mb-1">{item.label}</h3>
              <p className="text-gray-500 text-sm">{item.desc}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}

export default TeacherDashboard