import React from 'react'
import { Link } from 'react-router-dom'

const ErrorPage = ({ code = 404, message = "Page Not Found" }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-indigo-200 mb-4">{code}</h1>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Oops!</h2>
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          {message}
        </p>
        <Link
          to="/dashboard"
          className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
        >
          Go Back to Dashboard
        </Link>
      </div>
    </div>
  )
}

export default ErrorPage