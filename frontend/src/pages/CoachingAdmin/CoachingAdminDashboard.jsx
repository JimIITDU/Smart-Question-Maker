import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getMyCenter, getAllCourses, getAllBatches, getAllSubjects, getUnreadNotifications } from '../services/api'
import { FiHome, FiBook, FiUsers, FiLayers, FiBell, FiUser, FiDollarSign, FiCreditCard, FiUserPlus, FiSettings } from 'react-icons/fi'

const CoachingAdminDashboard = () => {
  const { user, logoutUser } = useAuth()
  const [center, setCenter] = useState(null)
  const [stats, setStats] = useState({ courses: 0, batches: 0, subjects: 0, notifications: 0 })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [c, courses, batches, subjects, notifs] = await Promise.all([
          getMyCenter(),
          getAllCourses(),
          getAllBatches(),
          getAllSubjects(),
          getUnreadNotifications(),
        ])
        setCenter(c.data.data)
        setStats({
          courses: courses.data.data.length,
          batches: batches.data.data.length,
          subjects: subjects.data.data.length,
          notifications: notifs.data.data.length,
        })
      } catch {}
    }
    fetchData()
  }, [])

  const menuItems = [
    { label: 'Apply for Center', path: '/admin/apply', icon: FiHome, color: 'from-blue-500 to-cyan-500', desc: 'Register your coaching center' },
    { label: 'Manage Courses', path: '/admin/courses', icon: FiBook, color: 'from-indigo-500 to-blue-500', desc: `${stats.courses} courses` },
    { label: 'Manage Batches', path: '/admin/batches', icon: FiLayers, color: 'from-purple-500 to-indigo-500', desc: `${stats.batches} batches` },
    { label: 'Manage Subjects', path: '/admin/subjects', icon: FiBook, color: 'from-violet-500 to-purple-500', desc: `${stats.subjects} subjects` },
    { label: 'Manage Students', path: '/admin/students', icon: FiUsers, color: 'from-emerald-500 to-teal-500', desc: 'Student enrollment' },
    { label: 'Manage Teachers', path: '/admin/teachers', icon: FiUserPlus, color: 'from-amber-500 to-orange-500', desc: 'Teacher accounts' },
    { label: 'Manage Staff', path: '/admin/staff', icon: FiUsers, color: 'from-rose-500 to-pink-500', desc: 'Staff accounts' },
    { label: 'Fee Management', path: '/admin/fees', icon: FiDollarSign, color: 'from-cyan-500 to-blue-500', desc: 'Student fee tracking' },
    { label: 'Subscription', path: '/admin/subscription', icon: FiCreditCard, color: 'from-teal-500 to-emerald-500', desc: 'Platform subscription' },
    { label: 'Notifications', path: '/notifications', icon: FiBell, color: 'from-yellow-500 to-amber-500', desc: `${stats.notifications} unread` },
    { label: 'Profile', path: '/profile', icon: FiUser, color: 'from-gray-500 to-gray-600', desc: 'Manage your profile' },
  ]

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#030712]/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white">SQ</div>
            <div>
              <p className="text-sm font-semibold text-white">{user?.name}</p>
              <p className="text-xs text-gray-500">Coaching Admin</p>
            </div>
          </div>
          <button onClick={logoutUser} className="text-gray-500 hover:text-red-400 transition-colors text-sm">Logout</button>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-20">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{user?.name}</span> 👋</h1>
          <p className="text-gray-400">Coaching Admin Dashboard</p>
        </div>

        {center ? (
          <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-6 mb-8 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Your Center</p>
              <h2 className="text-xl font-bold text-white">{center.center_name}</h2>
              <p className="text-gray-400 text-sm">{center.location}</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-bold border ${center.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : center.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
              {center.status}
            </span>
          </div>
        ) : (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 mb-8 flex items-center justify-between">
            <div>
              <p className="text-amber-400 font-bold mb-1">No Coaching Center Yet</p>
              <p className="text-gray-400 text-sm">Apply for a coaching center to get started</p>
            </div>
            <Link to="/admin/apply" className="px-4 py-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-sm font-semibold hover:bg-amber-500/30 transition-all">
              Apply Now
            </Link>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Courses', value: stats.courses, color: 'text-indigo-400' },
            { label: 'Batches', value: stats.batches, color: 'text-purple-400' },
            { label: 'Subjects', value: stats.subjects, color: 'text-violet-400' },
            { label: 'Notifications', value: stats.notifications, color: 'text-amber-400' },
          ].map((s, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-gray-400 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>

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

export default CoachingAdminDashboard