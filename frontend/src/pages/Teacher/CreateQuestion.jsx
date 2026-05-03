﻿import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createQuestion } from "../../services/api";
import toast from "react-hot-toast";
import { FiArrowLeft, FiSave, FiCheckSquare } from "react-icons/fi";

// Class options
const CLASS_OPTIONS = [
  "1st",
  "2nd",
  "3rd",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9-10 (Secondary)",
  "11-12(Higher Secondary)",
  "Bachelor(hons)",
  "Masters",
  "MPhil",
  "others",
];

// Paper options
const PAPER_OPTIONS = ["1st", "2nd", "3rd"];

// Chapter number options (1-50)
const CHAPTER_OPTIONS = Array.from({ length: 50 }, (_, i) =>
  (i + 1).toString(),
);

// School level classes
const SCHOOL_CLASSES = [
  "1st",
  "2nd",
  "3rd",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9-10 (Secondary)",
  "11-12(Higher Secondary)",
];

const isSchoolClass = (className) => SCHOOL_CLASSES.includes(className);

const CreateQuestion = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    class_name: "",
    subject_name: "",
    paper: "",
    chapter: "",
    chapter_name: "",
    topic: "",
    question_text: "",
    question_type: "mcq",
    difficulty: "easy",
    max_marks: 1,
    option_text_a: "",
    option_text_b: "",
    option_text_c: "",
    option_text_d: "",
    correct_option: "",
    is_multiple_correct: false,
    expected_answer: "",
    source: "manual",
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedCorrectOptions, setSelectedCorrectOptions] = useState([]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleCorrectOption = (opt) => {
    setSelectedCorrectOptions((prev) => {
      const newSelection = prev.includes(opt)
        ? prev.filter((o) => o !== opt)
        : [...prev, opt];

      setFormData((fd) => ({
        ...fd,
        correct_option: newSelection.sort().join(","),
        is_multiple_correct: newSelection.length > 1,
      }));

      return newSelection;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createQuestion(formData);
      toast.success("Question created successfully!");
      setShowSuccess(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create question");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAnother = () => {
    setFormData({
      class_name: "",
      subject_name: "",
      paper: "",
      chapter: "",
      chapter_name: "",
      topic: "",
      question_text: "",
      question_type: "mcq",
      difficulty: "easy",
      max_marks: 1,
      option_text_a: "",
      option_text_b: "",
      option_text_c: "",
      option_text_d: "",
      correct_option: "",
      is_multiple_correct: false,
      expected_answer: "",
      source: "manual",
    });
    setSelectedCorrectOptions([]);
    setShowSuccess(false);
  };

  const subjectCourseLabel = isSchoolClass(formData.class_name)
    ? "Subject"
    : "Course";

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      

      <main className="max-w-4xl mx-auto px-6 pt-28 pb-20">
        <form
          onSubmit={handleSubmit}
          className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6"
        >
          {/* Classification Fields */}
          <div className="bg-white/5 rounded-xl p-6 space-y-4 border border-white/5">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">
              Question Classification
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                  Class <span className="text-red-400">*</span>
                </label>
                <select
                  name="class_name"
                  value={formData.class_name}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#0B1120] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 appearance-none"
                >
                  <option value="" className="bg-[#0B1120]">
                    Select Class
                  </option>
                  {CLASS_OPTIONS.map((cls) => (
                    <option key={cls} value={cls} className="bg-[#0B1120]">
                      {cls}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                  {subjectCourseLabel} <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="subject_name"
                  value={formData.subject_name}
                  onChange={handleChange}
                  required
                  placeholder={`e.g. ${isSchoolClass(formData.class_name) ? "Mathematics" : "Computer Science"}`}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                  Paper{" "}
                  <span className="text-gray-500 normal-case font-normal">
                    (optional)
                  </span>
                </label>
                <select
                  name="paper"
                  value={formData.paper}
                  onChange={handleChange}
                  className="w-full bg-[#0B1120] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 appearance-none"
                >
                  <option value="" className="bg-[#0B1120]">
                    Select Paper
                  </option>
                  {PAPER_OPTIONS.map((p) => (
                    <option key={p} value={p} className="bg-[#0B1120]">
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                  Chapter <span className="text-red-400">*</span>
                </label>
                <select
                  name="chapter"
                  value={formData.chapter}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#0B1120] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 appearance-none"
                >
                  <option value="" className="bg-[#0B1120]">
                    Select Chapter
                  </option>
                  {CHAPTER_OPTIONS.map((ch) => (
                    <option key={ch} value={ch} className="bg-[#0B1120]">
                      Chapter {ch}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                  Chapter Name{" "}
                  <span className="text-gray-500 normal-case font-normal">
                    (optional)
                  </span>
                </label>
                <input
                  type="text"
                  name="chapter_name"
                  value={formData.chapter_name}
                  onChange={handleChange}
                  placeholder="e.g. Quadratic Equations"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                  Topic{" "}
                  <span className="text-gray-500 normal-case font-normal">
                    (optional)
                  </span>
                </label>
                <input
                  type="text"
                  name="topic"
                  value={formData.topic}
                  onChange={handleChange}
                  placeholder="e.g. Nature of Roots"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
              Question Text <span className="text-red-400">*</span>
            </label>
            <textarea
              name="question_text"
              value={formData.question_text}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Enter your question here..."
              className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                Type
              </label>
              <select
                name="question_type"
                value={formData.question_type}
                onChange={handleChange}
                className="w-full bg-[#0B1120] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
              >
                <option value="mcq">MCQ</option>
                <option value="descriptive">Descriptive</option>
                <option value="true_false">True/False</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                Difficulty
              </label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className="w-full bg-[#0B1120] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                Max Marks
              </label>
              <input
                type="number"
                name="max_marks"
                value={formData.max_marks}
                onChange={handleChange}
                min={1}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* MCQ Options */}
          {formData.question_type === "mcq" && (
            <div className="bg-white/5 rounded-xl p-6 space-y-4">
              <label className="text-sm font-semibold text-gray-300">
                Answer Options
              </label>
              <div className="grid grid-cols-2 gap-4">
                {["a", "b", "c", "d"].map((opt) => (
                  <div key={opt} className="relative">
                    <span className="absolute left-3 top-3 font-bold text-blue-400 uppercase text-sm">
                      {opt}
                    </span>
                    <input
                      type="text"
                      name={`option_text_${opt}`}
                      value={formData[`option_text_${opt}`]}
                      onChange={handleChange}
                      placeholder={`Option ${opt.toUpperCase()}`}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:border-blue-500 text-sm"
                    />
                  </div>
                ))}
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                  Correct Option(s){" "}
                  <span className="text-blue-400 normal-case font-normal">
                    - Select all that apply
                  </span>
                </label>
                <div className="flex gap-2">
                  {["A", "B", "C", "D"].map((opt) => (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => toggleCorrectOption(opt)}
                      className={`flex-1 py-2 rounded-xl font-bold border transition-all flex items-center justify-center gap-2 ${
                        selectedCorrectOptions.includes(opt)
                          ? "bg-emerald-600 border-emerald-500 text-white"
                          : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                      }`}
                    >
                      {selectedCorrectOptions.includes(opt) && (
                        <FiCheckSquare className="text-sm" />
                      )}
                      {opt}
                    </button>
                  ))}
                </div>
                {selectedCorrectOptions.length > 1 && (
                  <p className="text-xs text-emerald-400 mt-2">
                    Multiple correct answers selected:{" "}
                    {selectedCorrectOptions.sort().join(", ")}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Descriptive */}
          {formData.question_type === "descriptive" && (
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                Expected Answer (Reference)
              </label>
              <textarea
                name="expected_answer"
                value={formData.expected_answer}
                onChange={handleChange}
                rows={3}
                placeholder="Reference answer for evaluation..."
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>
          )}

          {/* True/False */}
          {formData.question_type === "true_false" && (
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                Correct Answer
              </label>
              <div className="flex gap-4">
                {["True", "False"].map((opt) => (
                  <button
                    type="button"
                    key={opt}
                    onClick={() =>
                      setFormData({ ...formData, correct_option: opt })
                    }
                    className={`flex-1 py-3 rounded-xl font-bold border transition-all ${formData.correct_option === opt ? "bg-blue-600 border-blue-500 text-white" : "bg-white/5 border-white/10 text-gray-400"}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-blue-900/40 transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <FiSave /> Save Question
              </>
            )}
          </button>
        </form>

        {/* Success Modal */}
        {showSuccess && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#13151f]/90 border border-white/10 rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-emerald-500/20 border-4 border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-12 h-12 text-emerald-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Success!</h2>
                <p className="text-gray-400">Question saved successfully</p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleSaveAnother}
                  className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-emerald-900/40 transition-all flex items-center justify-center gap-2"
                >
                  ➕ Save & Create Another
                </button>
                <Link
                  to="/teacher/questions"
                  className="w-full block py-4 px-6 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-indigo-900/40 transition-all text-center"
                  onClick={() => setShowSuccess(false)}
                >
                  📚 Go to Question Bank
                </Link>
                <Link
                  to="/teacher/exams/create"
                  className="w-full block py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-purple-900/40 transition-all text-center"
                  onClick={() => setShowSuccess(false)}
                >
                  📝 Create Exam with this
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CreateQuestion;
