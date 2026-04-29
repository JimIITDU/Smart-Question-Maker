import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx'; // Adjust path as needed

const Navbar = ({ onLogout }) => {
  const { user } = useAuth();
  const location = useLocation();

  // Helper to determine current page title
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('exams')) return 'Exams';
    if (path.includes('notifications')) return 'Notifications';
    if (path.includes('profile')) return 'Profile';
    if (path.includes('settings')) return 'Settings';
    return 'Dashboard';
  };

  // Helper to get user initials
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#030712]/80 backdrop-blur-xl transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex justify-between items-center">
        
        {/* --- LEFT SIDE: USER PROFILE (Logged In) --- */}
        <div className="flex items-center gap-3">
          {user ? (
            <Link to="/profile" className="flex items-center gap-3 group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300 ring-1 ring-white/10">
                {getInitials(user.name)}
              </div>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-semibold text-white tracking-tight">{user.name}</span>
                {/* 
                   FIX: Removed hardcoded 'Member'. 
                   This now displays whatever role is in your user object (e.g., 'Super Admin').
                   If it still says 'Member', check your AuthContext data.
                */}
                <span className="text-xs font-medium text-blue-400 uppercase tracking-wide">
                  {user?.role || 'User'}
                </span>
              </div>
            </Link>
          ) : (
            // PUBLIC BRAND (If needed for logout state)
            <Link to="/" className="flex items-center space-x-3 group cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <svg className="text-white w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
                  <rect x="9" y="9" width="6" height="6"></rect>
                  <line x1="9" y1="1" x2="9" y2="4"></line>
                  <line x1="15" y1="1" x2="15" y2="4"></line>
                  <line x1="9" y1="20" x2="9" y2="23"></line>
                  <line x1="15" y1="20" x2="15" y2="23"></line>
                  <line x1="20" y1="9" x2="23" y2="9"></line>
                  <line x1="20" y1="14" x2="23" y2="14"></line>
                  <line x1="1" y1="9" x2="4" y2="9"></line>
                  <line x1="1" y1="14" x2="4" y2="14"></line>
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 hidden md:block">
                Smart Coaching
              </span>
            </Link>
          )}
        </div>

        {/* --- CENTER: PAGE TITLE --- */}
        {user && (
          <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2">
            <h1 className="text-sm font-medium text-gray-400">
              {getPageTitle()}
            </h1>
          </div>
        )}

        {/* --- RIGHT SIDE: ACTIONS --- */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-5">
              {/* FIX: Wrapped notification in Link so it works */}
              <Link to="/notifications" className="relative group text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[#030712] group-hover:bg-white transition-colors"></span>
              </Link>

              <button 
                onClick={onLogout} 
                className="text-sm font-medium text-gray-400 hover:text-red-400 transition-colors px-2 py-1"
              >
                Logout
              </button>
            </div>
          ) : (
            // PUBLIC AUTH BUTTONS
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                Log in
              </Link>
              <Link to="/register" className="px-5 py-2.5 bg-white text-gray-900 text-sm font-semibold rounded-full hover:bg-gray-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;