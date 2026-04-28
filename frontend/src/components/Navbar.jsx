import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const Navbar = () => {
  const { user } = useAuth()
  
  // Simple logic to get the title from the current path
  const getTitle = () => {
    const path = window.location.pathname
    if (path.includes('exams')) return 'Exams'
    if (path.includes('notifications')) return 'Notifications'
    if (path.includes('profile')) return 'Profile'
    return 'Dashboard'
  }

  return (
    <nav className="bg-[#030712] border-b border-white/5 h-16 flex justify-between items-center px-6 sticky top-0 z-30">
      
      {/* Left - Page Title */}
      <div className="text-sm font-medium text-white">
        {getTitle()}
      </div>

      {/* Right - Profile Only */}
      <div className="flex items-center">
        <Link to="/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white">{user?.name}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white">
            {user?.name?.charAt(0)}
          </div>
        </Link>
      </div>
    </nav>
  )
}

export default Navbar