import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { 
  getCourseAssignments, 
  getAvailableTeachers, 
  assignTeacherToCourse, 
  removeAssignment,
  getAdminCourses 
} from "../../services/api";
import toast from "react-hot-toast";
import { FiArrowLeft, FiPlus, FiUserCheck, FiUserX, FiSearch, FiTrash2 } from "react-icons/fi";

const AssignTeachers = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [assignedTeachers, setAssignedTeachers] = useState([]);
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [assigning, setAssigning] = useState({});

  // Fetch course and teachers
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [courseRes, assignmentsRes, availableRes] = await Promise.all([
          getAdminCourses(), // Find course by ID if needed
          getCourseAssignments(courseId),
          getAvailableTeachers()
        ]);
        
        // Find specific course
        const targetCourse = courseRes.data.data?.find(c => c.course_id == courseId);
        setCourse(targetCourse);
        
        setAssignedTeachers(assignmentsRes.data.data || []);
        setAvailableTeachers(availableRes.data.data || []);
      } catch (err) {
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    if (courseId) fetchData();
  }, [courseId]);

  const handleAssign = async (teacherId, subjectId = null) => {
    try {
      setAssigning(prev => ({ ...prev, [teacherId]: true }));
      await assignTeacherToCourse({ 
        teacher_id: teacherId, 
        course_id: courseId, 
        subject_id: subjectId 
      });
      toast.success("Teacher assigned successfully!");
      
      // Refresh lists
      const [assignmentsRes, availableRes] = await Promise.all([
        getCourseAssignments(courseId),
        getAvailableTeachers()
      ]);
      setAssignedTeachers(assignmentsRes.data.data || []);
      setAvailableTeachers(availableRes.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to assign");
    } finally {
      setAssigning(prev => ({ ...prev, [teacherId]: false }));
    }
  };

  const handleRemove = async (assignmentId) => {
    if (!window.confirm("Remove this teacher assignment?")) return;
    try {
      await removeAssignment(assignmentId);
      toast.success("Teacher removed!");
      
      const assignmentsRes = await getCourseAssignments(courseId);
      setAssignedTeachers(assignmentsRes.data.data || []);
    } catch (err) {
      toast.error("Failed to remove");
    }
  };

  const filteredAvailable = availableTeachers.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.subject_specialization?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            to={`/coachingadmin/manage-courses`} 
            className="flex items-center gap-2 text-purple-400 hover:text-purple-300 text-lg font-medium"
          >
            <FiArrowLeft />
            Back to Courses
          </Link>
          {course && (
            <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-xl px-6 py-3">
              <h1 className="text-2xl font-bold">{course.course_title}</h1>
              <p className="text-indigo-200">{course.enrollment_count || 0} students enrolled</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Assigned Teachers */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <FiUserCheck className="w-6 h-6 text-emerald-400" />
              <h2 className="text-2xl font-bold">Assigned Teachers ({assignedTeachers.length})</h2>
            </div>
            
            {assignedTeachers.length === 0 ? (
              <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-600 rounded-xl">
                No teachers assigned yet
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {assignedTeachers.map(teacher => (
                  <div key={teacher.assignment_id} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                    <img 
                      src={teacher.teacher_profile_image || "/default-avatar.png"} 
                      alt={teacher.teacher_name}
                      className="w-12 h-12 rounded-full border-2 border-white/20"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">{teacher.teacher_name}</h3>
                      <p className="text-sm text-gray-400 truncate">{teacher.email}</p>
                      {teacher.subject_name && (
                        <span className="inline-block bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs mt-1">
                          {teacher.subject_name}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemove(teacher.assignment_id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                      title="Remove assignment"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Available Teachers */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <FiUserCheck className="w-6 h-6 text-indigo-400" />
              <h2 className="text-2xl font-bold">Available Teachers ({filteredAvailable.length})</h2>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <FiSearch className="absolute left-3 top-3 text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search teachers by name or subjects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-indigo-400 focus:outline-none"
                />
              </div>
            </div>

            {filteredAvailable.length === 0 ? (
              <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-600 rounded-xl">
                {searchTerm ? "No matching teachers" : "No available teachers"}
                <br />
                {!searchTerm && (
                  <Link to="/coachingadmin/manage-teachers" className="text-indigo-400 hover:text-indigo-300 mt-2 inline-block">
                    Review applications →
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredAvailable.map(teacher => (
                  <div key={teacher.user_id} className="p-4 border border-white/10 rounded-xl hover:border-white/20 hover:bg-white/10 transition-all">
                    <div className="flex items-center gap-4">
                      <img 
                        src={teacher.profile_image || "/default-avatar.png"} 
                        alt={teacher.name}
                        className="w-12 h-12 rounded-full border-2 border-white/20"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white truncate">{teacher.name}</h3>
                        <p className="text-sm text-gray-400 truncate">{teacher.email}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {teacher.subject_specialization?.split(',').map((sub, i) => (
                            <span key={i} className="bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded-full text-xs">
                              {sub.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => handleAssign(teacher.user_id)}
                        disabled={assigning[teacher.user_id]}
                        className="px-6 py-2 bg-emerald-500/90 text-white font-semibold rounded-xl hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg hover:shadow-emerald-500/25"
                      >
                        {assigning[teacher.user_id] ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Assigning...
                          </>
                        ) : (
                          <>
                            <FiPlus className="w-4 h-4" />
                            Assign
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignTeachers;

