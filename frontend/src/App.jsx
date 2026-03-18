import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'

import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import VerifyOTP from './pages/VerifyOTP.jsx'
import Dashboard from './pages/Dashboard.jsx'
import QuestionBank from './pages/QuestionBank.jsx'
import Exams from './pages/Exams.jsx'
import TakeExam from './pages/TakeExam.jsx'
import Results from './pages/Results.jsx'
import Notifications from './pages/Notifications.jsx'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl font-semibold">Loading...</div>
      </div>
    )
  }
  return user ? children : <Navigate to="/login" />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/questions" element={
          <ProtectedRoute><QuestionBank /></ProtectedRoute>
        } />
        <Route path="/exams" element={
          <ProtectedRoute><Exams /></ProtectedRoute>
        } />
        <Route path="/exams/:id/take" element={
          <ProtectedRoute><TakeExam /></ProtectedRoute>
        } />
        <Route path="/results/:id" element={
          <ProtectedRoute><Results /></ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute><Notifications /></ProtectedRoute>
        } />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App