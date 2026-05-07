import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { getCoachingAnalytics } from "../../services/api";

const StatCard = ({ title, value }) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
    <div className="text-sm text-gray-400">{title}</div>
    <div className="text-3xl font-bold text-white mt-2">{value ?? 0}</div>
  </div>
);

const CoachingAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await getCoachingAnalytics();
        setData(res.data?.data || null);
      } catch (e) {
        setError(e?.response?.data?.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = useMemo(() => data?.stats || {}, [data]);

  const examPerformance = useMemo(() => {
    const rows = data?.exam_performance || [];
    return rows.map((r) => ({
      exam_date: r.exam_date,
      avg_percentage: r.avg_percentage,
      avg_score: r.avg_score,
    }));
  }, [data]);

  const studentsPerBatch = useMemo(() => {
    const rows = data?.students_per_batch || [];
    return rows.map((r) => ({
      batch_name: r.batch_name,
      student_count: r.student_count,
    }));
  }, [data]);

  const recentResults = useMemo(() => data?.recent_exam_results || [], [data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] text-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#030712] text-white p-8">
        <div className="max-w-5xl mx-auto bg-white/5 border border-white/10 rounded-2xl p-8">
          <div className="text-red-300 font-semibold">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Coaching Analytics</h1>
          <p className="text-gray-400 mt-2">Exam performance and student distribution by batch.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total Students" value={stats.total_students} />
          <StatCard title="Total Teachers" value={stats.total_teachers} />
          <StatCard title="Active Courses" value={stats.active_courses} />
          <StatCard title="Exams Conducted" value={stats.exams_conducted} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-lg font-semibold mb-4">Exam Performance (Avg Score %)</div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={examPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="exam_date" tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#9CA3AF" }} />
                  <Tooltip
                    contentStyle={{ background: "rgba(17,24,39,0.95)", border: "1px solid rgba(255,255,255,0.1)" }}
                    labelStyle={{ color: "#E5E7EB" }}
                    itemStyle={{ color: "#E5E7EB" }}
                    formatter={(v) => [`${Number(v).toFixed(2)}%`, "Avg"]}
                  />
                  <Bar dataKey="avg_percentage" fill="#7C3AED" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-lg font-semibold mb-4">Students per Batch</div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studentsPerBatch}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="batch_name" tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#9CA3AF" }} />
                  <Tooltip
                    contentStyle={{ background: "rgba(17,24,39,0.95)", border: "1px solid rgba(255,255,255,0.1)" }}
                    labelStyle={{ color: "#E5E7EB" }}
                    itemStyle={{ color: "#E5E7EB" }}
                    formatter={(v) => [v, "Students"]}
                  />
                  <Bar dataKey="student_count" fill="#06B6D4" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-lg font-semibold">Recent Exam Results</div>
              <div className="text-gray-400 text-sm mt-1">Latest results for your coaching center.</div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-gray-400">
                  <th className="text-left py-3 px-3">Exam Name</th>
                  <th className="text-left py-3 px-3">Course</th>
                  <th className="text-left py-3 px-3">Date</th>
                  <th className="text-left py-3 px-3">Students</th>
                  <th className="text-left py-3 px-3">Average Score</th>
                  <th className="text-left py-3 px-3">Pass Rate</th>
                </tr>
              </thead>
              <tbody>
                {recentResults.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-gray-400">
                      No recent exam results.
                    </td>
                  </tr>
                ) : (
                  recentResults.map((r, idx) => (
                    <tr
                      key={`${r.exam_id || idx}`}
                      className="border-t border-white/10 hover:bg-white/5"
                    >
                      <td className="py-3 px-3">{r.exam_name}</td>
                      <td className="py-3 px-3">{r.course_title}</td>
                      <td className="py-3 px-3">{r.date ? new Date(r.date).toLocaleDateString() : "-"}</td>
                      <td className="py-3 px-3">{r.students_tested}</td>
                      <td className="py-3 px-3">{r.avg_percentage ? `${Number(r.avg_percentage).toFixed(2)}%` : "-"}</td>
                      <td className="py-3 px-3">{r.pass_rate ? `${Number(r.pass_rate).toFixed(2)}%` : "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachingAnalytics;

