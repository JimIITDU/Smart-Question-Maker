import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllQuestions, getAllExams, getUnreadNotifications } from '../../services/api'
import { FiBook, FiFileText, FiBarChart2, FiUpload, FiCpu, FiZap, FiBell, FiUser } from 'react-icons/fi'

const TeacherDashboard = () => {
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
    { label: 'Question Bank', path: '/teacher/questions', icon: FiBook, color: 'from-blue-500 to-cyan-500', desc: 'Create and manage questions' },
    { label: 'Create Question', path: '/teacher/questions/create', icon: FiFileText, color: 'from-indigo-500 to-blue-500', desc: 'Add a new question' },
    { label: 'AI Generator', path: '/teacher/questions/ai-generate', icon: FiCpu, color: 'from-purple-500 to-pink-500', desc: 'Generate questions with AI' },
    { label: 'Manage Exams', path: '/teacher/exams', icon: FiFileText, color: 'from-violet-500 to-purple-500', desc: 'View and manage exams' },
    { label: 'Create Exam', path: '/teacher/exams/create', icon: FiZap, color: 'from-amber-500 to-orange-500', desc: 'Schedule a new exam' },
    { label: 'Live Quiz', path: '/teacher/live-quiz', icon: FiZap, color: 'from-emerald-500 to-teal-500', desc: 'Start a live quiz session' },
    { label: 'Upload Material', path: '/teacher/upload-material', icon: FiUpload, color: 'from-rose-500 to-pink-500', desc: 'Share study materials' },
    { label: 'Analytics', path: '/teacher/analytics', icon: FiBarChart2, color: 'from-cyan-500 to-blue-500', desc: 'View performance analytics' },
    { label: 'Notifications', path: '/notifications', icon: FiBell, color: 'from-yellow-500 to-amber-500', desc: `${stats.notifications} unread` },
    { label: 'Profile', path: '/profile', icon: FiUser, color: 'from-gray-500 to-gray-600', desc: 'Manage your profile' },
  ]

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2"><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Teacher Dashboard</span></h1>
        <p className="text-gray-400">Your teaching command center</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {menuItems.map((item, i) => (
          <Link key={i} to={item.path} className="group bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:bg-white/[0.07]">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
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

export default TeacherDashboard
