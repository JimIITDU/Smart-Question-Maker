import React from "react";
import { useAuth } from "../context/AuthContext.jsx";
import SuperAdminDashboard from "./SuperAdmin/SuperAdminDashboard.jsx";
import CoachingAdminDashboard from "./CoachingAdmin/CoachingAdminDashboard.jsx";
import TeacherDashboard from "./Teacher/TeacherDashboard.jsx";
import StudentDashboard from "./Student/StudentDashboard.jsx";
import ParentDashboard from "./Parent/ParentDashboard.jsx";

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const role = user?.role_id;

  switch (role) {
    case 1:
      return <SuperAdminDashboard />;
    case 2:
      return <CoachingAdminDashboard />;
    case 3:
      return <TeacherDashboard />;
    case 4:
      return <CoachingAdminDashboard />;
    case 5:
      return <StudentDashboard />;
    case 6:
      return <ParentDashboard />;
    default:
      return (
        <div className="min-h-screen bg-[#030712] flex items-center justify-center">
          <div className="text-white text-xl">
            Role not recognized. Please login again.
          </div>
        </div>
      );
  }
};

export default Dashboard;
