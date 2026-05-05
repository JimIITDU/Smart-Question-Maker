import React from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

// Layout & Route Guards
import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import RoleBasedRoute from "./components/RoleBasedRoute.jsx";
import ErrorPage from "./components/ErrorPage.jsx";
import SearchResults from "./components/SearchResults.jsx";

// Public / Auth pages
import HomePage from "./pages/HomePage.jsx";
import Login from "./pages/Auth/Login.jsx";
import Register from "./pages/Auth/Register.jsx";
import VerifyOTP from "./pages/Auth/VerifyOTP.jsx";
import ForgotPassword from "./pages/Auth/ForgotPassword.jsx";


// Shared protected pages
import Dashboard from "./pages/Dashboard.jsx";
import Notifications from "./pages/Notifications.jsx";
import Profile from "./pages/Profile.jsx";

// SuperAdmin pages (role_id = 1)
import SuperAdminDashboard from "./pages/SuperAdmin/SuperAdminDashboard.jsx";
import ManageCenters from "./pages/SuperAdmin/ManageCenters.jsx";
import CenterDetails from "./pages/SuperAdmin/CenterDetails.jsx";
import ManageSubscriptionPlans from "./pages/SuperAdmin/ManageSubscriptionPlans.jsx";
import ManageUsers from "./pages/SuperAdmin/ManageUsers.jsx";
import ViewApplications from "./pages/SuperAdmin/ViewApplications.jsx";

// CoachingAdmin pages (role_id = 2)
import CoachingAdminDashboard from "./pages/CoachingAdmin/CoachingAdminDashboard.jsx";
import ApplyForCenter from "./pages/CoachingAdmin/ApplyForCenter.jsx";
import ManageCourses from "./pages/CoachingAdmin/ManageCourses.jsx";
import ManageBatches from "./pages/CoachingAdmin/ManageBatches.jsx";
import ManageSubjects from "./pages/CoachingAdmin/ManageSubjects.jsx";
import ManageStudents from "./pages/CoachingAdmin/ManageStudents.jsx";
import ManageTeachers from "./pages/CoachingAdmin/ManageTeachers.jsx";
import ManageStaff from "./pages/CoachingAdmin/ManageStaff.jsx";
import CoachingManageUsers from "./pages/CoachingAdmin/ManageUsers.jsx";
import FeeManagement from "./pages/CoachingAdmin/FeeManagement.jsx";
import SubscriptionManagement from "./pages/CoachingAdmin/SubscriptionManagement.jsx";
import ApplicationStatus from "./pages/CoachingAdmin/ApplicationStatus.jsx";

// Teacher pages (role_id = 3)
import TeacherDashboard from "./pages/Teacher/TeacherDashboard.jsx";
import QuestionBank from "./pages/Teacher/QuestionBank.jsx";
import CreateQuestion from "./pages/Teacher/CreateQuestion.jsx";
import EditQuestion from "./pages/Teacher/EditQuestion.jsx";
import AIQuestionGenerator from "./pages/Teacher/AIQuestionGenerator.jsx";
import ManageExams from "./pages/Teacher/ManageExams.jsx";
import CreateExam from "./pages/Teacher/CreateExam.jsx";
import ExamDetails from "./pages/Teacher/ExamDetails.jsx";
import LiveQuiz from "./pages/Teacher/LiveQuiz.jsx";
import Analytics from "./pages/Teacher/Analytics.jsx";
import UploadMaterial from "./pages/Teacher/UploadMaterial.jsx";
import ApplyToCenter from "./pages/Teacher/ApplyToCenter.jsx";
import TeacherManageCourses from "./pages/Teacher/ManageCourses.jsx";
import TeacherCreateCourse from "./pages/Teacher/CreateCourse.jsx";

// Student pages (role_id = 5)
import StudentDashboard from "./pages/Student/StudentDashboard.jsx";
import Exams from "./pages/Student/Exams.jsx";
import TakeExam from "./pages/Student/TakeExam.jsx";
import Results from "./pages/Student/Results.jsx";
import MyResults from "./pages/Student/MyResults.jsx";
import StudyMaterials from "./pages/Student/StudyMaterials.jsx";
import JoinQuiz from "./pages/Student/JoinQuiz.jsx";
import BrowseCourses from "./pages/Student/BrowseCourses.jsx";
import MockPayment from "./pages/Student/MockPayment.jsx";
import MyCourses from "./pages/Student/MyCourses.jsx";
import CourseDetail from "./pages/Student/CourseDetail.jsx";

// CoachingAdmin pages (role_id = 2)
import TeacherApplications from "./pages/CoachingAdmin/TeacherApplications.jsx";
import AssignTeachers from "./pages/CoachingAdmin/AssignTeachers.jsx";

// Parent pages (role_id = 6)
import ParentDashboard from "./pages/Parent/ParentDashboard.jsx";
import ChildResults from "./pages/Parent/ChildResults.jsx";

/**
 * LayoutWrapper
 * Wraps <Outlet /> inside the application's Sidebar + Navbar layout
 * so every authenticated page renders within the dashboard shell.
 */
