import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { FiHome, FiFileText, FiBell, FiUser, FiLogOut, FiGrid } from 'react-icons/fi'

const Sidebar = () => {
  const { user, logoutUser } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  const canSeeQuestions = user?.role_id === 2 || user?.role_id === 3

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: FiHome },
    ...(canSeeQuestions ? [{ path: '/teacher/questions', label: 'Questions', icon: FiGrid }] : []),
    { path: '/exams', label: 'Exams', icon: FiFileText },
    { path: '/notifications', label: 'Notifications', icon: FiBell },
    { path: '/profile', label: 'Profile', icon: FiUser },
  ]

  const handleLogout = () => {
    logoutUser()
    navigate('/login')
  }

  return (
    <aside className="w-64 bg-[#030712] border-r border-white/5 min-h-screen hidden md:flex flex-col fixed md:sticky top-0 left-0 z-40">
      <div className="p-6">
        {/* Minimal Logo */}
        <Link to="/dashboard" className="flex items-center gap-3 mb-8 cursor-pointer group">
          <div className="w-6 h-6 rounded bg-white text-black flex items-center justify-center font-bold text-xs">
            SQ
          </div>
          <span className="text-sm font-bold text-white tracking-tight">Smart Q.</span>
        </Link>

        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.path)
                  ? 'bg-white/5 text-white border border-white/5' // Very subtle active state
                  : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="text-base" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="mt-auto p-4 border-t border-white/5">
        <div className="flex items-center gap-3 mb-3 px-1">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs text-white">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
            <p className="text-[10px] text-gray-500 truncate uppercase">Student</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-400 hover:text-red-400 transition-colors rounded hover:bg-red-400/5"
        >
          <FiLogOut /> Sign Out
        </button>
      </div>
    </aside>
  )
}

export default Sidebar