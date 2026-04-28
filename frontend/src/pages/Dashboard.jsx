import React from 'react'
import { useAuth } from '../context/AuthContext.jsx'

// 1. Import your new specific components
import SuperAdminDashboard from './SuperAdmin/SuperAdminDashboard.jsx'
import CoachingAdminDashboard from './CoachingAdmin/CoachingAdminDashboard.jsx'
import TeacherDashboard from './Teacher/TeacherDashboard.jsx'
// import StaffDashboard from './Staff/StaffDashboard.jsx'
import StudentDashboard from './Student/StudentDashboard.jsx'
import ParentDashboard from './Parent/ParentDashboard.jsx'

const Dashboard = () => {
  const { user } = useAuth()
  const role = user?.role_id

  // 2. Map roles to components
  const renderDashboard = () => {
    switch (role) {
      case 1: return <SuperAdminDashboard />
      case 2: return <CoachingAdminDashboard />
      case 3: return <TeacherDashboard />
      // case 4: return <StaffDashboard />
      case 5: return <StudentDashboard />
      case 6: return <ParentDashboard />
      default: return <div className="text-white">Role not recognized</div>
    }
  }

  // 3. Return the specific component
  return (
    <>
      {renderDashboard()}
    </>
  )
}

export default Dashboard