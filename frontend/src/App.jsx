import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import HomePage from './pages/Homepage.jsx'

// Existing pages
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

        {/* Default */}
        <Route path="/" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

// Existing pages
// import Login from './pages/Login.jsx'
// import Register from './pages/Register.jsx'
// import VerifyOTP from './pages/VerifyOTP.jsx'
// import Dashboard from './pages/Dashboard.jsx'
// import QuestionBank from './pages/QuestionBank.jsx'
// import Exams from './pages/Exams.jsx'
// import TakeExam from './pages/TakeExam.jsx'
// import Results from './pages/Results.jsx'
// import Notifications from './pages/Notifications.jsx'
// import Profile from './pages/Profile.jsx'
// import JoinQuiz from './pages/JoinQuiz.jsx'

// // New pages
// import HomePage from './pages/HomePage.jsx'
// import ForgotPassword from './pages/ForgotPassword.jsx'
// import ResetPassword from './pages/ResetPassword.jsx'
// import SuperAdminDashboard from './pages/SuperAdminDashboard.jsx'
// import ManageCenters from './pages/ManageCenters.jsx'
// import CenterDetails from './pages/CenterDetails.jsx'
// import ManageSubscriptionPlans from './pages/ManageSubscriptionPlans.jsx'
// import CoachingAdminDashboard from './pages/CoachingAdminDashboard.jsx'
// import ApplyForCenter from './pages/ApplyForCenter.jsx'
// import ManageCourses from './pages/ManageCourses.jsx'
// import ManageBatches from './pages/ManageBatches.jsx'
// import ManageSubjects from './pages/ManageSubjects.jsx'
// import ManageUsers from './pages/ManageUsers.jsx'
// import ManageStudents from './pages/ManageStudents.jsx'
// import ManageTeachers from './pages/ManageTeachers.jsx'
// import ManageStaff from './pages/ManageStaff.jsx'
// import FeeManagement from './pages/FeeManagement.jsx'
// import SubscriptionManagement from './pages/SubscriptionManagement.jsx'
// import TeacherDashboard from './pages/TeacherDashboard.jsx'
// import CreateQuestion from './pages/CreateQuestion.jsx'
// import EditQuestion from './pages/EditQuestion.jsx'
// import CreateExam from './pages/CreateExam.jsx'
// import ManageExams from './pages/ManageExams.jsx'
// import ExamDetails from './pages/ExamDetails.jsx'
// import LiveQuiz from './pages/LiveQuiz.jsx'
// import Analytics from './pages/Analytics.jsx'
// import UploadMaterial from './pages/UploadMaterial.jsx'
// import AIQuestionGenerator from './pages/AIQuestionGenerator.jsx'
// import StudentDashboard from './pages/StudentDashboard.jsx'
// import MyResults from './pages/MyResults.jsx'
// import StudyMaterials from './pages/StudyMaterials.jsx'
// import ParentDashboard from './pages/ParentDashboard.jsx'
// import ChildResults from './pages/ChildResults.jsx'

// const ProtectedRoute = ({ children }) => {
//   const { user, loading } = useAuth()
//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-screen bg-[#030712]">
//         <div className="text-xl font-semibold text-white">Loading...</div>
//       </div>
//     )
//   }
//   return user ? children : <Navigate to="/login" />
// }

// const RoleRoute = ({ children, roles }) => {
//   const { user, loading } = useAuth()
//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-screen bg-[#030712]">
//         <div className="text-xl font-semibold text-white">Loading...</div>
//       </div>
//     )
//   }
//   if (!user) return <Navigate to="/login" />
//   if (!roles.includes(user.role_name)) return <Navigate to="/dashboard" />
//   return children
// }

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>

//         {/* Public routes */}
//         <Route path="/" element={<HomePage />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/register" element={<Register />} />
//         <Route path="/verify-otp" element={<VerifyOTP />} />
//         <Route path="/forgot-password" element={<ForgotPassword />} />
//         <Route path="/reset-password" element={<ResetPassword />} />

//         {/* General protected routes */}
//         <Route path="/dashboard" element={
//           <ProtectedRoute><Dashboard /></ProtectedRoute>
//         } />
//         <Route path="/profile" element={
//           <ProtectedRoute><Profile /></ProtectedRoute>
//         } />
//         <Route path="/notifications" element={
//           <ProtectedRoute><Notifications /></ProtectedRoute>
//         } />

//         {/* Super Admin routes */}
//         <Route path="/super-admin" element={
//           <RoleRoute roles={['super_admin']}><SuperAdminDashboard /></RoleRoute>
//         } />
//         <Route path="/super-admin/centers" element={
//           <RoleRoute roles={['super_admin']}><ManageCenters /></RoleRoute>
//         } />
//         <Route path="/super-admin/centers/:id" element={
//           <RoleRoute roles={['super_admin']}><CenterDetails /></RoleRoute>
//         } />
//         <Route path="/super-admin/subscriptions" element={
//           <RoleRoute roles={['super_admin']}><ManageSubscriptionPlans /></RoleRoute>
//         } />

