import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { FiHome, FiFileText, FiBell, FiUser, FiLogOut, FiGrid, FiUsers, FiBuilding, FiDollarSign, FiBarChart3, FiBookOpen, FiAward, FiEdit3, FiZap, FiLayers, FiSettings, FiCalendar, FiUpload } from 'react-icons/fi'

const Sidebar = () => {
  const { user, logoutUser } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  if (!user) return null

  const roleMenus = {
    1: [ // SuperAdmin
      { path: '/super-admin', label: 'Dashboard', icon: FiHome },
      { path: '/super-admin/centers', label: 'Manage Centers', icon: FiBuilding },
      { path: '/super-admin/subscriptions', label: 'Subscription Plans', icon: FiDollarSign },
      { path: '/notifications', label: 'Notifications', icon: FiBell },
      { path: '/profile', label: 'Profile', icon: FiUser },
    ],
    2: [ // CoachingAdmin
      { path: '/coaching-admin', label: 'Dashboard', icon: FiHome },
      { path: '/coaching-admin/courses', label: 'Courses', icon: FiBookOpen },
      { path: '/coaching-admin/batches', label: 'Batches', icon: FiCalendar },
      { path: '/coaching-admin/subjects', label: 'Subjects', icon: FiGrid },
      { path: '/coaching-admin/students', label: 'Students', icon: FiUsers },
      { path: '/coaching-admin/teachers', label: 'Teachers', icon: FiAward },
      { path: '/coaching-admin/staff', label: 'Staff', icon: FiUsers },
      { path: '/coaching-admin/fees', label: 'Fees', icon: FiDollarSign },
      { path: '/coaching-admin/subscription', label: 'Subscription', icon: FiDollarSign },
      { path: '/notifications', label: 'Notifications', icon: FiBell },
      { path: '/profile', label: 'Profile', icon: FiUser },
    ],
    3: [ // Teacher
      { path: '/teacher', label: 'Dashboard', icon: FiHome },
      { path: '/teacher/questions', label: 'Question Bank', icon: FiGrid },
      { path: '/teacher/questions/ai-generate', label: 'AI Generator', icon: FiZap },
      { path: '/teacher/exams', label: 'Manage Exams', icon: FiFileText },
      { path: '/teacher/live-quiz', label: 'Live Quiz', icon: FiBarChart3 },
      { path: '/teacher/analytics', label: 'Analytics', icon: FiBarChart3 },
      { path: '/teacher/upload-material', label: 'Upload Material', icon: FiUpload },
      { path: '/notifications', label: 'Notifications', icon: FiBell },
      { path: '/profile', label: 'Profile', icon: FiUser },
    ],
    5: [ // Student
      { path: '/student', label: 'Dashboard', icon: FiHome },
      { path: '/student/exams', label: 'Exams', icon: FiFileText },
      { path: '/student/study-materials', label: 'Study Materials', icon: FiBookOpen },
      { path: '/student/results', label: 'My Results', icon: FiAward },
      { path: '/notifications', label: 'Notifications', icon: FiBell },
      { path: '/profile', label: 'Profile', icon: FiUser },
    ],
    6: [ // Parent
      { path: '/parent', label: 'Dashboard', icon: FiHome },
      { path: '/parent/child-results', label: 'Child Results', icon: FiAward },
      { path: '/notifications', label: 'Notifications', icon: FiBell },
      { path: '/profile', label: 'Profile', icon: FiUser },
    ],
  }

  const menuItems = roleMenus[user.role_id] || []

  const handleLogout = () => {
    logoutUser()
    navigate('/login')
  }

  const getRoleBasePath = () => {
    switch (user.role_id) {
      case 1: return '/super-admin'
      case 2: return '/coaching-admin'
      case 3: return '/teacher'
      case 5: return '/student'
      case 6: return '/parent'
      default: return '/dashboard'
    }
  }

  return (
    <aside className="w-64 flex flex-col fixed top-20 left-0 h-[calc(100vh-5rem)] bg-[#030712] border-r border-white/5 z-40 overflow-y-auto">
      <div className="p-6 flex-shrink-0">
        <Link to={getRoleBasePath()} className="flex items-center gap-3 mb-8 cursor-pointer group">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-all">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <span className="text-sm font-bold text-white tracking-tight hidden lg:block">SmartQ</span>
        </Link>

        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${isActive(item.path)
                ? 'bg-white text-[#030712] shadow-lg border border-blue-200/50' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className={`text-lg flex-shrink-0 ${isActive(item.path) ? 'text-blue-500' : ''}`} />
              <span className="hidden lg:block">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 uppercase tracking-wider">{user?.role}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all font-medium"
        >
          <FiLogOut />
          <span className="hidden lg:block">Logout</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar

