import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import Navbar from "./Navbar.jsx";
import Sidebar from "./Sidebar.jsx";

const Layout = ({ children }) => {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleCollapse = () => setCollapsed(!collapsed);
  const toggleMobile = () => setMobileOpen(!mobileOpen);
  const handleClose = () => setMobileOpen(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!user) return children;

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <Navbar
        collapsed={collapsed}
        toggleCollapse={toggleCollapse}
        toggleMobile={toggleMobile}
      />

      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onClose={handleClose}
      />

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 lg:hidden"
          onClick={handleClose}
        />
      )}

      {/* Main Content */}
      <main
        className={`transition-all duration-300 pt-20 lg:pt-20 min-h-[calc(100vh-5rem)] ${
          collapsed ? "lg:ml-20" : "lg:ml-64"
        } p-6 lg:p-8 overflow-auto z-0`}


      >
        {children}
      </main>
    </div>
  );
};

export default Layout;
