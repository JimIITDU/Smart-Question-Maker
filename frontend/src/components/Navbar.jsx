import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const Navbar = () => {
  const { user, logoutUser } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logoutUser()
    navigate('/login')
  }

  const getRoleName = (role_id) => {
    switch (role_id) {
      case 1: return 'Super Admin'
      case 2: return 'Coaching Admin'
      case 3: return 'Teacher'
      case 4: return 'Staff'
      case 5: return 'Student'
      case 6: return 'Parent'
      default: return 'User'
    }
  }

  return (
    <nav className="bg-indigo-600 text-white px-6 py-4 flex justify-between items-center shadow-md">
      
      {/* Left side - Logo */}
      <div className="flex items-center gap-3">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="bg-white text-indigo-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
            SQ
          </div>
          <span className="font-bold text-lg">
            Smart Question Maker
          </span>
        </Link>
      </div>

      {/* Middle - Navigation links */}
      <div className="flex items-center gap-6">
        <Link
          to="/dashboard"
          className="text-white hover:text-indigo-200 text-sm font-medium transition"
        >
          Dashboard
        </Link>

        {/* Show questions link for admin and teacher */}
        {(user?.role_id === 2 || user?.role_id === 3) && (
          <Link
            to="/questions"
            className="text-white hover:text-indigo-200 text-sm font-medium transition"
          >
            Questions
          </Link>
        )}

        {/* Show exams for all */}
        <Link
          to="/exams"
          className="text-white hover:text-indigo-200 text-sm font-medium transition"
        >
          Exams
        </Link>

        {/* Notifications */}
        <Link
          to="/notifications"
          className="text-white hover:text-indigo-200 text-sm font-medium transition"
        >
          🔔 Notifications
        </Link>
      </div>

      {/* Right side - User info */}
      <div className="flex items-center gap-4">
        <div className="text-right">
          <Link
            to="/profile"
            className="text-sm font-semibold hover:text-indigo-200 transition"
          >
            {user?.name}
          </Link>
          <p className="text-xs text-indigo-200">
            {getRoleName(user?.role_id)}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-white text-indigo-600 px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-indigo-50 transition"
        >
          Logout
        </button>
      </div>

    </nav>
  )
}

export default Navbar