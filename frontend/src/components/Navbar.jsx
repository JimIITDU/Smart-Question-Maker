import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { FiMenu, FiSearch, FiBell, FiChevronLeft, FiChevronRight, FiLogOut } from 'react-icons/fi';

const Navbar = ({ collapsed, toggleCollapse, toggleMobile }) => {
  const { user, logoutUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const unreadCount = 0; // Unread notifications (non-red)

  const getRoleName = (roleId) => {
    const id = roleId || user?.role_id || user?.role;
    const roles = {
      1: 'Super Admin',
      2: 'Coaching Admin',
      3: 'Teacher',
      5: 'Student',
      6: 'Parent'
    };
    return roles[id] || 'User';
  };

  const getDashboardLink = () => {
    const roleId = user?.role_id || user?.role;
    if (roleId === 1) return '/superadmin';
    if (roleId === 2) return '/coachingadmin';
    if (roleId === 3) return '/teacher';
    if (roleId === 5) return '/student';
    if (roleId === 6) return '/parent';
    return '/dashboard';
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    return (names[0][0] + (names[1]?.[0] || '')).toUpperCase();
  };

  const generateBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter(x => x);
    
    const mainRoutes = ['dashboard', 'superadmin', 'coachingadmin', 'teacher', 'student', 'parent'];
    if (pathnames.length <= 1 && mainRoutes.includes(pathnames[0])) {
      return null;
    }

    return (
      <div className="hidden md:flex items-center text-xs font-medium text-gray-500 mt-1 space-x-1">
        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          
          const isId = !isNaN(name) || name.match(/^[0-9a-fA-F]{24}$/);
          const displayName = isId ? 'Details' : name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ');

          return (
            <React.Fragment key={routeTo}>
              {!index ? null : <span className="text-gray-700">/</span>}
              {isLast ? (
                <span className="text-purple-400 font-medium">{displayName}</span>
              ) : (
                <Link to={routeTo} className="hover:text-gray-300 transition-colors">
                  {displayName}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 h-20 border-b border-white/5 bg-[#030712]/80 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="max-w-[1600px] mx-auto px-4 h-full flex items-center justify-between">
        
        {/* LEFT SECTION */}
        <div className="flex items-center gap-4 flex-1">
          {/* Mobile Menu Toggle */}
          <button
            onClick={toggleMobile}
            className="lg:hidden p-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <FiMenu className="w-5 h-5" />
          </button>

          {/* Sidebar Collapse Toggle */}
          <button
            onClick={toggleCollapse}
            className="hidden lg:flex p-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            {collapsed ? <FiChevronRight className="w-5 h-5" /> : <FiChevronLeft className="w-5 h-5" />}
          </button>

          {/* Brand & Breadcrumbs */}
          <div className="flex flex-col justify-center">
            <Link to={getDashboardLink()} className="flex items-center gap-2 group mb-1">
              <h1 className="text-xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity cursor-pointer tracking-tight">
                ProshnoGhor
              </h1>
            </Link>
            {generateBreadcrumbs()}
          </div>
        </div>

        {/* CENTER: Search Bar */}
        <div className="hidden md:flex flex-1 justify-center px-8 max-w-lg">
          <div className="relative w-full group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <FiSearch className="h-4 w-4 text-gray-500 group-focus-within:text-purple-400 transition-colors duration-300" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="block w-full pl-10 pr-4 py-2.5 border border-white/10 rounded-xl leading-5 bg-[#0F172A]/60 text-gray-200 placeholder-gray-500 focus:outline-none focus:bg-[#0F172A]/80 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all shadow-inner"
              placeholder="Search exams, students, or reports..."
            />
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-3 md:gap-4 flex-1 justify-end">
          {/* Notifications */}
          <Link to="/notifications" className="relative p-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all group">
            <FiBell className="w-5 h-5 group-hover:animate-swing" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-pink-500 rounded-full shadow-[0_0_10px_rgba(236,72,153,0.8)] animate-pulse"></span>
            )}
          </Link>

          {/* Profile Section */}
          <div className="flex items-center gap-3 pl-4 border-l border-white/10">
            {/* User Info */}
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-white leading-tight truncate max-w-[120px]">
                {user?.name || 'User'}
              </p>
              <p className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-wider">
                {getRoleName()}
              </p>
            </div>
            
            {/* Avatar */}
            <Link to="/profile" className="relative group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-sm ring-2 ring-white/10 group-hover:ring-purple-500/50 group-hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all duration-300">
                {getInitials(user?.name)}
              </div>
            </Link>

            {/* Logout */}
            <button
              onClick={logoutUser}
              className="p-2.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
              title="Logout"
            >
              <FiLogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;