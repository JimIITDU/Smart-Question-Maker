import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getExamById,
  getExamQuestions,
  getAllResults,
  evaluateWritten,
  exportExamPDF,
} from "../../services/api";

import toast from "react-hot-toast";
import {
  FiArrowLeft,
  FiCpu,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiDownload,
} from "react-icons/fi";

const ExamDetails = () => {
  const { id } = useParams();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [numSets, setNumSets] = useState(1);
  const [showExportOptions, setShowExportOptions] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [e, q, r] = await Promise.all([
        getExamById(id),
        getExamQuestions(id),
        getAllResults(id),
      ]);
      setExam(e.data.data);
      setQuestions(q.data.data);
      setResults(r.data.data || []);
    } catch (err) {
      toast.error("Failed to load exam details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = async () => {
    setEvaluating(true);
    try {
      const res = await evaluateWritten(id);
      toast.success(res.data.message || "Evaluation complete!");
      // Refresh results
      const r = await getAllResults(id);
      setResults(r.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Evaluation failed");
    } finally {
      setEvaluating(false);
    }
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const response = await exportExamPDF(id, numSets);
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const safeTitle = (exam?.title || "Exam").replace(/[^\\w\\s-]/g, "").replace(/\\s+/g, "_");
      link.setAttribute("download", `${safeTitle}_Sets_${numSets}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`PDF with ${numSets === 1 ? "1 set" : `${numSets} sets`} exported successfully!`);
      setShowExportOptions(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to export PDF");
    } finally {
      setExporting(false);
    }
  };

  // Group results by student
  const groupedResults = results.reduce((acc, result) => {
    const studentId = result.student_id;
    if (!acc[studentId]) {
      acc[studentId] = {
        student_name: result.student_name || `Student #${studentId}`,
        student_email: result.student_email,
        answers: [],
        totalMarks: 0,
        obtainedMarks: 0,
      };
    }
    acc[studentId].answers.push(result);
    acc[studentId].totalMarks += parseFloat(result.max_marks) || 0;
    acc[studentId].obtainedMarks += parseFloat(result.marks_obtained) || 0;
    return acc;
  }, {});

  // Count descriptive answers pending evaluation
  const pendingEvaluations = results.filter(
    (r) =>
      r.question_type === "descriptive" &&
      (r.evaluated_by === "pending" || !r.evaluated_by),
  ).length;

  if (loading)
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      

      <main className="max-w-5xl mx-auto px-6 pt-28 pb-20 space-y-6">
        {exam && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-white">
                {exam.title || "Untitled Exam"}
              </h2>
              <div className="flex items-center gap-2">
                {showExportOptions ? (
                  <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1 border border-white/10">
                    <select
                      value={numSets}
                      onChange={(e) => setNumSets(parseInt(e.target.value))}
                      className="bg-transparent text-white text-sm px-2 py-1 outline-none"
                    >
                      <option value={1}>None (1 Set)</option>
                      <option value={2}>2 Sets</option>
                      <option value={3}>3 Sets</option>
                      <option value={4}>4 Sets</option>
                    </select>
                    <button
                      onClick={handleExportPDF}
                      disabled={exporting}
                      className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-semibold text-sm hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      {exporting ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        </>
                      ) : (
                        <>
                          <FiDownload size={14} /> Export PDF
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setShowExportOptions(false)}
                      className="px-2 py-1.5 text-gray-400 hover:text-white text-sm"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowExportOptions(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all"
                  >
                    <FiDownload /> Export PDF
                  </button>
                )}
                {pendingEvaluations > 0 && (
                  <button
                    onClick={handleEvaluate}
                    disabled={evaluating}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {evaluating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>{" "}
                        Evaluating...
                      </>
                    ) : (
                      <>
                        <FiCpu /> Evaluate Written ({pendingEvaluations})
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Status", value: exam.status },
                { label: "Type", value: exam.exam_type },
                { label: "Duration", value: `${exam.duration_minutes} mins` },
                { label: "Access Code", value: exam.access_code || "N/A" },
              ].map((item, i) => (
                <div key={i} className="bg-white/5 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                    {item.label}
                  </p>
                  <p className="text-white font-bold">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-4">
            Questions ({questions.length})
          </h2>
          {questions.length === 0 ? (
            <p className="text-gray-500">No questions added</p>
          ) : (
            <div className="space-y-3">
              {questions.map((q, i) => (
                <div
                  key={q.question_id}
                  className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/5"
                >
                  <span className="text-gray-500 font-mono text-sm w-6">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-gray-200 text-sm">{q.question_text}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                        {q.question_type}
                      </span>
                      <span className="text-xs text-gray-400 bg-white/5 px-2 py-0.5 rounded">
                        {q.difficulty}
                      </span>
                      <span className="text-xs text-gray-400 bg-white/5 px-2 py-0.5 rounded">
                        {q.max_marks} marks
                      </span>
                      {q.correct_option && (
                        <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                          Correct: {q.correct_option}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-4">
            Student Results ({Object.keys(groupedResults).length})
          </h2>
          {Object.keys(groupedResults).length === 0 ? (
            <p className="text-gray-500">No submissions yet</p>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedResults).map(
                ([studentId, studentData]) => {
                  const percentage =
                    studentData.totalMarks > 0
                      ? (
                          (studentData.obtainedMarks / studentData.totalMarks) *
                          100
                        ).toFixed(1)
                      : 0;
                  const passed = percentage >= 50;

                  return (
                    <div
                      key={studentId}
                      className="bg-white/5 rounded-xl border border-white/5 overflow-hidden"
                    >
                      <div className="p-4 flex justify-between items-center bg-white/5">
                        <div>
                          <p className="text-white font-semibold">
                            {studentData.student_name}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {studentData.student_email}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-white">
                            {studentData.obtainedMarks}{" "}
                            <span className="text-gray-500 text-lg">
                              / {studentData.totalMarks}
                            </span>
                          </p>
                          <p
                            className={`text-sm font-bold ${passed ? "text-emerald-400" : "text-rose-400"}`}
                          >
                            {percentage}% - {passed ? "Pass" : "Fail"}
                          </p>
                        </div>
                      </div>

                      <div className="divide-y divide-white/5">
                        {studentData.answers.map((answer, idx) => (
                          <div key={idx} className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex gap-2">
                                <span className="text-xs text-gray-500">
                                  Q{idx + 1}
                                </span>
                                <span
                                  className={`text-xs px-2 py-0.5 rounded ${
                                    answer.question_type === "mcq"
                                      ? "bg-blue-500/10 text-blue-400"
                                      : answer.question_type === "descriptive"
                                        ? "bg-purple-500/10 text-purple-400"
                                        : "bg-amber-500/10 text-amber-400"
                                  }`}
                                >
                                  {answer.question_type}
                                </span>
                                {answer.evaluated_by && (
                                  <span
                                    className={`text-xs px-2 py-0.5 rounded flex items-center gap-1 ${
                                      answer.evaluated_by === "llm"
                                        ? "bg-indigo-500/10 text-indigo-400"
                                        : answer.evaluated_by === "teacher"
                                          ? "bg-emerald-500/10 text-emerald-400"
                                          : "bg-gray-500/10 text-gray-400"
                                    }`}
                                  >
                                    {answer.evaluated_by === "llm" ? (
                                      <FiCpu className="text-[10px]" />
                                    ) : (
                                      <FiCheckCircle className="text-[10px]" />
                                    )}
                                    {answer.evaluated_by}
                                  </span>
                                )}
                              </div>
                              <span className="text-white font-bold">
                                {answer.marks_obtained} / {answer.max_marks}
                              </span>
                            </div>

                            <p className="text-gray-300 text-sm mb-2">
                              {answer.question_text}
                            </p>

                            {answer.question_type === "descriptive" && (
                              <div className="space-y-2">
                                <div className="bg-white/5 rounded-lg p-3">
                                  <p className="text-xs text-gray-500 uppercase mb-1">
                                    Student Answer
                                  </p>
                                  <p className="text-gray-300 text-sm">
                                    {answer.descriptive_answer ||
                                      "No answer provided"}
                                  </p>
                                </div>
                                {answer.feedback && (
                                  <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-lg p-3">
                                    <p className="text-xs text-indigo-400 uppercase mb-1 flex items-center gap-1">
                                      <FiCpu className="text-[10px]" /> LLM
                                      Feedback
                                      {answer.confidence_score && (
                                        <span className="text-gray-500">
                                          (Confidence:{" "}
                                          {(
                                            answer.confidence_score * 100
                                          ).toFixed(0)}
                                          %)
                                        </span>
                                      )}
                                    </p>
                                    <p className="text-gray-300 text-sm">
                                      {answer.feedback}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}

                            {answer.question_type === "mcq" && (
                              <div className="flex gap-4 text-sm">
                                <span className="text-gray-500">
                                  Correct:{" "}
                                  <span className="text-emerald-400">
                                    {answer.correct_option}
                                  </span>
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ExamDetails;
