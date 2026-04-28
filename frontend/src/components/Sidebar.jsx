import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const Sidebar = () => {
  const { user } = useAuth()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  // Logic: Show Questions link only for Coaching Admin (2) and Teacher (3)
  const canSeeQuestions = user?.role_id === 2 || user?.role_id === 3

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    ...(canSeeQuestions ? [{ path: '/questions', label: 'Questions', icon: '❓' }] : []),
    { path: '/exams', label: 'Exams', icon: '📝' },
    { path: '/notifications', label: 'Notifications', icon: '🔔' },
    { path: '/profile', label: 'My Profile', icon: '👤' },
  ]

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen hidden md:flex flex-col fixed md:sticky top-0 left-0 z-40">
      <div className="p-6">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
          Main Menu
        </h2>
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.path)
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Bottom section of Sidebar */}
      <div className="mt-auto p-6 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xs">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700 truncate w-32">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate w-32 capitalize">{user?.role_id === 1 ? 'Admin' : 'User'}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar