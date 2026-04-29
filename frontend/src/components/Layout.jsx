import React from 'react'
import Navbar from './Navbar.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const Layout = ({ children }) => {
  const { logoutUser } = useAuth()

  const handleLogout = () => {
    logoutUser()
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white font-sans">
      <Navbar onLogout={handleLogout} />
      <main className="pt-20 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}

export default Layout
