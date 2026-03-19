import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from '../services/api'

const Notifications = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications()
      setNotifications(res.data.data)
    } catch (err) {
      setError('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id)
      fetchNotifications()
    } catch (err) {}
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
      fetchNotifications()
    } catch (err) {}
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'exam': return 'bg-indigo-100 text-indigo-600'
      case 'quiz': return 'bg-purple-100 text-purple-600'
      case 'fee': return 'bg-yellow-100 text-yellow-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="bg-indigo-600 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-white text-indigo-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
            SQ
          </div>
          <span className="font-bold text-lg">Smart Question Maker</span>
        </div>
        <Link
          to="/dashboard"
          className="bg-white text-indigo-600 px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-indigo-50 transition"
        >
          ← Dashboard
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto p-6">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Notifications
          </h1>
          {notifications.some((n) => n.status === 'unread') && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-indigo-600 text-sm font-semibold hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-10 text-gray-500">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No notifications yet!
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.notification_id}
                className={`bg-white rounded-2xl shadow p-4 flex justify-between items-start ${
                  n.status === 'unread' ? 'border-l-4 border-indigo-500' : ''
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getTypeColor(n.type)}`}>
                      {n.type}
                    </span>
                    {n.status === 'unread' && (
                      <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                    )}
                  </div>
                  <p className="text-gray-800">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                </div>
                {n.status === 'unread' && (
                  <button
                    onClick={() => handleMarkAsRead(n.notification_id)}
                    className="ml-4 text-xs text-indigo-600 hover:underline"
                  >
                    Mark read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Notifications