//         {/* Coaching Admin routes */}
//         <Route path="/admin" element={
//           <RoleRoute roles={['coaching_admin']}><CoachingAdminDashboard /></RoleRoute>
//         } />
//         <Route path="/admin/apply" element={
//           <RoleRoute roles={['coaching_admin']}><ApplyForCenter /></RoleRoute>
//         } />
//         <Route path="/admin/courses" element={
//           <RoleRoute roles={['coaching_admin', 'staff']}><ManageCourses /></RoleRoute>
//         } />
//         <Route path="/admin/batches" element={
//           <RoleRoute roles={['coaching_admin', 'staff']}><ManageBatches /></RoleRoute>
//         } />
//         <Route path="/admin/subjects" element={
//           <RoleRoute roles={['coaching_admin', 'staff']}><ManageSubjects /></RoleRoute>
//         } />
//         <Route path="/admin/users" element={
//           <RoleRoute roles={['coaching_admin']}><ManageUsers /></RoleRoute>
//         } />
//         <Route path="/admin/students" element={
//           <RoleRoute roles={['coaching_admin', 'staff']}><ManageStudents /></RoleRoute>
//         } />
//         <Route path="/admin/teachers" element={
//           <RoleRoute roles={['coaching_admin']}><ManageTeachers /></RoleRoute>
//         } />
//         <Route path="/admin/staff" element={
//           <RoleRoute roles={['coaching_admin']}><ManageStaff /></RoleRoute>
//         } />
//         <Route path="/admin/fees" element={
//           <RoleRoute roles={['coaching_admin', 'staff']}><FeeManagement /></RoleRoute>
//         } />
//         <Route path="/admin/subscription" element={
//           <RoleRoute roles={['coaching_admin']}><SubscriptionManagement /></RoleRoute>
//         } />

//         {/* Teacher routes */}
//         <Route path="/teacher" element={
//           <RoleRoute roles={['teacher']}><TeacherDashboard /></RoleRoute>
//         } />
//         <Route path="/questions" element={
//           <RoleRoute roles={['teacher']}><QuestionBank /></RoleRoute>
//         } />
//         <Route path="/questions/create" element={
//           <RoleRoute roles={['teacher']}><CreateQuestion /></RoleRoute>
//         } />
//         <Route path="/questions/edit/:id" element={
//           <RoleRoute roles={['teacher']}><EditQuestion /></RoleRoute>
//         } />
//         <Route path="/questions/ai-generate" element={
//           <RoleRoute roles={['teacher']}><AIQuestionGenerator /></RoleRoute>
//         } />
//         <Route path="/exams/create" element={
//           <RoleRoute roles={['teacher']}><CreateExam /></RoleRoute>
//         } />
//         <Route path="/exams/manage" element={
//           <RoleRoute roles={['teacher']}><ManageExams /></RoleRoute>
//         } />
//         <Route path="/exams/:id/details" element={
//           <RoleRoute roles={['teacher']}><ExamDetails /></RoleRoute>
//         } />
//         <Route path="/live-quiz" element={
//           <RoleRoute roles={['teacher']}><LiveQuiz /></RoleRoute>
//         } />
//         <Route path="/analytics" element={
//           <RoleRoute roles={['teacher']}><Analytics /></RoleRoute>
//         } />
//         <Route path="/materials/upload" element={
//           <RoleRoute roles={['teacher']}><UploadMaterial /></RoleRoute>
//         } />

//         {/* Student routes */}
//         <Route path="/student" element={
//           <RoleRoute roles={['student']}><StudentDashboard /></RoleRoute>
//         } />
//         <Route path="/exams" element={
//           <RoleRoute roles={['student']}><Exams /></RoleRoute>
//         } />
//         <Route path="/exams/:id/take" element={
//           <RoleRoute roles={['student']}><TakeExam /></RoleRoute>
//         } />
//         <Route path="/results/:id" element={
//           <RoleRoute roles={['student']}><Results /></RoleRoute>
//         } />
//         <Route path="/my-results" element={
//           <RoleRoute roles={['student']}><MyResults /></RoleRoute>
//         } />
//         <Route path="/materials" element={
//           <RoleRoute roles={['student']}><StudyMaterials /></RoleRoute>
//         } />
//         <Route path="/join-quiz" element={
//           <RoleRoute roles={['student']}><JoinQuiz /></RoleRoute>
//         } />

//         {/* Parent routes */}
//         <Route path="/parent" element={
//           <RoleRoute roles={['parent']}><ParentDashboard /></RoleRoute>
//         } />
//         <Route path="/parent/results" element={
//           <RoleRoute roles={['parent']}><ChildResults /></RoleRoute>
//         } />

//         {/* Fallback */}
//         <Route path="*" element={<Navigate to="/" />} />

//       </Routes>
//     </BrowserRouter>
//   )
// }

// export default App