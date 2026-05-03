import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API, { getAllCenters, getAllSubscriptionPlans } from "../../services/api";
import toast from "react-hot-toast";
import { FiEye, FiCheck, FiX, FiPlay, FiRotateCw, FiChevronDown } from "react-icons/fi";

const ManageCenters = () => {
  const navigate = useNavigate();
  const [centers, setCenters] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  // Modals
  const [rejectModal, setRejectModal] = useState({ open: false, centerId: null, reason: "" });
  /* Assign Plan states - commented out
  const [assignModal, setAssignModal] = useState({ open: false, centerId: null });
  const [selectedPlanId, setSelectedPlanId] = useState("");
  */

  const fetchCenters = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllCenters();
      setCenters(response.data.data || []);
    } catch (error) {
      toast.error("Failed to load centers");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPlans = useCallback(async () => {
    try {
              const response = await getAllSubscriptionPlans();
      setPlans(response.data.data || []);
    } catch (error) {
      toast.error("Failed to load subscription plans");
    }
  }, []);

  useEffect(() => {
    fetchCenters();
    fetchPlans();
  }, [fetchCenters, fetchPlans]);

  const updateCenterStatus = async (id, data) => {
    return API.patch(`/center/${id}/status`, data);
  };

  const assignCenterSubscription = async (id, data) => {
    return API.patch(`/center/${id}/subscription`, data);
  };

  const handleStatusChange = async (centerId, newStatus, extraData = {}) => {
    try {
      await updateCenterStatus(centerId, { status: newStatus, ...extraData });
      const statusMsg = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
      toast.success(`Center ${statusMsg.toLowerCase()}d successfully!`);
      fetchCenters();
    } catch (error) {
      toast.error(`Failed to update center status`);
    }
  };

  /* Assign Plan handlers - commented out
  // const handleAssignPlan = async () => { ... }
  */

  const statusColor = (status) => {
    const colors = {
      pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      inactive: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      rejected: "bg-red-500/10 text-red-400 border-red-500/20"
    };
    return colors[status] || "bg-gray-500/10 text-gray-400 border-gray-500/20";
  };

  const filteredCenters = centers.filter((center) =>
    filter === "all" ? true : center.status === filter
  );

  const handleRejectOpen = (centerId) => {
    setRejectModal({ open: true, centerId, reason: "" });
  };

  const handleRejectClose = () => {
    setRejectModal({ open: false, centerId: null, reason: "" });
  };

  const handleRejectSubmit = () => {
    if (!rejectModal.reason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    handleStatusChange(rejectModal.centerId, "rejected", { reason: rejectModal.reason.trim() });
    handleRejectClose();
  };

  /* Assign Plan handlers - commented out
  const handleAssignOpen = (centerId) => {
    setAssignModal({ open: true, centerId });
    setSelectedPlanId("");
  };

  const handleAssignClose = () => {
    setAssignModal({ open: false, centerId: null });
    setSelectedPlanId("");
  };
  */

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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Coaching <span className="text-blue-400">Centers</span>
            </h1>
            <p className="text-gray-400">Manage centers with advanced filters and actions</p>
          </div>
          <div className="flex bg-white/5 border border-white/10 rounded-xl p-1">
            {["all", "pending", "active", "inactive", "rejected"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all flex items-center gap-1 ${
                  filter === tab
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-gray-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {tab}
                <span className="text-xs">({centers.filter(c => c.status === tab).length})</span>
              </button>
            ))}
          </div>
        </div>

        {filteredCenters.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/5">
            <p className="text-gray-400 text-xl mb-2">No centers match this filter</p>
            <p className="text-gray-500">Try changing the filter above</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCenters.map((center) => (
              <div
                key={center.coaching_center_id}
                className="bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 rounded-2xl p-6 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-white line-clamp-2 break-words min-w-0 flex-1">
                        {center.center_name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColor(center.status)} shrink-0`}>
                        {center.status.charAt(0).toUpperCase() + center.status.slice(1)}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-2 text-sm text-gray-400 mb-4">
                      <div>👤 Owner: {center.owner_name || "N/A"}</div>
                      <div>✉️ {center.email}</div>
                      <div>📞 {center.contact_number}</div>
                      <div>📅 {new Date(center.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => navigate(`/superadmin/manage-centers/${center.coaching_center_id}`)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white/10 text-gray-300 border border-white/20 rounded-xl text-xs hover:bg-white/20 transition-all flex-1 justify-center"
                  >
                    <FiEye size={12} /> View Details
                  </button>
                  {center.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleStatusChange(center.coaching_center_id, "active")}
                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs hover:bg-emerald-500/30 transition-all"
                      >
                        <FiCheck size={12} /> Approve
                      </button>
                      <button
                        onClick={() => handleRejectOpen(center.coaching_center_id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-500/20 text-red-300 border border-red-500/30 rounded-xl text-xs hover:bg-red-500/30 transition-all"
                      >
                        <FiX size={12} /> Reject
                      </button>
                    </>
                  )}
                  {center.status === "active" && (
                    <>
                      <button
                        onClick={() => handleStatusChange(center.coaching_center_id, "inactive")}
                        className="flex items-center gap-1 px-3 py-1.5 bg-orange-500/20 text-orange-300 border border-orange-500/30 rounded-xl text-xs hover:bg-orange-500/30 transition-all"
                      >
                        <FiX size={12} /> Deactivate
                      </button>
      {/* TEMPORARILY DISABLED - Assign Plan 
        <button
        onClick={() => handleAssignOpen(center.coaching_center_id)}
        className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-xl text-xs hover:bg-blue-500/30 transition-all"
      >
        <FiChevronDown size={12} /> Assign Plan
      </button> */}
                    </>
                  )}
                  {center.status === "inactive" && (
                    <>
                      <button
                        onClick={() => handleStatusChange(center.coaching_center_id, "active")}
                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs hover:bg-emerald-500/30 transition-all flex-1 justify-center"
                      >
                        <FiPlay size={12} /> Reactivate
                      </button>
                    </>
                  )}
                  {center.status === "rejected" && (
                    <>
                      <button
                        onClick={() => handleStatusChange(center.coaching_center_id, "pending")}
                        className="flex items-center gap-1 px-3 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs hover:bg-amber-500/30 transition-all flex-1 justify-center"
                      >
                        <FiRotateCw size={12} /> Reconsider
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reject Reason Modal */}
        {rejectModal.open && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleRejectClose}>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <h2 className="text-xl font-bold mb-4 text-white">Reject Center</h2>
              <p className="text-gray-400 mb-4 text-sm">Provide a reason for rejection:</p>
              <textarea
                value={rejectModal.reason}
                onChange={(e) => setRejectModal({...rejectModal, reason: e.target.value})}
                placeholder="Enter rejection reason..."
                className="w-full p-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 resize-vertical h-32 mb-4"
              />
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleRejectSubmit}
                  className="flex-1 bg-red-500/90 text-white py-2.5 px-4 rounded-xl font-semibold hover:bg-red-600 transition-all"
                >
                  Reject
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

        {/* Assign Plan Modal */}
{/* Assign Plan Modal - commented out
{assignModal.open && (
  <div ... entire modal JSX
)} */}
      </main>
    </div>
  );
};

export default ManageCenters;