const LayoutWrapper = () => (
  <Layout>
    <Outlet />
  </Layout>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ==================== PUBLIC ROUTES ==================== */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/reset-password" element={<ForgotPassword />} />

        {/* ==================== PROTECTED ROUTES ==================== */}
        <Route element={<ProtectedRoute />}>
          <Route element={<LayoutWrapper />}>
            <Route path="/search" element={<SearchResults />} />
            {/* Shared — any authenticated user */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<Profile />} />

            {/* Legacy / shared top-level paths (backward compatibility) */}
            <Route path="/questions" element={<QuestionBank />} />
            <Route path="/exams" element={<Exams />} />
            <Route path="/exams/:id/take" element={<TakeExam />} />
            <Route path="/results/:id" element={<Results />} />
            <Route path="/join-quiz" element={<JoinQuiz />} />

            {/* -------------------- SUPER ADMIN (role_id: 1) -------------------- */}
            <Route element={<RoleBasedRoute allowedRoles={[1]} />}>
              <Route path="/superadmin" element={<SuperAdminDashboard />} />
              <Route path="/superadmin/manage-centers" element={<ManageCenters />} />
              <Route path="/superadmin/manage-centers/:id" element={<CenterDetails />} />
              <Route path="/superadmin/view-applications" element={<ViewApplications />} />
              <Route path="/superadmin/manage-subscription-plans" element={<ManageSubscriptionPlans />} />
              <Route path="/superadmin/users" element={<ManageUsers />} />
            </Route>

            {/* -------------------- COACHING ADMIN (role_id: 2) -------------------- */}
            <Route element={<RoleBasedRoute allowedRoles={[2]} />}>
              <Route path="/coachingadmin" element={<CoachingAdminDashboard />} />
              <Route path="/coachingadmin/apply-for-center" element={<ApplyForCenter />} />
              <Route path="/coachingadmin/manage-courses" element={<ManageCourses />} />
              <Route path="/coachingadmin/manage-batches" element={<ManageBatches />} />
              <Route path="/coachingadmin/manage-subjects" element={<ManageSubjects />} />
              <Route path="/coachingadmin/manage-students" element={<ManageStudents />} />
              <Route path="/coachingadmin/manage-teachers" element={<ManageTeachers />} />
              <Route path="/coachingadmin/manage-staff" element={<ManageStaff />} />
              <Route path="/coachingadmin/manage-users" element={<CoachingManageUsers />} />
              <Route path="/coachingadmin/fee-management" element={<FeeManagement />} />
              <Route path="/coachingadmin/subscription-management" element={<SubscriptionManagement />} />
              <Route path="/coachingadmin/teacher-applications" element={<TeacherApplications />} />
<Route path="/coachingadmin/courses/:courseId/assign-teachers" element={<AssignTeachers />} />
              <Route path="/coaching-admin/application-status" element={<ApplicationStatus />} />
            </Route>

            {/* -------------------- TEACHER (role_id: 3) -------------------- */}
            <Route element={<RoleBasedRoute allowedRoles={[3]} />}>
              <Route path="/teacher" element={<TeacherDashboard />} />
              <Route path="/teacher/questions" element={<QuestionBank />} />
              <Route path="/teacher/questions/create" element={<CreateQuestion />} />
              <Route path="/teacher/questions/:id/edit" element={<EditQuestion />} />
              <Route path="/teacher/questions/ai-generate" element={<AIQuestionGenerator />} />
              <Route path="/teacher/exams" element={<ManageExams />} />
              <Route path="/teacher/exams/create" element={<CreateExam />} />
              <Route path="/teacher/exams/:id/details" element={<ExamDetails />} />
              <Route path="/teacher/live-quiz" element={<LiveQuiz />} />
              <Route path="/teacher/analytics" element={<Analytics />} />
              <Route path="/teacher/upload-material" element={<UploadMaterial />} />
              <Route path="/teacher/courses" element={<TeacherManageCourses />} />
              <Route path="/teacher/courses/create" element={<TeacherCreateCourse />} />
              <Route path="/teacher/apply-to-center" element={<ApplyToCenter />} />
              <Route path="/teacher/courses" element={<TeacherManageCourses />} />
              <Route path="/teacher/courses/create" element={<TeacherCreateCourse />} />
            </Route>


            {/* -------------------- STUDENT (role_id: 5) -------------------- */}
            <Route element={<RoleBasedRoute allowedRoles={[5]} />}>
              <Route path="/student" element={<StudentDashboard />} />
              <Route path="/student/exams" element={<Exams />} />
              <Route path="/student/exams/:id/take" element={<TakeExam />} />
              <Route path="/student/my-results" element={<MyResults />} />
              <Route path="/student/my-results/:id" element={<Results />} />
              <Route path="/student/study-materials" element={<StudyMaterials />} />
              <Route path="/student/join-quiz" element={<JoinQuiz />} />
              <Route path="/student/browse-courses" element={<BrowseCourses />} />
              <Route path="/student/mock-payment/:enrollmentId" element={<MockPayment />} />
              <Route path="/student/my-courses" element={<MyCourses />} />
              <Route path="/student/courses/:course_id" element={<CourseDetail />} />
            </Route>

            {/* -------------------- PARENT (role_id: 6) -------------------- */}
            <Route element={<RoleBasedRoute allowedRoles={[6]} />}>
              <Route path="/parent" element={<ParentDashboard />} />
              <Route path="/parent/child-results" element={<ChildResults />} />
            </Route>

            {/* -------------------- FALLBACK 404 -------------------- */}
            <Route path="*" element={<ErrorPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
