import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyApplication } from "../../services/api";
import toast from "react-hot-toast";
import { 
  FiHome, 
  FiClock, 
  FiXCircle, 
  FiCheckCircle, 
  FiEdit3, 
  FiMail, 
  FiArrowRight 
} from "react-icons/fi";

const ApplicationStatus = () => {
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplication();
  }, []);

  const fetchApplication = async () => {
    try {
      const response = await getMyApplication();
      setApplication(response.data.data);
    } catch (error) {
      console.error('Fetch application error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // No application
  if (!application) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-12 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <FiHome className="text-white text-3xl" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">No Coaching Center</h1>
          <p className="text-gray-400 mb-8 text-lg">You have not registered a center yet</p>
          <button 
            onClick={() => navigate('/coachingadmin/apply-for-center')}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 px-8 rounded-2xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 mx-auto"
          >
            <FiHome />
            Register Now
          </button>
        </div>
      </div>
    );
  }

  const submittedDate = new Date(application.submitted_at).toLocaleDateString('en-GB');

  // Pending
  if (application.status === 'pending') {
    return (
      <div className="min-h-screen bg-[#030712] px-6 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 rounded-3xl p-8 mb-8 text-center">
            <div className="w-20 h-20 bg-yellow-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FiClock className="text-yellow-400 text-3xl animate-spin" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Application Under Review</h1>
            <p className="text-gray-300 text-xl mb-2">{application.center_name}</p>
            <p className="text-yellow-400">Submitted on {submittedDate}</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-6">Review Timeline</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                  <FiCheckCircle className="text-white text-sm" />
                </div>
                <div>
                  <p className="font-semibold text-white">Application Submitted</p>
                  <p className="text-gray-400 text-sm">{submittedDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center animate-pulse">
                  <FiClock className="text-white text-sm" />
                </div>
                <div>
                  <p className="font-semibold text-white">Under Review by Admin</p>
                  <p className="text-gray-400 text-sm">In progress</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-gray-500/10 border border-gray-500/20 rounded-xl">
                <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-gray-400 rounded-full"></div>
                </div>
                <div>
                  <p className="font-semibold text-white">Decision</p>
                  <p className="text-gray-400 text-sm">Pending</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-400 text-lg mb-6">Expected response within <span className="font-bold text-yellow-400">2 to 3 working days</span></p>
            <button 
              onClick={() => navigate('/coachingadmin')}
              className="bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold py-3 px-8 rounded-xl hover:shadow-lg transition-all"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Rejected
  if (application.status === 'rejected') {
    return (
      <div className="min-h-screen bg-[#030712] px-6 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-r from-red-500/10 to-rose-500/10 border border-red-500/20 rounded-3xl p-8 mb-8 text-center">
            <div className="w-20 h-20 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FiXCircle className="text-red-400 text-3xl" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Application Rejected</h1>
            <p className="text-gray-300 text-xl mb-2">{application.center_name}</p>
            <p className="text-gray-400">Submitted on {submittedDate}</p>
          </div>

          {application.rejection_reason && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 mb-8">
              <p className="text-red-400 font-semibold mb-3">Rejection Reason:</p>
              <p className="text-gray-300 whitespace-pre-wrap">{application.rejection_reason}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => navigate('/coachingadmin/apply-for-center')}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 px-6 rounded-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2"
            >
              <FiEdit3 />
              Edit and Reapply
            </button>
            <button 
              className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold py-4 px-6 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
              onClick={() => window.location.href = 'mailto:support@proshnoghor.com?subject=Coaching Center Rejection Appeal&body=Please help with my rejected application for %20{application.center_name}'}
            >
              <FiMail />
              Contact Support
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active/Approved
  return (
    <div className="min-h-screen bg-[#030712] px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-3xl p-8 mb-8 text-center">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FiCheckCircle className="text-emerald-400 text-3xl" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Application Approved!</h1>
          <p className="text-gray-300 text-xl mb-2">{application.center_name}</p>
          <p className="text-emerald-400 text-lg mb-8">Your center is now active on ProshnoGhor</p>
          <button 
            onClick={() => navigate('/coachingadmin')}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold py-4 px-12 rounded-2xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 mx-auto text-xl"
          >
            <FiArrowRight />
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationStatus;
