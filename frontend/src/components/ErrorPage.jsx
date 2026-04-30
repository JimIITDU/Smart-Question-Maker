import React from 'react'
import { Link } from 'react-router-dom'

const ErrorPage = ({ code = 404, message = "Page Not Found" }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030712] relative overflow-hidden px-4">
      {/* Ambient Background Glows (Matching the CreateExam aesthetic) */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 text-center max-w-lg w-full">
        
        {/* Large Ghosted Error Code */}
        <h1 className="text-[120px] md:text-[150px] font-bold leading-none mb-2 text-transparent bg-clip-text bg-gradient-to-b from-white/20 to-transparent">
          {code}
        </h1>

        {/* Glassmorphism Card */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-8 md:p-12 shadow-2xl">
          <h2 className="text-3xl font-bold text-white mb-4">Oops!</h2>
          <p className="text-gray-400 mb-8 text-lg leading-relaxed">
            {message}
          </p>

          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center w-full px-8 py-4 text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl font-bold hover:shadow-lg hover:shadow-purple-500/20 transition-all transform hover:-translate-y-1"
          >
            Go Back to Dashboard
          </Link>
        </div>

      </div>
    </div>
  )
}

export default ErrorPage