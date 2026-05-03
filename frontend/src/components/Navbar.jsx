import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { FiMenu, FiSearch, FiBell, FiChevronLeft, FiChevronRight, FiLogOut } from 'react-icons/fi';

const Navbar = ({ collapsed, toggleCollapse, toggleMobile }) => {
  const { user, logoutUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const unreadCount = 3; // Static fallback

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
      <div className="hidden md:flex items-center text-xs font-medium text-gray-400 mt-1 space-x-1">
        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          
          const isId = !isNaN(name) || name.match(/^[0-9a-fA-F]{24}$/);
          const displayName = isId ? 'Details' : name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ');

          return (
            <React.Fragment key={routeTo}>
              {!index ? null : <span className="text-gray-600">/</span>}
              {isLast ? (
                <span className="text-blue-400 font-medium">{displayName}</span>
              ) : (
                <Link to={routeTo} className="hover:text-white transition-colors">
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
    <nav className="fixed top-0 left-0 right-0 z-50 h-20 border-b border-white/10 bg-[#030712]/95 backdrop-blur-xl">
      <div className="max-w-[1600px] mx-auto px-4 h-full flex items-center justify-between">
        
        {/* LEFT SECTION */}
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={toggleMobile}
            className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <FiMenu className="w-5 h-5" />
          </button>

          <button
            onClick={toggleCollapse}
            className="hidden lg:flex p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            {collapsed ? <FiChevronRight className="w-5 h-5" /> : <FiChevronLeft className="w-5 h-5" />}
          </button>

          <div className="flex flex-col justify-center">
            <Link to={getDashboardLink()} className="flex items-center gap-2 group mb-1">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity cursor-pointer">
                ProshnoGhor
              </h1>
            </Link>
            {generateBreadcrumbs()}
          </div>
        </div>

        {/* CENTER: Search */}
        <div className="hidden md:flex flex-1 justify-center px-8 max-w-md">
          <div className="relative w-full group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-4 w-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="block w-full pl-10 pr-3 py-2 border border-white/10 rounded-lg leading-5 bg-white/5 text-gray-300 placeholder-gray-500 focus:outline-none focus:bg-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
              placeholder="Search questions, exams..."
            />
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-2 md:gap-4 flex-1 justify-end">
          <Link to="/notifications" className="relative p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all">
            <FiBell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-xs rounded-full flex items-center justify-center text-white font-bold animate-pulse">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>

          <div className="flex items-center gap-3 pl-2 border-l border-white/10">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-white leading-tight truncate max-w-[120px]">
                {user?.name || 'User'}
              </p>
              <p className="text-[10px] md:text-xs text-blue-400 font-semibold uppercase tracking-wider">
                {getRoleName()}
              </p>
            </div>
            
            <Link to="/profile" className="relative group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold ring-2 ring-white/20 group-hover:ring-blue-400 transition-all">
                {getInitials(user?.name)}
              </div>
            </Link>

            <button
              onClick={logoutUser}
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
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

