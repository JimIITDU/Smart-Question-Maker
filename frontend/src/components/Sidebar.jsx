import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { 
  FiHome, 
  FiFileText, 
  FiBell, 
  FiUser, 
  FiLogOut, 
  FiGrid, 
  FiUsers, 
  FiDollarSign, 
  FiBarChart2, 
  FiBookOpen, 
  FiAward, 
  FiZap, 
  FiUpload, 
  FiX, 
  FiTrendingUp, 
  FiPlayCircle 
} from 'react-icons/fi'

const Sidebar = ({ collapsed, mobileOpen, onClose }) => {
  const { user, logoutUser } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path) => location.pathname === path

  if (!user) return null

  const roleMenus = {
    3: [ // Teacher
      { type: 'group', label: 'Content' },
      { path: '/teacher', label: 'Dashboard', icon: FiHome },
      { path: '/teacher/questions', label: 'Question Bank', icon: FiGrid },
      { path: '/teacher/questions/ai-generate', label: 'AI Generator', icon: FiZap },
      
      { type: 'group', label: 'Exams' },
      { path: '/teacher/exams', label: 'Manage Exams', icon: FiFileText },
      { path: '/teacher/live-quiz', label: 'Live Quiz', icon: FiPlayCircle },
      
      { type: 'group', label: 'Analytics & Others' },
      { path: '/teacher/analytics', label: 'Analytics', icon: FiTrendingUp },
      { path: '/teacher/upload-material', label: 'Upload Material', icon: FiUpload },
      { path: '/notifications', label: 'Notifications', icon: FiBell },
      { path: '/profile', label: 'Profile', icon: FiUser },
    ],
    // Add other roles if needed
  }

  const menuItems = roleMenus[user.role_id] || roleMenus[3]

  const handleLogout = () => {
    logoutUser()
    navigate('/login')
    onClose?.()
  }

  return (
    <aside className={`
      fixed top-20 bottom-0 left-0 z-40 border-r border-white/10 bg-[#030712]
      transition-all duration-300 overflow-y-auto
      ${collapsed ? 'w-20' : 'w-64'}
      ${mobileOpen ? 'lg:hidden w-full' : ''}
    `}>
      {/* Mobile Header */}
      {mobileOpen && (
        <div className="lg:hidden p-4 border-b border-white/10 flex justify-between items-center">
          <span className="font-semibold text-lg">Menu</span>
          <button onClick={onClose} className="text-gray-400">
            <FiX className="w-6 h-6" />
          </button>
        </div>
      )}

      <div className="pt-6 px-3 pb-24"> {/* Extra padding at bottom for logout */}
        <nav className="space-y-1">
          {menuItems.map((item, index) => (
            item.type === 'group' ? (
              <div key={index} className={`px-4 py-3 text-xs font-semibold uppercase tracking-widest text-gray-500 ${collapsed ? 'hidden' : ''}`}>
                {item.label}
              </div>
            ) : (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all group
                  ${isActive(item.path) 
                    ? 'bg-indigo-600/10 text-white border-l-4 border-indigo-500' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  } ${collapsed ? 'justify-center px-2' : ''}`}
                title={collapsed ? item.label : ''}
              >
                <item.icon className={`text-xl flex-shrink-0 ${isActive(item.path) ? 'text-indigo-400' : ''}`} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          ))}
        </nav>
      </div>

      {/* Logout - Fixed at bottom */}
      {/* <div className="absolute bottom-6 left-0 right-0 px-4">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-4 py-3.5 text-red-400 hover:bg-red-500/10 rounded-2xl transition-all font-medium
            ${collapsed ? 'justify-center' : 'justify-start'}`}
        >
          <FiLogOut className="text-xl flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div> */}
    </aside>
  )
}

export default Sidebar