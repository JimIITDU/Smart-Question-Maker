import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  browseCourses,
  enrollInCourse,
  checkEnrollment,
  getMyCourses,
} from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../../components/LoadingSpinner";

const BrowseCourses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [feeFilter, setFeeFilter] = useState("");
  const [enrollmentTypeFilter, setEnrollmentTypeFilter] = useState("");
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);

  useEffect(() => {
    loadCourses();
  }, [search, feeFilter, enrollmentTypeFilter]);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const filters = {
        search: search || undefined,
        fee_filter: feeFilter || undefined,
        enrollment_type: enrollmentTypeFilter || undefined,
      };
      const res = await browseCourses(filters);
      setCourses(res.data.data || []);

      // Load user's enrolled courses to check if already enrolled
      if (user) {
        try {
          const myCoursesRes = await getMyCourses();
          const enrolledIds = (myCoursesRes.data.data || []).map(
            (c) => c.course_id,
          );
          setEnrolledCourseIds(enrolledIds);
        } catch (e) {
          // User not logged in or no courses
        }
      }
    } catch (error) {
      console.error("Error loading courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (course) => {
    // Check if logged in
    if (!user) {
      navigate("/login");
      return;
    }

    // Check if already enrolled
    if (enrolledCourseIds.includes(course.course_id)) {
      navigate(`/student/courses/${course.course_id}`);
      return;
    }

    if (!confirm(`Do you want to enroll in "${course.course_title}"?`)) return;

    try {
      const res = await enrollInCourse(course.course_id);
      const data = res.data;

      if (data.data?.requires_payment) {
        // Navigate to mock payment screen with fee and title
        navigate(`/student/payment/${course.course_id}`, {
          state: {
            fee: course.fee,
            title: course.course_title,
          },
        });
      } else {
        // Free course - enrolled successfully
        alert(data.message || "Enrolled successfully!");
        navigate("/student/courses");
      }
    } catch (error) {
      alert(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to enroll",
      );
    }
  };

  const getFeeDisplay = (fee) => {
    if (fee === 0 || fee === null || fee === undefined || fee === "0") {
      return <span className="text-emerald-400 font-bold">FREE</span>;
    }
    return <span className="text-amber-400 font-bold">৳{fee}</span>;
  };

  const getEnrollmentTypeBadge = (type) => {
    if (type === "private") {
      return (
        <span className="px-2 py-1 bg-red-900 text-red-200 text-xs rounded-full">
          Private
        </span>
      );
    }
    return (
      <span className="px-2 py-1 bg-blue-900 text-blue-200 text-xs rounded-full">
        Open
      </span>
    );
  };

  const isEnrolled = (courseId) => enrolledCourseIds.includes(courseId);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-[#030712] p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Browse Courses
          </h1>
          <p className="text-gray-400">
            Discover courses from coaching centers
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-800 rounded-xl p-4 mb-6">
          {/* Search Bar */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFeeFilter("")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                feeFilter === ""
                  ? "bg-purple-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFeeFilter("free")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                feeFilter === "free"
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              Free
            </button>
            <button
              onClick={() => setFeeFilter("paid")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                feeFilter === "paid"
                  ? "bg-amber-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              Paid
            </button>
            <div className="w-px h-8 bg-gray-600 mx-2"></div>
            <button
              onClick={() => setEnrollmentTypeFilter("")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                enrollmentTypeFilter === ""
                  ? "bg-purple-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setEnrollmentTypeFilter("open")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                enrollmentTypeFilter === "open"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              Open
            </button>
            <button
              onClick={() => setEnrollmentTypeFilter("private")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                enrollmentTypeFilter === "private"
                  ? "bg-red-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              Private
            </button>
          </div>
        </div>

        {/* Course Cards Grid */}
        {courses.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-12 text-center">
            <div className="text-gray-400 text-lg mb-2">No courses found</div>
            <p className="text-gray-500">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.course_id}
                className="bg-gray-800 rounded-xl overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all"
              >
                {/* Card Header */}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                      {course.center_name || " coaching center"}
                    </span>
                    {getEnrollmentTypeBadge(course.enrollment_type)}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                    {course.course_title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {course.course_description}
                  </p>

                  {/* Dates */}
                  <div className="text-sm text-gray-500 mb-4">
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

                  {/* Teacher Count */}
                  <div className="text-sm text-gray-500 mb-4">
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
                          d="M12 4.354l-8 4.5 8 4.5 8-4.5-8-4.5zM4.5 10.854L12 15.354l7.5-4.5-7.5-4.5z"
                        />
                      </svg>
                      <span>{course.teacher_count || 0} teachers</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-5 py-4 bg-gray-900/50 flex items-center justify-between">
                  <div className="text-xl">{getFeeDisplay(course.fee)}</div>
                  <button
                    onClick={() => handleEnroll(course)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      isEnrolled(course.course_id)
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    }`}
                  >
                    {isEnrolled(course.course_id) ? "Go to Course" : "Enroll"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseCourses;
