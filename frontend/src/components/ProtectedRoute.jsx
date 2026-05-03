import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-4 text-center text-gray-500">Loading...</div>;
  }

  // If no user is found, redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user exists, render the child route component
  return <Outlet />;
};

export default ProtectedRoute;
