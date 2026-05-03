import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const RoleBasedRoute = ({ allowedRoles }) => {
  const { user } = useAuth();

  // 1. Check if user is logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Check if user's role is in the allowed list
  if (!allowedRoles.includes(user.role_id)) {
    // Redirect to dashboard if they try to access a restricted page
    return <Navigate to="/dashboard" replace />;
  }

  // 3. If all checks pass, render the child route
  return <Outlet />;
};

export default RoleBasedRoute;
