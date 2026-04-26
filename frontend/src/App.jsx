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
import Profile from './pages/Profile.jsx'
import JoinQuiz from './pages/JoinQuiz.jsx'
import UploadPage from './pages/AIGenerate/UploadPage.jsx'
import QuestionsPage from './pages/AIGenerate/QuestionsPage.jsx'
import ResultsPage from './pages/AIGenerate/ResultsPage.jsx'

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
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />

        {/* Protected routes */}
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
        <Route path="/profile" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />
        <Route path="/join-quiz" element={
          <ProtectedRoute><JoinQuiz /></ProtectedRoute>
        } />

        {/* AI Question Generation routes */}
        <Route path="/ai-generate" element={
          <ProtectedRoute><UploadPage /></ProtectedRoute>
        } />
        <Route path="/questions/:sessionId" element={
          <ProtectedRoute><QuestionsPage /></ProtectedRoute>
        } />
        <Route path="/ai-results/:sessionId" element={
          <ProtectedRoute><ResultsPage /></ProtectedRoute>
        } />

        {/* Default */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App