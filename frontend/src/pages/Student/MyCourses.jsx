import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyCourses } from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";

const MyCourses = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    loadMyCourses();
  }, []);

  const loadMyCourses = async () => {
    setLoading(true);
    try {
      const res = await getMyCourses();
      setCourses(res.data.data || []);
    } catch (error) {
      console.error("Error loading courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysRemaining = (expiresAt) => {
    if (!expiresAt) return null;
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getDaysBadge = (days) => {
    if (days === null) {
      return (
        <span className="px-2 py-1 bg-gray-700 text-gray-400 text-xs rounded-full">
          No expiry
        </span>
      );
    }
    if (days > 30) {
      return (
        <span className="px-2 py-1 bg-emerald-900 text-emerald-400 text-xs rounded-full">
          {days}d left
        </span>
      );
    }
    if (days >= 7) {
      return (
        <span className="px-2 py-1 bg-amber-900 text-amber-400 text-xs rounded-full">
          {days}d left
        </span>
      );
    }
    if (days >= 0) {
      return (
        <span className="px-2 py-1 bg-red-900 text-red-400 text-xs rounded-full">
          {days}d left
        </span>
      );
    }
    return (
      <span className="px-2 py-1 bg-gray-700 text-gray-400 text-xs rounded-full">
        Expired
      </span>
    );
  };

  const getStatusBadge = (status, daysRemaining) => {
    if (status !== "active" || (daysRemaining !== null && daysRemaining < 0)) {
      return (
        <span className="px-2 py-1 bg-red-900 text-red-400 text-xs rounded-full">
          Expired
        </span>
      );
    }
    return (
      <span className="px-2 py-1 bg-emerald-900 text-emerald-400 text-xs rounded-full">
        Active
      </span>
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-[#030712] p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            My Courses
          </h1>
          <p className="text-gray-400">Your enrolled courses</p>
        </div>

        {/* Empty State */}
        {courses.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              No courses yet
            </h2>
            <p className="text-gray-400 mb-6">
              You haven't enrolled in any courses. Start learning today!
            </p>
            <button
              onClick={() => navigate("/student/browse-courses")}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 px-6 rounded-lg transition-all"
            >
              Browse Courses
            </button>
          </div>
        ) : (
          /* Course Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const daysRemaining = getDaysRemaining(course.expires_at);
              return (
                <div
                  key={course.enrollment_id || course.course_id}
                  className="bg-gray-800 rounded-xl overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all"
                >
                  {/* Card Header */}
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                        {course.center_name || "Coaching Center"}
                      </span>
                      {getStatusBadge(course.status, daysRemaining)}
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                      {course.course_title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {course.course_description}
                    </p>

                    {/* Date Range */}
                    <div className="text-sm text-gray-500 mb-3">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span>
                          {course.start_date
                            ? new Date(course.start_date).toLocaleDateString()
                            : "TBD"}
                          {course.end_date &&
                            ` - ${new Date(course.end_date).toLocaleDateString()}`}
                        </span>
                      </div>
                    </div>

                    {/* Days Remaining */}
                    <div className="flex items-center justify-between">
                      <div>{getDaysBadge(daysRemaining)}</div>
                      {getStatusBadge(course.status, daysRemaining)}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-5 py-4 bg-gray-900/50">
                    {course.status === "active" &&
                    (daysRemaining === null || daysRemaining >= 0) ? (
                      <button
                        onClick={() =>
                          navigate(`/student/courses/${course.course_id}`)
                        }
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-2 px-4 rounded-lg transition-all"
                      >
                        Open Course
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full bg-gray-700 text-gray-500 font-medium py-2 px-4 rounded-lg cursor-not-allowed"
                      >
                        Expired
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCourses;
