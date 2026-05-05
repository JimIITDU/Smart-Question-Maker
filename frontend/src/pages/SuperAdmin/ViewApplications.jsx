import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API, { getAllCenters, getAllSubscriptionPlans } from "../../services/api";
import toast from "react-hot-toast";
import { FiEye, FiCheck, FiX, FiChevronLeft } from "react-icons/fi";

const ViewApplications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState({ open: false, centerId: null, reason: "" });

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllCenters();
      // Filter only pending applications
      const pendingApps = (response.data.data || []).filter(center => center.status === "pending");
      setApplications(pendingApps);
    } catch (error) {
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const updateCenterStatus = async (id, data) => {
    return API.patch(`/center/${id}/status`, data);
  };

  const handleApprove = async (centerId) => {
    if (!confirm("Approve this coaching center application and assign free plan?")) return;
    try {
      // Step 1: Approve status
      await updateCenterStatus(centerId, { status: "active" });
      
      // Step 2: Assign free plan (first plan with price=0)
      const plansRes = await getAllSubscriptionPlans();
      const freePlan = plansRes.data.data.find(plan => plan.price === 0 || plan.price === '0');
      if (freePlan) {
        await API.patch(`/center/${centerId}/subscription`, { plan_id: freePlan.plan_id });
        toast.success(`Application approved! Assigned ${freePlan.name} (free plan)`);
      } else {
        toast.success("Application approved! (Please assign subscription plan manually)");
      }
      
      fetchApplications(); // Refresh list
    } catch (error) {
      toast.error("Failed to approve application");
    }
  };

  const handleRejectOpen = (centerId) => {
    setRejectModal({ open: true, centerId, reason: "" });
  };

  const handleRejectClose = () => {
    setRejectModal({ open: false, centerId: null, reason: "" });
  };

  const handleRejectSubmit = async () => {
    if (!rejectModal.reason.trim()) {
      toast.error("Please provide rejection reason");
      return;
    }
    try {
      await updateCenterStatus(rejectModal.centerId, { 
        status: "rejected", 
        rejection_reason: rejectModal.reason.trim() 
      });
      toast.success("Application rejected!");
      handleRejectClose();
      fetchApplications();
    } catch (error) {
      toast.error("Failed to reject application");
    }
  };

  const statusColor = (status) => {
    const colors = {
      pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    };
    return colors[status] || "bg-gray-500/10 text-gray-400 border-gray-500/20";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white p-6">
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <main className="max-w-7xl mx-auto px-6 pt-28 pb-20">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
          >
            <FiChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Coaching Center <span className="text-amber-400">Applications</span>
            </h1>
            <p className="text-gray-400">
              Review and approve pending coaching center applications ({applications.length})
            </p>
          </div>
        </div>

        {/* Empty State */}
        {applications.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/5">
            <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">📋</span>
            </div>
            <h3 className="text-xl font-bold text-gray-300 mb-2">No Pending Applications</h3>
            <p className="text-gray-500 mb-6">All coaching center applications are processed</p>
            <button
              onClick={() => navigate('/superadmin')}
              className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {applications.map((app) => (
              <div
                key={app.coaching_center_id}
                className="bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 rounded-2xl p-6 transition-all group"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-white line-clamp-2 break-words min-w-0 flex-1">
                        {app.center_name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColor(app.status)}`}>
                        Pending
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-2 text-sm text-gray-400 mb-4">
                      <div>👤 Owner: {app.owner_name || "N/A"}</div>
                      <div>📍 {app.address_full || app.location || "N/A"}</div>
                      <div>✉️ {app.center_email || app.email}</div>
                      <div>📅 {new Date(app.submitted_at || app.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => navigate(`/superadmin/manage-centers/${app.coaching_center_id}`)}
                    className="flex items-center gap-1 px-4 py-2 bg-white/10 text-gray-300 border border-white/20 rounded-xl text-sm hover:bg-white/20 transition-all flex-1 justify-center"
                  >
                    <FiEye size={14} /> View Details
                  </button>
                  <button
                    onClick={() => handleApprove(app.coaching_center_id)}
                    className="flex items-center gap-1 px-4 py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-sm hover:bg-emerald-500/30 transition-all"
                  >
                    <FiCheck size={14} /> Approve
                  </button>
                  <button
                    onClick={() => handleRejectOpen(app.coaching_center_id)}
                    className="flex items-center gap-1 px-4 py-2 bg-red-500/20 text-red-300 border border-red-500/30 rounded-xl text-sm hover:bg-red-500/30 transition-all"
                  >
                    <FiX size={14} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reject Modal */}
        {rejectModal.open && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" 
            onClick={handleRejectClose}
          >
            <div 
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" 
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4 text-white">Reject Application</h2>
              <p className="text-gray-400 mb-4 text-sm">Provide reason for rejection:</p>
              <textarea
                value={rejectModal.reason}
                onChange={(e) => setRejectModal({...rejectModal, reason: e.target.value})}
                placeholder="Enter rejection reason (e.g., incomplete documents, location issue)..."
                className="w-full p-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 resize-vertical h-32 mb-4"
              />
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleRejectSubmit}
                  className="flex-1 bg-red-500/90 text-white py-2.5 px-4 rounded-xl font-semibold hover:bg-red-600 transition-all"
                >
                  Reject Application
                </button>
                <button
                  onClick={handleRejectClose}
                  className="flex-1 bg-white/10 text-gray-300 py-2.5 px-4 rounded-xl hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ViewApplications;

