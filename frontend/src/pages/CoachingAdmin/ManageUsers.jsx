import React from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiUsers, FiUserPlus } from "react-icons/fi";

const ManageUsers = () => {
  return (
    <div className="min-h-screen bg-[#030712] text-white">
      

      <main className="max-w-7xl mx-auto px-6 pt-28 pb-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Manage <span className="text-indigo-400">Users</span>
          </h1>
          <p className="text-gray-400">
            Manage all users in your coaching center
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            {
              label: "Teachers",
              path: "/admin/teachers",
              icon: FiUserPlus,
              color: "from-amber-500 to-orange-500",
              desc: "Manage teacher accounts",
            },
            {
              label: "Staff",
              path: "/admin/staff",
              icon: FiUsers,
              color: "from-rose-500 to-pink-500",
              desc: "Manage staff accounts",
            },
            {
              label: "Students",
              path: "/admin/students",
              icon: FiUsers,
              color: "from-emerald-500 to-teal-500",
              desc: "Manage student enrollment",
            },
          ].map((item, i) => (
            <Link
              key={i}
              to={item.path}
              className="group bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl p-6 transition-all hover:-translate-y-1"
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
      </main>
    </div>
  );
};

export default ManageUsers;
