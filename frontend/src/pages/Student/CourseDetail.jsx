import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getCourseDetail,
  checkEnrollment,
  getCourseExams,
  enrollInCourse,
  getCourseMaterials
} from "../../services/api";
import { toast } from "react-hot-toast";
import { FiFolder, FiFileText } from "react-icons/fi";
import LoadingSpinner from "../../components/LoadingSpinner";

const CourseDetail = () => {
  const { course_id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [exams, setExams] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [activeTab, setActiveTab] = useState("exams");

  useEffect(() => {
    loadData();
  }, [course_id]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load course details
      const detailRes = await getCourseDetail(course_id);
      setCourse(detailRes.data.data);

      // Check enrollment
      const enrollmentRes = await checkEnrollment(course_id);
      if (enrollmentRes.data.data) {
        setEnrollment(enrollmentRes.data.data);
      }

      // Load exams
      const examsRes = await getCourseExams(course_id);
      setExams(examsRes.data.data || []);

      // Load materials
      const materialsRes = await getCourseMaterials(course_id);
      setMaterials(materialsRes.data.data || []);
    } catch (error) {
      console.error("Error loading course:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    try {
      await enrollInCourse(course_id);
      toast.success('Enrolled successfully!');
      setEnrollment({ status: 'active' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed');
    }
  };

  const getExamStatus = (exam) => {
    const now = new Date();
    const start = exam.start_time ? new Date(exam.start_time) : null;
    const end = exam.end_time ? new Date(exam.end_time) : null;

    if (start && now < start) return { status: "upcoming", label: "Upcoming", class: "bg-gray-700 text-gray-300" };
    if (start && end && now >= start && now <= end) return { status: "live", label: "Live Now", class: "bg-emerald-600 text-white animate-pulse" };
    if (end && now > end) return { status: "completed", label: "Completed", class: "bg-gray-600 text-gray-300" };
    return { status: "upcoming", label: "Upcoming", class: "bg-gray-700 text-gray-300" };
  };

  if (loading) return <LoadingSpinner />;

  if (!course) return <div className="text-center py-12">Course not found</div>;

  const scheduledExams = exams.filter(e => e.exam_type === "scheduled" || !e.exam_type);
  const liveQuizzes = exams.filter(e => e.exam_type === "live_quiz");
  const practiceExams = exams.filter(e => e.exam_type === "practice");

  const isEnrolled = enrollment && enrollment.status === 'active';

  return (
    <div className="min-h-screen bg-[#030712] p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                  {course.center_name || "Coaching Center"}
                </span>
                {isEnrolled && (
                  <span className="px-2 py-1 bg-emerald-900 text-emerald-400 text-xs rounded">
                    Enrolled ✓
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                {course.course_title}
              </h1>
              <p className="text-gray-400 mb-4">{course.course_description}</p>

              <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>
                    {course.start_date ? new Date(course.start_date).toLocaleDateString() : "TBD"}
                    {course.end_date && ` - ${new Date(course.end_date).toLocaleDateString()}`}
                  </span>
                </div>
                {course.duration && (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{course.duration}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {course.teachers && course.teachers.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-sm text-gray-400 mb-2">Teachers</p>
              <div className="flex flex-wrap gap-2">
                {course.teachers.slice(0, 5).map(teacher => (
                  <div key={teacher.user_id} className="flex items-center gap-2 bg-gray-700 rounded-full px-3 py-1">
                    <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-xs text-white font-bold">
                      {teacher.name?.charAt(0).toUpperCase() || "T"}
                    </div>
                    <span className="text-sm text-gray-300 truncate max-w-20">{teacher.name}</span>
                  </div>
                ))}
                {course.teachers.length > 5 && (
                  <span className="text-sm text-gray-400">+{course.teachers.length - 5}</span>
                )}
              </div>
            </div>
          )}
        </div>

        {!isEnrolled && (
          <div className="mb-8 p-6 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border-2 border-dashed border-emerald-500/30 rounded-2xl text-center">
            <h3 className="text-xl font-bold text-emerald-400 mb-3">Join Course</h3>
            {course.fee > 0 ? (
              <>
                <p className="text-gray-300 mb-4 text-lg">Course Fee: <span className="text-2xl font-bold text-emerald-400">৳{course.fee}</span></p>
                <button
                  onClick={() => navigate(`/student/mock-payment/${course_id}`)}
                  className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-2xl hover:shadow-emerald-500/25 transition-all"
                >
                  Pay & Enroll Now
                </button>
              </>
            ) : (
              <button
                onClick={handleEnroll}
                className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-2xl hover:shadow-emerald-500/25 transition-all"
              >
                Join Free Course
              </button>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab("exams")}
            className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === "exams"
                ? "bg-purple-600 text-white shadow-lg"
                : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
            }`}
          >
            📚 Exams ({exams.length})
          </button>
          <button
            onClick={() => setActiveTab("materials")}
            className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === "materials"
                ? "bg-orange-600 text-white shadow-lg"
                : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
            }`}
          >
            📁 Materials ({materials.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-gray-800 rounded-xl p-6 space-y-6">
          {/* Exams Tab */}
          {activeTab === "exams" && (
            <div>
              {/* Scheduled */}
              <h3 className="text-lg font-bold mb-4">Scheduled Exams</h3>
              {scheduledExams.length === 0 ? (
                <p className="text-gray-400 py-8 text-center">No scheduled exams</p>
              ) : (
                <div className="grid gap-4">
                  {scheduledExams.map(exam => {
                    const statusInfo = getExamStatus(exam);
                    return (
                      <div key={exam.exam_id} className="bg-gray-900 p-6 rounded-xl hover:bg-gray-900/70 transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-bold text-white text-lg flex-1">{exam.title}</h4>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.class}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                        <p className="text-gray-400 mb-4 text-sm">{exam.instructions?.substring(0, 100)}...</p>
                        <div className="flex gap-2">
                          {statusInfo.status === "live" && (
                            <button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-6 rounded-xl font-medium">
                              Start Exam
                            </button>
                          )}
                          {statusInfo.status === "completed" && (
                            <button className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-xl font-medium">
                              View Results
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Live & Practice */}
              <div className="grid md:grid-cols-2 gap-4 mt-8">
                {liveQuizzes[0] && (
                  <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-2 border-purple-500/30 p-6 rounded-xl animate-pulse">
                    <h4 className="text-lg font-bold mb-2">🔴 Live Quiz Now</h4>
                    <p className="text-purple-200 mb-4">{liveQuizzes[0].title}</p>
                    <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-xl font-bold">
                      Join Live
                    </button>
                  </div>
                )}
                {practiceExams.length > 0 && (
                  <div>
                    <h4 className="text-lg font-bold mb-4">Practice Tests</h4>
                    {practiceExams.slice(0, 2).map(exam => (
                      <button key={exam.exam_id} className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-xl mb-2 font-medium block">
                        {exam.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Materials Tab */}
          {activeTab === "materials" && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-6">
                📚 Study Materials ({materials.length})
              </h2>
              {materials.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-600 rounded-xl text-gray-400">
                  No materials available yet
                </div>
              ) : (
                <div className="grid gap-4">
                  {materials.map(material => (
                    <div key={material.material_id} className="flex items-center gap-4 p-6 bg-gray-900 rounded-xl hover:bg-gray-900/70 transition-all border border-gray-700">
                      <FiFileText className="text-blue-400 text-2xl flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white mb-1 truncate">{material.title}</h4>
                        <p className="text-sm text-gray-400 mb-1">{material.teacher_name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(material.created_at).toLocaleDateString()} • {(material.file_size / 1024 / 1024).toFixed(1)} MB
                        </p>
                      </div>
                      <a
                        href={`/uploads/study-materials/${material.file_path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl whitespace-nowrap shadow-lg hover:shadow-blue-500/25 transition-all"
                      >
                        Download
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;

