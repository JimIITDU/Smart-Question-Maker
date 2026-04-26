import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getUnreadNotifications } from '../services/api'

// --- Icon Components (Inline for portability) ---
const Icons = {
  Building: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>
  ),
  Bell: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
  ),
  HelpCircle: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
  ),
  FileText: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
  ),
  LogOut: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
  )
}

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
        { label: 'Manage Centers', path: '/centers', icon: Icons.Building, color: 'from-pink-500 to-rose-500' },
        { label: 'Notifications', path: '/notifications', icon: Icons.Bell, color: 'from-amber-400 to-orange-500' },
      ]
    }

    if (role === 2) {
      return [
        { label: 'Question Bank', path: '/questions', icon: Icons.HelpCircle, color: 'from-blue-500 to-cyan-500' },
        { label: 'Exams', path: '/exams', icon: Icons.FileText, color: 'from-violet-500 to-purple-500' },
        { label: 'Notifications', path: '/notifications', icon: Icons.Bell, color: 'from-amber-400 to-orange-500' },
      ]
    }

    if (role === 3) {
      return [
        { label: 'Question Bank', path: '/questions', icon: Icons.HelpCircle, color: 'from-blue-500 to-cyan-500' },
        { label: 'Exams', path: '/exams', icon: Icons.FileText, color: 'from-violet-500 to-purple-500' },
        { label: 'Notifications', path: '/notifications', icon: Icons.Bell, color: 'from-amber-400 to-orange-500' },
      ]
    }

    if (role === 5) {
      return [
        { label: 'My Exams', path: '/exams', icon: Icons.FileText, color: 'from-violet-500 to-purple-500' },
        { label: 'Notifications', path: '/notifications', icon: Icons.Bell, color: 'from-amber-400 to-orange-500' },
      ]
    }

    return [
      { label: 'Notifications', path: '/notifications', icon: Icons.Bell, color: 'from-amber-400 to-orange-500' },
    ]
  }

  return (
    <div className="min-h-screen bg-[#0B0C15] text-white font-sans selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      
      {/* --- Ambient Background Effects --- */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Navbar */}
<nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0B0C15]/70 backdrop-blur-xl">
  <div className="max-w-6xl mx-auto px-6 h-20 flex justify-between items-center">
    {/* ... Left side Logo ... */}
    
    {/* RIGHT SIDE - User Menu */}
    <div className="flex items-center gap-6">
      
      {/* --- CLICKABLE LINK TO PROFILE --- */}
      <Link 
        to="/profile" 
        className="flex items-center gap-3 group cursor-pointer"
      >
        {/* Avatar Circle */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center font-bold text-white border-2 border-white/10 shadow-lg group-hover:scale-105 transition-transform">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        
        {/* Name */}
        <div className="hidden md:block text-right">
          <p className="text-sm font-medium text-white group-hover:text-indigo-400 transition-colors">
            {user?.name}
          </p>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">
            View Profile
          </p>
        </div>
      </Link>
      {/* --- END LINK --- */}

      <button
        onClick={handleLogout}
        className="text-gray-500 hover:text-red-400 transition-colors"
        title="Logout"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
      </button>

    </div>
  </div>
</nav>

      {/* --- Main Content --- */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-20">

        {/* --- Welcome Section --- */}
        <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
            Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-indigo-400">{user?.name}</span> 👋
          </h1>
          <p className="text-gray-400 text-lg">Ready to conquer your goals today?</p>
        </div>

        {/* --- Notifications Alert (Modern Glass Style) --- */}
        {notifications.length > 0 && (
          <div className="mb-10 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            <Link
              to="/notifications"
              className="group relative block w-full p-1 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 transition-all duration-500"
            >
              <div className="bg-[#0B0C15]/80 backdrop-blur-md rounded-xl p-4 flex items-center justify-between border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform duration-300">
                    <Icons.Bell />
                  </div>
                  <div>
                    <p className="text-amber-200 font-medium">
                      You have {notifications.length} unread notification{notifications.length > 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Tap to view updates</p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-gray-400 group-hover:text-white group-hover:border-white/30 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* --- Bento Grid Menu --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getMenuItems().map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className="group relative bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl p-8 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-95 duration-700"
              style={{ animationDelay: `${(index + 1) * 100}ms` }}
            >
              {/* Glow Effect on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
              
              {/* Glow Blob */}
              <div className={`absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br ${item.color} blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity duration-500`}></div>

              <div className="relative z-10 flex flex-col h-full">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-lg shadow-black/20 mb-6 group-hover:scale-105 transition-transform duration-300`}>
                  <item.icon />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all">
                  {item.label}
                </h3>
                
                <p className="text-sm text-gray-500 mt-auto pt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  Access now
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </p>
              </div>
            </Link>
          ))}
        </div>

      </main>
    </div>
  )
}

export default Dashboard