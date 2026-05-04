import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAllExams, startExam } from "../../services/api";
import toast from "react-hot-toast";
import { FiPlus, FiPlay, FiEye, FiArrowLeft } from "react-icons/fi";

const ManageExams = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllExams()
      .then((r) => setExams(r.data.data))
      .catch(() => toast.error("Failed to load exams"))
      .finally(() => setLoading(false));
  }, []);

  const handleStart = async (id) => {
    try {
      await startExam(id);
      toast.success("Exam started!");
      setExams(
        exams.map((e) => (e.exam_id === id ? { ...e, status: "ongoing" } : e)),
      );
    } catch {
      toast.error("Failed to start exam");
    }
  };

  const statusColor = (s) =>
    ({
      scheduled: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      ongoing: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      completed: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    })[s] || "bg-gray-500/10 text-gray-400";

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <main className="max-w-7xl mx-auto px-6 pt-28 pb-20">
        <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Manage <span className="text-purple-400">Exams</span>
            </h1>
            <p className="text-gray-400">
              View, start, and monitor all your exams
            </p>
          </div>
          <Link
            to="/teacher/exams/create"
            className="group bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 border-2 border-purple-400/50 hover:border-purple-300 text-white font-bold px-8 py-4 rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-purple-500/25 hover:-translate-y-1 transition-all flex items-center gap-3 whitespace-nowrap"
          >
            <FiPlus className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            Create Exam
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          </div>
        ) : exams.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
            <p className="text-gray-500 text-lg mb-4">No exams yet</p>
            <Link
              to="/teacher/exams/create"
              className="text-purple-400 hover:text-purple-300 font-medium"
            >
              Create your first exam
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {exams.map((exam) => (
              <div
                key={exam.exam_id}
                className="bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl p-6 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColor(exam.status)}`}
                  >
                    {exam.status}
                  </span>
                  <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">
                    {exam.exam_type}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {exam.title || "Untitled Exam"}
                </h3>
                <div className="space-y-1 mb-4 text-sm text-gray-400">
                  <p>Start: {new Date(exam.start_time).toLocaleString()}</p>
                  {exam.access_code && (
                    <p className="font-mono text-purple-400">
                      Code: {exam.access_code}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 pt-4 border-t border-white/5">
                  {exam.status === "scheduled" && (
                    <button
                      onClick={() => handleStart(exam.exam_id)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-sm font-semibold hover:bg-emerald-500/20 transition-all"
                    >
                      <FiPlay /> Start
                    </button>
                  )}
                  <Link
                    to={`/teacher/exams/${exam.exam_id}/details`}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 text-gray-300 border border-white/10 rounded-xl text-sm font-semibold hover:bg-white/10 transition-all"
                  >
                    <FiEye /> Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ManageExams;

