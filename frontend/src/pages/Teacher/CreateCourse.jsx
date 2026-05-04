import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createCourse } from "../../services/api";
import toast from "react-hot-toast";
import { FiArrowLeft, FiUpload } from "react-icons/fi";

const CreateCourse = () => {
  const navigate = useNavigate();
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
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (!formData.course_title.trim()) {
      toast.error("Course title is required");
      setLoading(false);
      return;
    }
    if (!formData.category) {
      toast.error("Category is required");
      setLoading(false);
      return;
    }
    if (!formData.class_level.trim()) {
      toast.error("Class level is required");
      setLoading(false);
      return;
    }
    const subjectsArray = (formData.subjects_input || '').split(',').map(s => s.trim()).filter(Boolean);
    if (subjectsArray.length === 0) {
      toast.error("Please enter at least one subject (comma separated)");
      setLoading(false);
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
      toast.success("Course created successfully!");
      navigate("/teacher/courses");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="max-w-2xl mx-auto px-6 pt-28 pb-20">
        <Link
          to="/teacher/courses"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 text-sm font-medium"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back to Courses
        </Link>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Create New Course
          </h1>
          <p className="text-gray-400">Fill in the details to create your course</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-3">
                  Course Title *
                </label>
                <input
                  type="text"
                  name="course_title"
                  value={formData.course_title}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Advanced Mathematics for HSC"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-5 py-4 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-lg"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-3">
                  Category *
                </label>
                <select 
                  name="category" 
                  value={formData.category} 
                  onChange={handleChange} 
                  required 
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-5 py-4 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-lg"
                >
                  <option value="">Select Category</option>
                  <option value="school">School</option>
                  <option value="college">College</option>
                  <option value="university">University</option>
                  <option value="competitive">Competitive Exam</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-3">
                  Class Level *
                </label>
                <input
                  type="text"
                  name="class_level"
                  value={formData.class_level}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Class 11-12, HSC, A-Unit"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-5 py-4 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-3">
                  Subjects (comma separated) *
                </label>
                <input
                  type="text"
                  name="subjects_input"
                  value={formData.subjects_input}
                  onChange={handleChange}
                  placeholder="Physics, Chemistry, Higher Math"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-5 py-4 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-3">
                  Duration
                </label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="e.g. 6 months, 1 year"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-5 py-4 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-3">
                  Fee (0 for free)
                </label>
                <input
                  type="number"
                  name="fee"
                  value={formData.fee}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="5000"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-5 py-4 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-3">
                  Enrollment Type
                </label>
                <select name="enrollment_type" value={formData.enrollment_type} onChange={handleChange} className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-5 py-4 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20">
                  <option value="open">Open Enrollment</option>
                  <option value="approval">Approval Required</option>
                  <option value="private">Private (Invite Only)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-3">
                  Max Students
                </label>
                <input
                  type="number"
                  name="max_students"
                  value={formData.max_students}
                  onChange={handleChange}
                  min="0"
                  placeholder="Unlimited or max number"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-5 py-4 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-3">
                  Start Date
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-5 py-4 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-3">
                  End Date
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-5 py-4 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-3">
                Course Thumbnail (optional)
              </label>
              <input
                type="file"
                name="thumbnail"
                accept="image/*"
                onChange={(e) => setFormData({...formData, thumbnail: e.target.files[0]})}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-5 py-4 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 file:mr-4 file:py-3 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-600/80 file:text-white hover:file:bg-indigo-700"
              />
            </div>

            <label className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl">
              <input
                type="checkbox"
                checked={formData.is_public}
                onChange={(e) => setFormData({...formData, is_public: e.target.checked})}
                className="w-5 h-5 rounded border-gray-500 text-indigo-600 focus:ring-indigo-500 bg-white/10"
              />
              <span className="text-sm text-gray-300">Make course public (visible to students)</span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating Course...
                </>
              ) : (
                "Create Course"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCourse;
