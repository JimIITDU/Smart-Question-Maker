import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  FiHome,
  FiFileText,
  FiGrid,
  FiUsers,
  FiDollarSign,
  FiBarChart2,
  FiBookOpen,
  FiAward,
  FiZap,
  FiUpload,
  FiTrendingUp,
  FiPlayCircle,
  FiCalendar,
  FiEdit3,
  FiShoppingCart,
  FiX,
  FiLogOut,
} from "react-icons/fi";

const Sidebar = ({ collapsed, mobileOpen, onClose }) => {
  const { user, logoutUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    const currentPath = location.pathname;
    
    // Exact match for most routes
    if (path === currentPath) return true;
    
    // Special logic for /teacher questions
    if (path === '/teacher' && currentPath === '/teacher') return true;
    if (path === '/teacher/questions' && currentPath === '/teacher/questions') return true;
    
    return false;
  };

  if (!user) return null;

  const roleMenus = {
    1: [ // Super Admin
      { type: "group", label: "Platform" },
      { path: "/superadmin", label: "Dashboard", icon: FiHome },
      { path: "/superadmin/manage-centers", label: "Manage Centers", icon: FiUsers },
{ path: "/superadmin/manage-subscription-plans", label: "Subscription Plans", icon: FiDollarSign },
      { path: "/superadmin/users", label: "Manage Users", icon: FiUsers },
    ],
    2: [ // Coaching Admin
      { type: "group", label: "Dashboard" },
      { path: "/coachingadmin", label: "Dashboard", icon: FiHome },
      { type: "group", label: "Management" },
      { path: "/coachingadmin/manage-teachers", label: "Teachers", icon: FiUsers },
      { path: "/coachingadmin/manage-students", label: "Students", icon: FiUsers },
      { path: "/coachingadmin/manage-staff", label: "Staff", icon: FiUsers },
      { path: "/coachingadmin/manage-courses", label: "Courses", icon: FiBookOpen },
      { path: "/coachingadmin/manage-batches", label: "Batches", icon: FiCalendar },
      { path: "/coachingadmin/manage-subjects", label: "Subjects", icon: FiEdit3 },
      { type: "group", label: "Finance" },
      { path: "/coachingadmin/fee-management", label: "Fee Management", icon: FiDollarSign },
      { path: "/coachingadmin/subscription-management", label: "Subscriptions", icon: FiShoppingCart },
    ],
    3: [ // Teacher
      { type: "group", label: "Content" },
      { path: "/teacher", label: "Dashboard", icon: FiHome },
      { path: "/teacher/questions", label: "Question Bank", icon: FiGrid },
      { path: "/teacher/questions/ai-generate", label: "AI Generator", icon: FiZap },
      { type: "group", label: "Exams" },
      { path: "/teacher/exams", label: "Manage Exams", icon: FiFileText },
      { path: "/teacher/live-quiz", label: "Live Quiz", icon: FiPlayCircle },
      { type: "group", label: "Analytics & Others" },
      { path: "/teacher/analytics", label: "Analytics", icon: FiTrendingUp },
      { path: "/teacher/upload-material", label: "Upload Material", icon: FiUpload },
    ],
    4: [ // Staff
      { type: "group", label: "Dashboard" },
      { path: "/coachingadmin", label: "Dashboard", icon: FiHome },
      { path: "/coachingadmin/manage-students", label: "Students", icon: FiUsers },
      { path: "/coachingadmin/manage-courses", label: "Courses", icon: FiBookOpen },
    ],
    5: [ // Student
      { type: "group", label: "Dashboard" },
      { path: "/student", label: "Dashboard", icon: FiHome },
      { path: "/student/my-courses", label: "My Courses", icon: FiBookOpen },
      { path: "/student/browse-courses", label: "Browse Courses", icon: FiGrid },
      { path: "/student/study-materials", label: "Study Materials", icon: FiFileText },
      { path: "/student/exams", label: "Exams", icon: FiAward },
      { type: "group", label: "Results" },
      { path: "/student/my-results", label: "My Results", icon: FiBarChart2 },
    ],
    6: [ // Parent
      { type: "group", label: "Dashboard" },
      { path: "/parent", label: "Dashboard", icon: FiHome },
      { path: "/parent/child-results", label: "Child Results", icon: FiBarChart2 },
    ],
  };

  const menuItems = roleMenus[user.role_id] || roleMenus[3];

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
    onClose?.();
  };

  return (
    <aside
      className={`
        fixed top-20 bottom-0 left-0 z-40 border-r border-white/10 bg-[#030712]
        transition-all duration-300 overflow-y-auto
        ${collapsed ? "w-20" : "w-64"}
        ${mobileOpen ? "lg:hidden w-full" : "hidden lg:block"}
      `}
    >
      {/* Mobile Header */}
{mobileOpen && (
        <div className="lg:hidden p-4 border-b border-white/10 flex justify-between items-center">
          <span className="text-lg font-bold text-white">Menu</span>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            <FiX className="w-6 h-6" />
          </button>
        </div>
      )}



      {/* Desktop Logo - Removed as per feedback */}


      <div className="pt-6 px-3 pb-6">
        <nav className="space-y-1">
          {menuItems.map((item, index) =>
            item.type === "group" ? (
              <div
                key={index}
                className={`px-4 py-3 text-xs font-semibold uppercase tracking-widest text-gray-500 ${
                  collapsed ? "hidden" : ""
                }`}
              >
                {item.label}
              </div>
            ) : (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all group relative ${
                  isActive(item.path)
                    ? "bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-l-2 border-purple-500 text-white"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                } ${collapsed ? "justify-center px-2" : ""}`}
                title={collapsed ? item.label : ""}
              >
                <item.icon
                  className={`text-xl flex-shrink-0 transition-colors ${
                    isActive(item.path) ? "text-purple-400" : ""
                  }`}
                />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          )}
        </nav>
      </div>



      {/* No logout - navbar only */}


    </aside>
  );
};

export default Sidebar;
