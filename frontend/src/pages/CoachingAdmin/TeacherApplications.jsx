import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  getCenterApplications,
  approveApplication,
  rejectApplication,
  removeTeacherFromCenter,
  getAvailableTeachers,
} from "../../services/api";

const Modal = ({ open, title, children, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-[#0b1220] text-white w-full max-w-lg rounded-2xl border border-white/10">
        <div className="p-5 border-b border-white/10">
          <div className="text-lg font-semibold">{title}</div>
        </div>
        <div className="p-5">{children}</div>
        <div className="p-5 border-t border-white/10 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const TeacherApplications = () => {
  const [loading, setLoading] = useState(false);
  const [apps, setApps] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");

  const [rejectModal, setRejectModal] = useState({ open: false, appId: null });
  const [rejectionReason, setRejectionReason] = useState("");

  const refresh = async () => {
    const res = await getCenterApplications();
    setApps(res.data?.data || []);
  };

  useEffect(() => {
    refresh().catch(() => toast.error("Failed to load applications"));
  }, []);

  const pending = useMemo(() => apps.filter((a) => a.status === "pending"), [apps]);
  const approved = useMemo(() => apps.filter((a) => a.status === "approved"), [apps]);
  const rejected = useMemo(() => apps.filter((a) => a.status === "rejected"), [apps]);

  const onApprove = async (id) => {
    if (!confirm("Approve this teacher application?")) return;
    try {
      setLoading(true);
      await approveApplication(id);
      toast.success("Application approved");
      await refresh();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to approve");
    } finally {
      setLoading(false);
    }
  };

  const onReject = async () => {
    try {
      if (!rejectionReason.trim()) {
        toast.error("Rejection reason is required");
        return;
      }
      setLoading(true);
      await rejectApplication(rejectModal.appId, { reason: rejectionReason });
      toast.success("Application rejected");
      setRejectModal({ open: false, appId: null });
      setRejectionReason("");
      await refresh();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to reject");
    } finally {
      setLoading(false);
    }
  };

  const onApprovedRemove = async (teacherId) => {
    if (!confirm("Remove teacher from center?")) return;
    try {
      setLoading(true);
      await removeTeacherFromCenter(teacherId);
      toast.success("Teacher removed");
      await refresh();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to remove");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Teacher Applications</h1>
        </div>

        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 rounded-xl border ${
              activeTab === "pending"
                ? "bg-blue-600 border-blue-600 text-white"
                : "bg-white/5 border-white/10 text-gray-300"
            }`}
          >
            Pending ({pending.length})
          </button>
          <button
            onClick={() => setActiveTab("approved")}
            className={`px-4 py-2 rounded-xl border ${
              activeTab === "approved"
                ? "bg-blue-600 border-blue-600 text-white"
                : "bg-white/5 border-white/10 text-gray-300"
            }`}
          >
            Approved ({approved.length})
          </button>
          <button
            onClick={() => setActiveTab("rejected")}
            className={`px-4 py-2 rounded-xl border ${
              activeTab === "rejected"
                ? "bg-blue-600 border-blue-600 text-white"
                : "bg-white/5 border-white/10 text-gray-300"
            }`}
          >
            Rejected ({rejected.length})
          </button>
        </div>

        {activeTab === "pending" && (
          <div>
            {pending.length === 0 ? (
              <p className="text-gray-400">No pending applications.</p>
            ) : (
              pending.map((app) => (
                <div
                  key={app.application_id}
                  className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-semibold text-white text-lg">{app.teacher_name}</div>
                      <div className="text-sm text-gray-400">{app.teacher_email}</div>
                      <div className="text-sm text-gray-300 mt-3">
                        <div>
                          <span className="text-gray-400">Subjects: </span>
                          {app.subjects_specialization || "-"}
                        </div>
                        <div className="mt-2">
                          <span className="text-gray-400">Applied: </span>
                          {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : "-"}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => onApprove(app.application_id)}
                        disabled={loading}
                        className="px-4 py-2 rounded-xl bg-emerald-500/90 hover:bg-emerald-600 disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          setRejectModal({ open: true, appId: app.application_id })
                        }
                        disabled={loading}
                        className="px-4 py-2 rounded-xl bg-red-500/90 hover:bg-red-600 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "approved" && (
          <div>
            {approved.length === 0 ? (
              <p className="text-gray-400">No approved applications.</p>
            ) : (
              approved.map((app) => (
                <div
                  key={app.application_id}
                  className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-semibold text-white text-lg">{app.teacher_name}</div>
                      <div className="text-sm text-gray-400">{app.teacher_email}</div>
                      <div className="text-sm text-gray-300 mt-3">
                        <div>
                          <span className="text-gray-400">Subjects: </span>
                          {app.subjects_specialization || "-"}
                        </div>
                        <div className="mt-2">
                          <span className="text-gray-400">Applied: </span>
                          {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : "-"}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => onApprovedRemove(app.teacher_user_id)}
                        disabled={loading}
                        className="px-4 py-2 rounded-xl bg-red-500/90 hover:bg-red-600 disabled:opacity-50"
                      >
                        Remove from center
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "rejected" && (
          <div>
            {rejected.length === 0 ? (
              <p className="text-gray-400">No rejected applications.</p>
            ) : (
              rejected.map((app) => (
                <div
                  key={app.application_id}
                  className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-semibold text-white text-lg">{app.teacher_name}</div>
                      <div className="text-sm text-gray-400">{app.teacher_email}</div>
                      <div className="text-sm text-gray-300 mt-3">
                        <div>
                          <span className="text-gray-400">Subjects: </span>
                          {app.subjects_specialization || "-"}
                        </div>
                        <div className="mt-2">
                          <span className="text-gray-400">Applied: </span>
                          {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : "-"}
                        </div>
                        <div className="mt-2">
                          <span className="text-gray-400">Rejection reason: </span>
                          {app.rejection_reason || app.review_reason || "-"}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => toast("Reconsider functionality not wired (endpoint missing)")}
                        disabled={loading}
                        className="px-4 py-2 rounded-xl bg-blue-500/90 hover:bg-blue-600 disabled:opacity-50"
                      >
                        Reconsider
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <Modal
        open={rejectModal.open}
        title="Reject Application"
        onClose={() => setRejectModal({ open: false, appId: null })}
      >
        <div className="text-sm text-gray-300 mb-3">
          Provide a rejection reason. This will be stored with the application.
        </div>
        <textarea
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white min-h-[110px]"
          placeholder="Enter reason..."
        />
        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={() => setRejectModal({ open: false, appId: null })}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            onClick={onReject}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-red-500/90 hover:bg-red-600 disabled:opacity-50"
          >
            Reject
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default TeacherApplications;

