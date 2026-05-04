import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  createExam, 
  getAllQuestions, 
  getTeacherCourses 
} from "../../services/api";
import toast from "react-hot-toast";
import { FiArrowLeft, FiSave, FiSearch, FiClock, FiX } from "react-icons/fi";

// Class options
const CLASS_OPTIONS = [
  "1st", "2nd", "3rd", "4", "5", "6", "7", "8", 
  "9-10 (Secondary)", "11-12(Higher Secondary)", 
  "Bachelor(hons)", "Masters", "MPhil", "others"
];

// Paper options
const PAPER_OPTIONS = ["1st", "2nd", "3rd"];

// Question type options
const QUESTION_TYPE_OPTIONS = ["mcq", "descriptive", "true_false"];

// Difficulty options
const DIFFICULTY_OPTIONS = ["easy", "medium", "hard"];

const SCHOOL_CLASSES = [
  "1st", "2nd", "3rd", "4", "5", "6", "7", "8", 
  "9-10 (Secondary)", "11-12(Higher Secondary)"
];

const isSchoolClass = (className) => SCHOOL_CLASSES.includes(className);

const CreateExam = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Form data with question_ids properly initialized as []
  const [formData, setFormData] = useState({
    title: "",
    course_id: "",
    subject_id: "",
    batch_id: "",
    exam_type: "scheduled",
    duration_minutes: 60,
    total_marks: "",
    pass_mark: "",
    instructions: "",
    num_sets: 1,
    overlap_pct: 0,
    start_time: "",
    end_time: "",
    hours_open: 24,
    question_ids: []  // ✅ FIXED: Properly initialized as empty array
  });

  const [courseOptions, setCourseOptions] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [filters, setFilters] = useState({
    class_name: "",
    subject_name: "",
    paper: "",
    chapter: "",
    chapter_name: "",
    topic: "",
    question_type: "",
    difficulty: ""
  });
  const [searchText, setSearchText] = useState('');

  // Fetch teacher courses on mount
  useEffect(() => {
    getTeacherCourses()
      .then((r) => {
        if (r.data.success) setCourseOptions(r.data.data);
      })
      .catch(() => toast.error('Failed to load courses'));
  }, []);

  // Fetch questions with filters
  const fetchQuestions = useCallback(async (searchFilters = {}) => {
    setLoading(true);
    try {
      const res = await getAllQuestions(searchFilters);
      setQuestions(res.data.data || []);
    } catch (err) {
      console.error("Error fetching questions:", err);
      toast.error("Failed to load questions");
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch questions when filters change
  useEffect(() => {
    const activeFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v && v.trim())
    );
    fetchQuestions(activeFilters);
  }, [filters, fetchQuestions]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const handleClearFilters = () => {
    setFilters({
      class_name: "",
      subject_name: "",
      paper: "",
      chapter: "",
      chapter_name: "",
      topic: "",
      question_type: "",
      difficulty: ""
    });
    setSearchText("");
    fetchQuestions({});
  };

  // Toggle question selection ✅ FIXED
  const toggleQuestion = (questionId) => {
    setFormData(prev => {
      const ids = prev.question_ids;
      if (ids.includes(questionId)) {
        return { ...prev, question_ids: ids.filter(id => id !== questionId) };
      } else {
        return { ...prev, question_ids: [...ids, questionId] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.question_ids.length === 0) {
      toast.error("Select at least one question");
      return;
    }
    if (!formData.course_id && !formData.subject_id && !formData.batch_id) {
      toast.error("Select at least course OR subject OR batch");
      return;
    }
    
    setLoading(true);
    try {
      // Handle live quiz end_time calculation
      let examData = { ...formData };
      if (formData.exam_type === "live_quiz" && formData.start_time) {
        const start = new Date(formData.start_time);
        const end = new Date(start.getTime() + (formData.hours_open || 24) * 60 * 60 * 1000);
        examData.end_time = end.toISOString().slice(0, 16);
      }

      console.log("Submitting exam data:", examData); // Debug log
      await createExam(examData);
      toast.success("Exam created successfully!");
      navigate("/teacher/manage-exams");
    } catch (err) {
      console.error("Create exam error:", err.response?.data || err);
      toast.error(err.response?.data?.message || "Failed to create exam");
    } finally {
      setLoading(false);
    }
  };

  // Filter questions client-side by search
  const filteredQuestions = questions.filter(q => 
    !searchText || q.question_text.toLowerCase().includes(searchText.toLowerCase())
  );

  const isLiveQuiz = formData.exam_type === "live_quiz";
  const subjectCourseLabel = isSchoolClass(filters.class_name) ? "Subject" : "Course";

  return (
    <div className="min-h-screen bg-[#030712] text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link 
            to="/teacher/dashboard" 
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-6 text-sm"
          >
            <FiArrowLeft /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Create New Exam
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Exam Basic Info */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h2 className="text-xl font-bold mb-6">Exam Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Course <span className="text-red-400">*</span>
                </label>
                <select
                  name="course_id"
                  value={formData.course_id}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                  required
                >
                  <option value="">Select Course</option>
                  {courseOptions.map(course => (
                    <option key={course.course_id} value={course.course_id}>
                      {course.course_title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Exam Type
                </label>
                <select
                  name="exam_type"
                  value={formData.exam_type}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="scheduled">Scheduled Exam</option>
                  <option value="live_quiz">Live Quiz</option>
                  <option value="practice">Practice Test</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Mathematics Midterm 2024"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  name="duration_minutes"
                  value={formData.duration_minutes}
                  onChange={handleChange}
                  min="15"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>

              {isLiveQuiz ? (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Hours Open
                  </label>
                  <input
                    type="number"
                    name="hours_open"
                    value={formData.hours_open}
                    onChange={handleChange}
                    min="1"
                    max="168"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    End Time (optional)
                  </label>
                  <input
                    type="datetime-local"
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
              )}
            </div>

            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <p className="text-sm text-blue-300">
                {isLiveQuiz 
                  ? "Live Quiz: Students join with access code during window. Single attempt."
                  : "Scheduled Exam: Fixed time window. Multiple practice attempts allowed."
                }
              </p>
            </div>
          </div>

          {/* Questions Selection */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Select Questions</h2>
              <div className="text-2xl font-bold text-purple-400">
                {formData.question_ids.length} selected
              </div>
            </div>

            {/* Filters */}
            <div className="bg-[#0B1120] border border-white/10 rounded-xl p-6 mb-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                <select 
                  name="class_name" 
                  value={filters.class_name}
                  onChange={handleFilterChange}
                  className="bg-[#13151f] border border-white/10 text-white px-3 py-2 rounded-lg text-sm"
                >
                  <option value="">All Classes</option>
                  {CLASS_OPTIONS.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
                
                <input
                  name="subject_name"
                  value={filters.subject_name}
                  onChange={handleFilterChange}
                  placeholder="Subject/Course"
                  className="bg-[#13151f] border border-white/10 text-white px-3 py-2 rounded-lg text-sm"
                />
                
                <select 
                  name="question_type" 
                  value={filters.question_type}
                  onChange={handleFilterChange}
                  className="bg-[#13151f] border border-white/10 text-white px-3 py-2 rounded-lg text-sm"
                >
                  <option value="">All Types</option>
                  {QUESTION_TYPE_OPTIONS.map(type => (
                    <option key={type} value={type}>{type.toUpperCase()}</option>
                  ))}
                </select>
                
                <select 
                  name="difficulty" 
                  value={filters.difficulty}
                  onChange={handleFilterChange}
                  className="bg-[#13151f] border border-white/10 text-white px-3 py-2 rounded-lg text-sm"
                >
                  <option value="">All Levels</option>
                  {DIFFICULTY_OPTIONS.map(diff => (
                    <option key={diff} value={diff}>{diff.charAt(0).toUpperCase() + diff.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <div className="relative flex-1">
                  <FiSearch className="absolute left-3 top-2.5 text-gray-500 w-4 h-4" />
                  <input
                    value={searchText}
                    onChange={handleSearchChange}
                    placeholder="Search questions..."
                    className="w-full bg-[#13151f] border border-white/10 pl-9 pr-3 py-2 rounded-lg text-sm text-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-300 hover:bg-white/20"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Questions List */}
            <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : filteredQuestions.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  No questions found. {filters.class_name && "Try different filters."}
                  <br />
                  <Link to="/teacher/create-question" className="text-purple-400 hover:text-purple-300 mt-2 inline-block">
                    Create questions first →
                  </Link>
                </div>
              ) : (
                filteredQuestions.map((q) => {
                  const selected = formData.question_ids.includes(q.question_id);
                  return (
                    <div
                      key={q.question_id}
                      className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-lg ${
                        selected 
                          ? 'bg-purple-500/15 border-purple-400 shadow-purple-500/25' 
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                      onClick={() => toggleQuestion(q.question_id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          selected ? 'bg-purple-600 text-white' : 'bg-white/10 border border-white/20'
                        }`}>
                          {selected && <span className="text-xs font-bold">✓</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-200 truncate mb-1">
                            {q.question_text}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className={`px-2 py-0.5 rounded-full ${
                              q.difficulty === 'easy' ? 'bg-emerald-500/20 text-emerald-400' :
                              q.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {q.difficulty?.charAt(0).toUpperCase() + q.difficulty?.slice(1)}
                            </span>
                            <span>{q.question_type?.toUpperCase()}</span>
                            <span className="text-purple-400 font-medium">
                              {q.max_marks} marks
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || formData.question_ids.length === 0}
            className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 
                       text-white font-bold rounded-xl hover:shadow-2xl hover:shadow-purple-500/25 
                       transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
          >
            {loading ? (
              <>
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating...
              </>
            ) : (
              <>
                <FiSave className="w-5 h-5" />
                Create Exam ({formData.question_ids.length} questions)
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateExam;

