import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  getCentersStats, 
  getUsersStats, 
  getAllSubscriptionPlans,
  getUnreadNotifications 
} from "../../services/api";
import { FiHome, FiCreditCard, FiBell, FiUsers, FiEye } from "react-icons/fi";

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeCenters: 0,
    pendingApplications: 0,
    totalUsers: 0,
    totalPlans: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [centersRes, usersRes, plansRes, n] = await Promise.all([
          getCentersStats(),
          getUsersStats(),
          getAllSubscriptionPlans(),
          getUnreadNotifications(),
        ]);
        setStats({
          activeCenters: centersRes.data.data.active,
          pendingApplications: centersRes.data.data.pending,
          totalUsers: usersRes.data.data.total,
          totalPlans: plansRes.data.data.length,
        });
      } catch (err) {
        console.error('Dashboard fetch error', err);
      }
    };
    fetchData();
  }, []);

  const menuItems = [
    {
      label: "Manage Centers",
      path: "/superadmin/manage-centers",
      icon: FiHome,
      color: "from-blue-500 to-cyan-500",
      desc: `${stats.activeCenters} active centers`,
    },
    {
      label: "View Applications",
      path: "/superadmin/view-applications",
      icon: FiEye,
      color: "from-amber-500 to-orange-500",
      desc: `${stats.pendingApplications} pending`,
    },
    {
      label: "Subscription Plans",
      path: "/superadmin/manage-subscription-plans",
      icon: FiCreditCard,
      color: "from-purple-500 to-pink-500",
      desc: "Manage platform plans",
    },
    {
      label: "Manage Users",
      path: "/superadmin/users",
      icon: FiUsers,
      color: "from-indigo-500 to-blue-500",
      desc: `${stats.totalUsers} total users`,
    },
    {
      label: "Notifications",
      path: "/notifications",
      icon: FiBell,
      color: "from-rose-500 to-pink-500",
      desc: "Platform notifications",
    },
  ];

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Super Admin{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            Dashboard
          </span>
        </h1>
        <p className="text-gray-400">Platform overview and management</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Active Centers",
            value: stats.activeCenters || 0,
            color: "text-emerald-400",
          },
          {
            label: "Pending Applications",
            value: stats.pendingApplications || 0,
            color: "text-amber-400",
          },
          {
            label: "Total Users",
            value: stats.totalUsers || 0,
            color: "text-blue-400",
          },
          {
            label: "Subscription Plans",
            value: stats.totalPlans || 0,
            color: "text-purple-400",
          },
        ].map((s, i) => (
          <div
            key={i}
            className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center hover:bg-white/10 hover:cursor-pointer transition-all hover:scale-[1.02]"
            onClick={() => {
              if (s.label === 'Active Centers') {
                navigate('/superadmin/manage-centers?filter=active');
              } else if (s.label === 'Pending Applications') {
                navigate('/superadmin/view-applications');
              } else if (s.label === 'Total Users') {
                navigate('/superadmin/users');
              } else if (s.label === 'Subscription Plans') {
                navigate('/superadmin/manage-subscription-plans');
              }
            }}
          >
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-gray-400 text-sm mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {menuItems.map((item, i) => (
          <Link
            key={i}
            to={item.path}
            className="group bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:bg-white/[0.07]"
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

export default SuperAdminDashboard;

