import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllCourses, createCourse } from "../../services/api";
import toast from "react-hot-toast";
import { FiArrowLeft, FiPlus, FiTrash2, FiEdit } from "react-icons/fi";

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    course_title: "",
    course_description: "",
    duration: "",
    fee: "",
  });

  const fetchCourses = () => {
    getAllCourses()
      .then((r) => setCourses(r.data.data))
      .catch(() => toast.error("Failed to load courses"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createCourse(formData);
      toast.success("Course created!");
      setShowForm(false);
      setFormData({
        course_title: "",
        course_description: "",
        duration: "",
        fee: "",
      });
      fetchCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create course");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this course?")) return;
    try {
      await fetch(
        `https://smart-question-maker-backend.onrender.com/api/academic/courses/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      toast.success("Course deleted!");
      fetchCourses();
    } catch {
      toast.error("Failed to delete course");
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      

      <main className="max-w-7xl mx-auto px-6 pt-28 pb-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Manage <span className="text-indigo-400">Courses</span>
          </h1>
          <p className="text-gray-400">
            Create and manage your coaching center courses
          </p>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8 space-y-4"
          >
            <h2 className="text-lg font-bold text-white">Create New Course</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                  Course Title
                </label>
                <input
                  type="text"
                  name="course_title"
                  value={formData.course_title}
                  onChange={handleChange}
                  required
                  placeholder="e.g. HSC Science"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                  Duration
                </label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="e.g. 12 months"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                  Description
                </label>
                <textarea
                  name="course_description"
                  value={formData.course_description}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Course description..."
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                  Fee (BDT)
                </label>
                <input
                  type="number"
                  name="fee"
                  value={formData.fee}
                  onChange={handleChange}
                  placeholder="e.g. 5000"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
            >
              Create Course
            </button>
          </form>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
            <p className="text-gray-500 text-lg mb-2">No courses yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Create your first course
            </button>
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
                <div className="flex gap-2 pt-4 border-t border-white/5">
                  <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 text-gray-300 border border-white/10 rounded-xl text-sm hover:bg-white/10 transition-all">
                    <FiEdit size={14} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(course.course_id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-sm hover:bg-red-500/20 transition-all"
                  >
                    <FiTrash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ManageCourses;
