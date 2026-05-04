import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { getCenterById, getAdminUsers, approveCenter, rejectCenter } from "../../services/api";
import toast from "react-hot-toast";
import { FiArrowLeft, FiCheck, FiX } from "react-icons/fi";

const CenterDetails = () => {
  const { id } = useParams();
  const [center, setCenter] = useState(null);
  const [stats, setStats] = useState({
    teachersCount: 0,
    studentsCount: 0,
    examsCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const loadCenter = async () => {
      try {
        const res = await getCenterById(id);
        setCenter(res.data.data);
      } catch (error) {
        console.error('Load center error:', error);
        toast.error("Failed to load center");
      } finally {
        setLoading(false);
      }
    };
    loadCenter();
  }, [id]);

  useEffect(() => {
    if (!center) return;
    
    // Load stats
    const loadStats = async () => {
      try {
        // Teachers: active users with role 3 assigned to center
        const teachersRes = await getAdminUsers({
          role: 3,
          search: '',
          page: 1
        });
        const centerTeachers = teachersRes.data.data.filter(u => u.coaching_center_id === parseInt(id) && u.is_active);
        setStats(prev => ({ ...prev, teachersCount: centerTeachers.length }));

        // Students: role 5
        const studentsRes = await getAdminUsers({
          role: 5,
          search: '',
          page: 1
        });
        const centerStudents = studentsRes.data.data.filter(u => u.coaching_center_id === parseInt(id) && u.is_active);
        setStats(prev => ({ ...prev, studentsCount: centerStudents.length }));

        // Exams: approximate from all exams, would need center_id filter in backend
        setStats(prev => ({ ...prev, examsCount: 0 })); // TODO: backend endpoint
      } catch (error) {
        console.error('Load stats error:', error);
        // Ignore stats errors
      } finally {
        setStatsLoading(false);
      }
    };
    loadStats();
  }, [center, id]);

  const handleApprove = async () => {
    try {
      await approveCenter(id);
      toast.success("Center approved!");
      setCenter({ ...center, status: "active" });
    } catch (error) {
      console.error('Approve error:', error);
      toast.error("Failed to approve center");
    }
  };

  const handleReject = async () => {
    try {
      await rejectCenter(id);
      toast.success("Center rejected!");
      setCenter({ ...center, status: "rejected" });
    } catch (error) {
      console.error('Reject error:', error);
      toast.error("Failed to reject center");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      

      <main className="max-w-5xl mx-auto px-6 pt-28 pb-20">
        {center ? (
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <div className="flex justify-between items-start mb-6">
                <Link 
                  to="/superadmin/manage-centers" 
                  className="inline-flex items-center gap-2 text-gray-400 hover:text-white font-semibold transition-colors mb-4 lg:mb-0"
                >
                  <FiArrowLeft />
                  Back to Manage Centers
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-white mb-2">
                    {center.center_name}
                  </h1>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-bold border ${center.status === "active" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : center.status === "pending" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}
                  >
                    {center.status}
                  </span>
                  {center.plan_name && (
                    <div className="mt-2 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                      <span className="text-emerald-400 font-semibold">{center.plan_name}</span>
                      {center.price && <span className="text-sm ml-2 text-emerald-300">({center.price ? `৳${center.price}/mo` : 'Free'})</span>}
                    </div>
                  )}
                </div>
                {center.status === "pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={handleApprove}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl font-semibold hover:bg-emerald-500/20 transition-all"
                    >
                      <FiCheck /> Approve
                    </button>
                    <button
                      onClick={handleReject}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl font-semibold hover:bg-red-500/20 transition-all"
                    >
                      <FiX /> Reject
                    </button>
                  </div>
                )}
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                {[
                  { label: "Location", value: center.location },
                  { label: "Contact", value: center.contact_number },
                  { label: "Email", value: center.email },
                  {
                    label: "Established",
                    value: center.established_date
                      ? new Date(center.established_date).toLocaleDateString()
                      : "N/A",
                  },
                  { label: "Access Type", value: center.access_type },
                  {
                    label: "Created",
                    value: new Date(center.created_at).toLocaleDateString(),
                  },
                ].map((item, i) => (
                  <div key={i} className="bg-white/5 rounded-xl p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                      {item.label}
                    </p>
                    <p className="text-white font-medium">
                      {item.value || "N/A"}
                    </p>
                  </div>
                ))}
              </div>

              {/* Usage Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Teachers</h3>
                  <div className="text-3xl font-bold text-emerald-400 mb-2">{stats.teachersCount || 0}</div>
                  <p className="text-gray-400">{statsLoading ? 'Loading...' : 'Active teachers assigned'}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Students</h3>
                  <div className="text-3xl font-bold text-blue-400 mb-2">{stats.studentsCount || 0}</div>
                  <p className="text-gray-400">{statsLoading ? 'Loading...' : 'Active enrolled students'}</p>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mt-6">
                <h3 className="text-lg font-bold text-white mb-4">Exams</h3>
                <div className="text-3xl font-bold text-purple-400 mb-2">
                  {typeof stats.examsCount === 'number' ? stats.examsCount : 'N/A'}
                </div>
                <p className="text-gray-400">Total exams conducted (approx)</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500">Center not found</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default CenterDetails;
