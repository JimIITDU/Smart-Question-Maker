import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getTeacherCourses, createCourse, deleteCourseAdmin, updateCourseAdmin, publishCourse, getCoursesForTeacher } from "../../services/api";
import toast from "react-hot-toast";
import { FiArrowLeft, FiPlus, FiTrash2, FiEdit, FiBookOpen } from "react-icons/fi";

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    course_title: "",
    course_description: "",
    category: "",
    class_level: "",
    subjects_input: "",
    duration: "",
    fee: 0,
    start_date: "",
    end_date: "",
    enrollment_type: "open",
    max_students: "",
    thumbnail: null,
    is_public: true,
  });

  const fetchCourses = async () => {
    try {
      const r = await getTeacherCourses();
      setCourses(r.data.data || []);
    } catch {
      toast.error("Failed to load your courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.course_title.trim()) {
      toast.error("Course title is required");
      return;
    }
    if (!formData.category) {
      toast.error("Category is required");
      return;
    }
    if (!formData.class_level.trim()) {
      toast.error("Class level is required");
      return;
    }
    const subjectsArray = (formData.subjects_input || '').split(',').map(s => s.trim()).filter(Boolean);
    if (subjectsArray.length === 0) {
      toast.error("Please enter at least one subject (comma separated)");
      return;
    }
    
    const submitData = new FormData();
    submitData.append('course_title', formData.course_title);
    submitData.append('course_description', formData.course_description);
    submitData.append('category', formData.category);
    submitData.append('class_level', formData.class_level);
    submitData.append('subjects_covered', JSON.stringify(subjectsArray));
    submitData.append('duration', formData.duration);
    submitData.append('fee', formData.fee);
    if (formData.start_date) submitData.append('start_date', formData.start_date);
    if (formData.end_date) submitData.append('end_date', formData.end_date);
    submitData.append('enrollment_type', formData.enrollment_type);
    if (formData.max_students) submitData.append('max_students', formData.max_students);
    submitData.append('is_public', formData.is_public);
    if (formData.thumbnail) submitData.append('thumbnail', formData.thumbnail);

    try {
      await createCourse(submitData);
      toast.success("Course created in draft!");
      setShowForm(false);
      setFormData({
        course_title: "",
        course_description: "",
        category: "",
        class_level: "",
        subjects_input: "",
        duration: "",
        fee: 0,
        start_date: "",
        end_date: "",
        enrollment_type: "open",
        max_students: "",
        thumbnail: null,
        is_public: true,
      });
      fetchCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create course");
    }
  };

  const [deletingId, setDeletingId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  
  const openEditModal = (course) => {
    setEditingCourse(course);
    setEditFormData({
      course_title: course.course_title,
      course_description: course.course_description,
      fee: course.fee || 0,
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    try {
      await updateCourseAdmin(editingCourse.course_id, editFormData);
      toast.success("Course updated!");
      setShowEditModal(false);
      fetchCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update course");
    }
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this course?")) return;
    setDeletingId(id);
    try {
      await deleteCourseAdmin(id);
      toast.success("Course deleted!");
      fetchCourses();
    } catch {
      toast.error("Failed to delete course");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <main className="max-w-7xl mx-auto px-6 pt-28 pb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Manage <span className="text-indigo-400">Courses</span>
            </h1>
            <p className="text-gray-400">
              Create and manage your courses as a teacher
            </p>
          </div>
          <Link
            to="/teacher/courses/create"
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-indigo-500/25 transition-all text-lg flex items-center gap-2"
          >
            <FiPlus />
            Create Course
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
            <FiBookOpen className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">No courses yet</p>
            <Link
              to="/teacher/courses/create"
              className="text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-2"
            >
              Create your first course <FiPlus className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.course_id}
                className="bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl p-6 transition-all"
              >
                <h3 className="text-lg font-bold text-white mb-2">
                  {course.course_title}
                </h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                  {course.course_description || "No description"}
                </p>
                <div className="flex gap-3 text-sm text-gray-400 mb-4">
                  {course.duration && (
                    <span className="bg-white/5 px-3 py-1 rounded-full">
                      {course.duration}
                    </span>
                  )}
                  {course.fee && (
                    <span className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full">
                      ৳{course.fee}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
                  <button 
                    onClick={() => openEditModal(course)} 
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl text-sm hover:bg-indigo-500/20 transition-all min-w-[100px]"
                  >
                    <FiEdit size={14} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(course.course_id)}
                    disabled={deletingId === course.course_id}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-sm hover:bg-red-500/20 transition-all min-w-[100px] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingId === course.course_id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <FiTrash2 size={14} /> Delete
                      </>
                    )}
                  </button>
                  {course.lifecycle_status === 'draft' && (
                    <button 
                      onClick={async () => {
                        try {
                          await publishCourse(course.course_id);
                          toast.success('Course published!');
                          fetchCourses();
                        } catch (err) {
                          toast.error('Failed to publish course');
                        }
                      }}
                      className="flex items-center gap-2 py-2 px-4 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl text-sm hover:bg-amber-500/20 transition-all"
                    >
                      Publish
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {showEditModal && editingCourse && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white/10 border border-white/20 rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-white mb-6">Edit Course</h2>
              <form onSubmit={handleUpdateCourse} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-2">
                    Course Title
                  </label>
                  <input
                    type="text"
                    name="course_title"
                    value={editFormData.course_title}
                    onChange={handleEditChange}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-2">
                    Description
                  </label>
                  <textarea
                    name="course_description"
                    value={editFormData.course_description}
                    onChange={handleEditChange}
                    rows="3"
                    className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-400 resize-vertical"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-2">
                    Fee
                  </label>
                  <input
                    type="number"
                    name="fee"
                    value={editFormData.fee}
                    onChange={handleEditChange}
                    min="0"
                    className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-400"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all"
                  >
                    Update
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 py-3 bg-gray-600/50 text-gray-300 rounded-xl font-semibold hover:bg-gray-600 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ManageCourses;
