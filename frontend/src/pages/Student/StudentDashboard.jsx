import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllExams, getUnreadNotifications } from "../../services/api";
import {
  FiBook,
  FiFileText,
  FiBarChart2,
  FiBell,
  FiUser,
  FiZap,
} from "react-icons/fi";

const StudentDashboard = () => {
  const [stats, setStats] = useState({ exams: 0, notifications: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [e, n] = await Promise.all([
          getAllExams(),
          getUnreadNotifications(),
        ]);
        setStats({
          exams: e.data.data.length,
          notifications: n.data.data.length,
        });
      } catch {}
    };
    fetchStats();
  }, []);

  const menuItems = [
    {
      label: "My Exams",
      path: "/student/exams",
      icon: FiFileText,
      color: "from-blue-600 to-cyan-600",
      desc: "View scheduled exams",
    },
    {
      label: "Join Live Quiz",
      path: "/student/join-quiz",
      icon: FiZap,
      color: "from-emerald-600 to-teal-600",
      desc: "Join with access code",
    },
    {
      label: "My Results",
      path: "/student/my-results",
      icon: FiBarChart2,
      color: "from-purple-600 to-pink-600",
      desc: "View your performance",
    },
    {
      label: "Study Materials",
      path: "/student/study-materials",
      icon: FiBook,
      color: "from-amber-600 to-orange-600",
      desc: "Access learning resources",
    },
    {
      label: "Notifications",
      path: "/notifications",
      icon: FiBell,
      color: "from-rose-600 to-pink-600",
      desc: `${stats.notifications} unread`,
    },
    {
      label: "Profile",
      path: "/profile",
      icon: FiUser,
      color: "from-gray-600 to-gray-700",
      desc: "Manage your profile",
    },
  ];

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
            Student Dashboard
          </span>
        </h1>
        <p className="text-gray-400">Your learning command center</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Available Exams",
            value: stats.exams,
            color: "text-blue-400",
          },
          {
            label: "Notifications",
            value: stats.notifications,
            color: "text-amber-400",
          },
        ].map((s, i) => (
          <div
            key={i}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center"
          >
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-gray-400 text-sm mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item, i) => (
          <Link
            key={i}
            to={item.path}
            className="group bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl p-8 transition-all hover:-translate-y-2 hover:bg-white/[0.07]"
          >
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
            >
              <item.icon className="text-white text-xl" />
            </div>
            <h3 className="text-white font-bold mb-1">{item.label}</h3>
            <p className="text-gray-500 text-sm">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default StudentDashboard;
