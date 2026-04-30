import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyCenter, getMySubscription, getAllCourses, getAllBatches, getAllSubjects, getUnreadNotifications } from '../../services/api'
import { FiHome, FiBook, FiUsers, FiLayers, FiBell, FiUser, FiDollarSign, FiCreditCard, FiUserPlus, FiClock, FiCheckCircle, FiTrendingUp } from 'react-icons/fi'
import toast from 'react-hot-toast'

const CoachingAdminDashboard = () => {
  const [center, setCenter] = useState(null)
  const [subscription, setSubscription] = useState(null)
  const [stats, setStats] = useState({ courses: 0, batches: 0, subjects: 0, notifications: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Try to get center first
        let centerData = null
        let subscriptionData = null
        
        try {
          const centerRes = await getMyCenter()
          centerData = centerRes.data.data
          setCenter(centerData)
          
          // If center exists, try to get subscription details
          if (centerData) {
            try {
              const subRes = await getMySubscription()
              subscriptionData = subRes.data.data
              setSubscription(subscriptionData)
            } catch (subErr) {
              // Subscription might not be available yet
            }
          }
        } catch (centerErr) {
          // No center yet - this is normal for new users
        }

        // Fetch stats regardless of center status
        const [courses, batches, subjects, notifs] = await Promise.all([
          getAllCourses().catch(() => ({ data: { data: [] } })),
          getAllBatches().catch(() => ({ data: { data: [] } })),
          getAllSubjects().catch(() => ({ data: { data: [] } })),
          getUnreadNotifications().catch(() => ({ data: { data: [] } })),
        ])
        
        setStats({
          courses: courses.data.data.length,
          batches: batches.data.data.length,
          subjects: subjects.data.data.length,
          notifications: notifs.data.data.length,
        })
      } catch (err) {
        toast.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Menu items for different states
  const getMenuItems = () => {
    // If no center or pending, show limited menu
    if (!center || center.status === 'pending') {
      return [
        { label: 'Apply for Center', path: '/coaching-admin/apply', icon: FiHome, color: 'from-blue-500 to-cyan-500', desc: 'Register your coaching center' },
        { label: 'Notifications', path: '/notifications', icon: FiBell, color: 'from-yellow-500 to-amber-500', desc: `${stats.notifications} unread` },
        { label: 'Profile', path: '/profile', icon: FiUser, color: 'from-gray-500 to-gray-600', desc: 'Manage your profile' },
      ]
    }

    // Active center - show full menu without "Apply for Center"
    return [
      { label: 'Manage Courses', path: '/coaching-admin/courses', icon: FiBook, color: 'from-indigo-500 to-blue-500', desc: `${stats.courses} courses` },
      { label: 'Manage Batches', path: '/coaching-admin/batches', icon: FiLayers, color: 'from-purple-500 to-indigo-500', desc: `${stats.batches} batches` },
      { label: 'Manage Subjects', path: '/coaching-admin/subjects', icon: FiBook, color: 'from-violet-500 to-purple-500', desc: `${stats.subjects} subjects` },
      { label: 'Manage Students', path: '/coaching-admin/students', icon: FiUsers, color: 'from-emerald-500 to-teal-500', desc: 'Student enrollment' },
      { label: 'Manage Teachers', path: '/coaching-admin/teachers', icon: FiUserPlus, color: 'from-amber-500 to-orange-500', desc: 'Teacher accounts' },
      { label: 'Manage Staff', path: '/coaching-admin/staff', icon: FiUsers, color: 'from-rose-500 to-pink-500', desc: 'Staff accounts' },
      { label: 'Fee Management', path: '/coaching-admin/fees', icon: FiDollarSign, color: 'from-cyan-500 to-blue-500', desc: 'Student fee tracking' },
      { label: 'Subscription', path: '/coaching-admin/subscription', icon: FiCreditCard, color: 'from-teal-500 to-emerald-500', desc: subscription?.plan_name || 'Free plan' },
      { label: 'Notifications', path: '/notifications', icon: FiBell, color: 'from-yellow-500 to-amber-500', desc: `${stats.notifications} unread` },
      { label: 'Profile', path: '/profile', icon: FiUser, color: 'from-gray-500 to-gray-600', desc: 'Manage your profile' },
    ]
  }

  const menuItems = getMenuItems()

  if (loading) {
    return (
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            Coaching Admin Dashboard
          </span>
        </h1>
        <p className="text-gray-400">Coaching center management</p>
      </div>

      {/* Center Status Section */}
      {center ? (
        <>
          {center.status === 'pending' ? (
            // Pending State
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <FiClock className="text-amber-400 text-xl" />
                  </div>
                  <div>
                    <p className="text-amber-400 font-bold mb-1">Application Pending</p>
                    <p className="text-gray-400 text-sm">Your coaching center application is under review. You'll be notified once approved.</p>
                  </div>
                </div>
                <span className="px-4 py-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-sm font-bold">
                  Pending
                </span>
              </div>
            </div>
          ) : center.status === 'active' ? (
            // Active State - Show center info with subscription
            <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-6 mb-8">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Your Center</p>
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold">
                      Active
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white">{center.center_name}</h2>
                  <p className="text-gray-400 text-sm">{center.location}</p>
                  
                  {/* Current Plan Badge */}
                  <div className="flex items-center gap-2 mt-3">
                    <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-bold">
                      Current Plan: {subscription?.plan_name || 'Free'}
                    </span>
                    {subscription?.subscription_end && (
                      <span className="px-3 py-1 bg-gray-500/10 text-gray-400 border border-gray-500/20 rounded-full text-xs">
                        Expires: {new Date(subscription.subscription_end).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <Link 
                    to="/coaching-admin/subscription" 
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all"
                  >
                    <FiTrendingUp /> Buy Subscription Plan
                  </Link>
                  {subscription?.price > 0 && (
                    <span className="text-xs text-gray-500 text-center">
                      Current: ৳{subscription.price}/month
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // Inactive/Suspended State
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <FiCheckCircle className="text-red-400 text-xl" />
                </div>
                <div>
                  <p className="text-red-400 font-bold mb-1">Center Inactive</p>
                  <p className="text-gray-400 text-sm">Your center is currently inactive. Please contact support.</p>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        // No Center Applied State
        <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <FiHome className="text-blue-400 text-xl" />
              </div>
              <div>
                <p className="text-blue-400 font-bold mb-1">No Coaching Center Yet</p>
                <p className="text-gray-400 text-sm">Apply for a coaching center to unlock all features and start managing your institution.</p>
              </div>
            </div>
            <Link 
              to="/coaching-admin/apply" 
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2"
            >
              <FiHome /> Apply for Centre
            </Link>
          </div>
        </div>
      )}

      {/* Stats Section - Only show for active centers */}
      {center?.status === 'active' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Courses', value: stats.courses, color: 'text-indigo-400' },
            { label: 'Batches', value: stats.batches, color: 'text-purple-400' },
            { label: 'Subjects', value: stats.subjects, color: 'text-violet-400' },
            { label: 'Notifications', value: stats.notifications, color: 'text-amber-400' },
          ].map((s, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-gray-400 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {menuItems.map((item, i) => (
          <Link key={i} to={item.path} className="group bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:bg-white/[0.07]">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <item.icon className="text-white text-xl" />
            </div>
            <h3 className="text-white font-bold mb-1">{item.label}</h3>
            <p className="text-gray-500 text-sm">{item.desc}</p>
          </Link>
        ))}
      </div>

      {/* Quick Info for Pending/No Center */}
      {(!center || center.status === 'pending') && (
        <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-bold mb-3">What's Next?</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-xs text-blue-400">1</div>
              Submit your coaching center application
            </li>
            <li className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-xs text-amber-400">2</div>
              Wait for Super Admin approval
            </li>
            <li className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs text-emerald-400">3</div>
              Start managing your coaching center
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}

export default CoachingAdminDashboard
