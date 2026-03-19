import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getUnreadNotifications } from '../services/api'

const Dashboard = () => {
  const { user, logoutUser } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    getUnreadNotifications()
      .then((res) => setNotifications(res.data.data))
      .catch(() => {})
  }, [])

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

  const getMenuItems = () => {
    const role = user?.role_id

    if (role === 1) {
      return [
        { label: 'Manage Centers', path: '/centers', icon: '🏫' },
        { label: 'Notifications', path: '/notifications', icon: '🔔' },
      ]
    }

    if (role === 2) {
      return [
        { label: 'Question Bank', path: '/questions', icon: '❓' },
        { label: 'Exams', path: '/exams', icon: '📝' },
        { label: 'Notifications', path: '/notifications', icon: '🔔' },
      ]
    }

    if (role === 3) {
      return [
        { label: 'Question Bank', path: '/questions', icon: '❓' },
        { label: 'Exams', path: '/exams', icon: '📝' },
        { label: 'Notifications', path: '/notifications', icon: '🔔' },
      ]
    }

    if (role === 5) {
      return [
        { label: 'My Exams', path: '/exams', icon: '📝' },
        { label: 'Notifications', path: '/notifications', icon: '🔔' },
      ]
    }

    return [
      { label: 'Notifications', path: '/notifications', icon: '🔔' },
    ]
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="bg-indigo-600 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-white text-indigo-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
            SQ
          </div>
          <span className="font-bold text-lg">
            Smart Question Maker
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm">
            {user?.name}
          </span>
          <button
            onClick={handleLogout}
            className="bg-white text-indigo-600 px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-indigo-50 transition"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main content */}
      <div className="max-w-6xl mx-auto p-6">

        {/* Welcome banner */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-gray-500 mt-1">
            Role: {getRoleName(user?.role_id)}
          </p>
        </div>

        {/* Notifications banner */}
        {notifications.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6 flex justify-between items-center">
            <p className="text-yellow-700 font-medium">
              🔔 You have {notifications.length} unread notification(s)
            </p>
            <Link
              to="/notifications"
              className="text-yellow-700 underline text-sm"
            >
              View all
            </Link>
          </div>
        )}

        {/* Menu cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {getMenuItems().map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className="bg-white rounded-2xl shadow p-6 flex flex-col items-center justify-center hover:shadow-lg hover:bg-indigo-50 transition cursor-pointer"
            >
              <span className="text-4xl mb-3">{item.icon}</span>
              <span className="font-semibold text-gray-700 text-lg">
                {item.label}
              </span>
            </Link>
          ))}
        </div>

      </div>
    </div>
  )
}

export default Dashboard