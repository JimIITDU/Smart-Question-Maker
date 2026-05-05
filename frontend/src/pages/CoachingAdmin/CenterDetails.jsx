import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getDashboardStats } from '../../services/api.js';
import { FiEdit, FiFileText, FiUsers, FiCheckCircle, FiXCircle, FiArrowLeft } from 'react-icons/fi';

const CoachingAdminCenterDetails = () => {
  const [center, setCenter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCenter = async () => {
      try {
        const res = await getDashboardStats();
        setCenter(res.data.data.center);
      } catch (err) {
        setError('Failed to load center details');
      } finally {
        setLoading(false);
      }
    };
    fetchCenter();
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div></div>;
  if (error) return <div className="text-red-400 text-center py-20">{error}</div>;
  if (!center) return <div className="text-gray-400 text-center py-20">No center found</div>;

  const isRejected = center.status === 'rejected';
  const isPending = center.status === 'pending';
  const isActive = center.status === 'active';

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8">
        <Link to="/coachingadmin" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6">
          <FiArrowLeft />
          <span>Back to Dashboard</span>
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2">Center Details</h1>
        <p className="text-gray-400">Your coaching center information</p>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-3 mb-8">
        <span className={`px-4 py-2 rounded-full font-bold text-sm ${
          isActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
          isPending ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
          'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          {isActive ? 'Active' : isPending ? 'Pending Review' : 'Rejected'}
        </span>
        {isRejected && center.rejection_reason && (
          <span className="text-xs bg-red-500/10 px-3 py-1 rounded-full text-red-300 border border-red-500/20">
            "{center.rejection_reason}"
          </span>
        )}
      </div>

      {/* Center Info Card */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">{center.center_name}</h2>
            <div className="space-y-3 text-gray-300">
              <div className="flex items-center gap-3">
                <FiMapPin className="text-gray-500" />
                <span>{center.location}</span>
              </div>
              <div className="flex items-center gap-3">
                <FiPhone className="text-gray-500" />
                <span>{center.contact_number}</span>
              </div>
              <div className="flex items-center gap-3">
                <FiMail className="text-gray-500" />
                <span>{center.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <FiCalendar className="text-gray-500" />
                <span>Established: {new Date(center.established_date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="font-bold text-white mb-4">Status & Actions</h3>
              {isRejected && (
                <div className="space-y-3 mb-6">
                  <p className="text-sm text-gray-400">Your application was rejected.</p>
                  <Link to="/coachingadmin/apply-for-center" className="block w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-xl text-center font-bold hover:from-indigo-700 hover:to-purple-700 transition-all">
                    Re-Apply for Center
                  </Link>
                </div>
              )}
              {isPending && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-400">Under review by Super Admin.</p>
                  <Link to="/coachingadmin/application-history" className="block w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white py-3 px-6 rounded-xl text-center font-bold hover:from-amber-700 hover:to-orange-700 transition-all">
                    View Application Status
                  </Link>
                </div>
              )}
              {isActive && (
                <div className="space-y-3">
                  <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold">
                    Active & Ready
                  </span>
                  <Link to="/coachingadmin" className="block w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-6 rounded-xl text-center font-bold hover:from-emerald-700 hover:to-teal-700 transition-all">
                    Go to Dashboard
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
        <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <FiFileText className="text-indigo-400" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-white">{center.center_name} Application</p>
              <p className="text-sm text-gray-400">
                Status: {center.status.toUpperCase()}
                {center.updated_at && (
                  <span> • {new Date(center.updated_at).toLocaleDateString()}</span>
                )}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              isActive ? 'bg-emerald-500/20 text-emerald-400' :
              isPending ? 'bg-amber-500/20 text-amber-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {center.status}
            </span>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CoachingAdminCenterDetails;

