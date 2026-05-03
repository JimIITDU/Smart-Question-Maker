import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { FiMenu, FiBell, FiChevronLeft, FiChevronRight, FiLogOut } from 'react-icons/fi';

const Navbar = ({ collapsed, toggleCollapse, toggleMobile }) => {
  const { user, logoutUser } = useAuth();

  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    return (names[0][0] + (names[1]?.[0] || '')).toUpperCase();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-20 border-b border-white/10 bg-[#030712]/95 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleMobile}
            className="lg:hidden p-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl"
          >
            <FiMenu className="w-5 h-5" />
          </button>

          <button
            onClick={toggleCollapse}
            className="hidden lg:block p-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl"
          >
            {collapsed ? <FiChevronRight className="w-5 h-5" /> : <FiChevronLeft className="w-5 h-5" />}
          </button>

          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              SmartQ
            </h1>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          <Link to="/notifications" className="relative p-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all">
            <FiBell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-[10px] font-bold rounded-full flex items-center justify-center">
              3
            </span>
          </Link>

          <Link to="/profile" className="flex items-center gap-3 hover:bg-white/5 p-2 pr-4 rounded-2xl transition-all group">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold ring-2 ring-white/30">
              {getInitials(user?.name)}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
          </Link>

          <button
            onClick={logoutUser}
            className="flex items-center gap-2 px-5 py-2.5 text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all"
          >
            <FiLogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;