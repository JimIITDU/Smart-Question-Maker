import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from '../services/api'

// --- Icons ---
const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
)

const FileExamIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M8 13h2"/><path d="M8 17h2"/><path d="M14 13h2"/><path d="M14 17h2"/></svg>
)

const QuizIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
)

const DollarSignIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
)

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
)

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
      console.error('fetchNotifications error:', err)
      setError('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id)
      fetchNotifications()
    } catch (err) {
      console.error('markAsRead error:', err)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
      fetchNotifications()
    } catch (err) {
      console.error('markAllAsRead error:', err)
    }
  }

  const getTypeStyle = (type) => {
    switch (type) {
      case 'exam': return { icon: FileExamIcon, color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' }
      case 'quiz': return { icon: QuizIcon, color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' }
      case 'fee': return { icon: DollarSignIcon, color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' }
      default: return { icon: BellIcon, color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' }
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0C15]">
      
{/* --- Ambient Background --- */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <main className="relative z-10 max-w-4xl mx-auto px-6 pt-10 pb-20">

        {/* Header */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Notifications
            </h1>
            <p className="text-gray-400 text-sm">
              Stay updated with the latest activity
            </p>
          </div>
          {notifications.some((n) => n.status === 'unread') && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Mark all as read
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-8 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-2xl bg-[#13151f]/50">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-gray-600">
               <BellIcon />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">All caught up</h3>
            <p className="text-gray-500 text-sm">No new notifications for you.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((n) => {
              const typeStyle = getTypeStyle(n.type)
              const Icon = typeStyle.icon
              const isUnread = n.status === 'unread'

              return (
                <div
                  key={n.notification_id}
                  className={`group relative bg-[#13151f] border rounded-xl p-5 transition-all duration-300 ${
                    isUnread 
                      ? 'border-indigo-500/30 shadow-[0_0_30px_-15px_rgba(99,102,241,0.15)' 
                      : 'border-white/5 hover:border-white/10'
                  }`}
                >
                  {/* Unread Indicator Glow */}
                  {isUnread && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-l-xl animate-pulse"></div>}

                  <div className="flex gap-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${typeStyle.color}`}>
                      <Icon />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-4 mb-1">
                        <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          isUnread ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-white/5 text-gray-500 border-white/10'
                        }`}>
                          {n.type}
                        </span>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {new Date(n.created_at).toLocaleString('en-BD', {
                            timeZone: 'Asia/Dhaka',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      
                      <p className={`text-base leading-relaxed ${isUnread ? 'text-white font-medium' : 'text-gray-400'}`}>
                        {n.message}
                      </p>
                    </div>

                    {/* Action */}
                    {isUnread && (
                      <button
                        onClick={() => handleMarkAsRead(n.notification_id)}
                        className="self-center px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-400 hover:bg-indigo-500/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

export default Notifications
