import React from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-[#030712] text-white font-sans">
      {/* <Sidebar /> */}
      <div className="flex-1 flex flex-col">
        {/* <Navbar /> */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout