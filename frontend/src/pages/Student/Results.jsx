import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { getExamById, getResults } from "../../services/api";
import { FiPrinter, FiAward, FiBarChart2, FiCheckCircle, FiXCircle, FiCpu } from "react-icons/fi";
import toast from "react-hot-toast";

const Results = () => {
  const { id } = useParams();
  const location = useLocation();
  const [exam, setExam] = useState(null);
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    fetchResults();
  }, [id]);

  const fetchResults = async () => {
    try {
      const [examRes, resultsRes] = await Promise.all([
        getExamById(id),
        getResults(id),
      ]);
      
      setExam(examRes.data.data);
      setResults(resultsRes.data.results || []);
      setSummary(resultsRes.data.summary || {});
      
      // Show summary from navigation state if available (instant result)
      if (location.state?.summary) {
        toast.success("Exam submitted! Check your detailed results below.", {
          duration: 4000,
        });
      }
    } catch (err) {
      toast.error("Failed to load results");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    setPrinting(true);
    window.print();
    setPrinting(false);
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 80) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (percentage >= 60) return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    if (percentage >= 40) return "text-orange-400 bg-orange-500/10 border-orange-500/20";
    return "text-rose-400 bg-rose-500/10 border-rose-500/20";
  };

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case "easy": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "medium": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "hard": return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default: return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  const formatPercentage = (marks, total) => {
    return total > 0 ? ((marks / total) * 100).toFixed(1) + "%" : "0%";
  };

  const ConfidenceBar = ({ confidence }) => (
    <div className="w-full bg-white/5 rounded-full h-2">
      <div 
        className="h-2 rounded-full transition-all bg-gradient-to-r from-indigo-400 to-purple-500"
        style={{ width: `${confidence * 100}%` }}
      />
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0C15] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-gray-400">Loading your results...</p>
        </div>
      </div>
    );
  }

  const totalMarks = summary?.total_marks || 0;
  const obtainedMarks = summary?.obtained_marks || 0;
  const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;
  const passed = percentage >= 50;

  return (
    <div className="min-h-screen bg-[#0B0C15] text-gray-200 print:bg-white print:text-gray-900">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-[#0B0C15]/95 backdrop-blur-xl border-b border-white/5 shadow-lg print:bg-white print:border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-2">
                {exam?.title || "Exam Results"}
              </h1>
              <p className="text-gray-400 md:text-lg">
                {exam?.subject_name} • {new Date(exam?.start_time).toLocaleDateString()}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center">
              <div className="text-center sm:text-right">
                <div className={`text-3xl font-bold ${getGradeColor(percentage)}`}>
                  {obtainedMarks}/{totalMarks}
                </div>
                <div className={`text-xl font-bold ${passed ? "text-emerald-400" : "text-rose-400"}`}>
                  {formatPercentage(obtainedMarks, totalMarks)} {passed ? "🎉 Pass" : "Retry"}
                </div>
              </div>
              
              <button
                onClick={handlePrint}
                disabled={printing}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all print:hidden disabled:opacity-50"
              >
                <FiPrinter />
                {printing ? "Printing..." : "Print Results"}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8 print:py-8 print:px-4">
        {/* Exam Summary Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl print:bg-gray-50 print:border-gray-200">
          <h2 className="text-xl font-bold text-white mb-6 print:text-gray-900">📊 Exam Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "Total Marks", value: totalMarks, icon: FiAward },
              { label: "Obtained", value: obtainedMarks?.toFixed(1), icon: FiCheckCircle },
              { label: "Percentage", value: `${percentage.toFixed(1)}%`, icon: FiBarChart2 },
              { label: "Status", value: passed ? "Passed ✅" : "Needs Improvement", icon: passed ? FiCheckCircle : FiXCircle },
            ].map((item, i) => (
              <div key={i} className="group p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all print:bg-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-all print:bg-gray-200">
                    <item.icon className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 uppercase tracking-wider font-medium">{item.label}</p>
                    <p className="text-xl font-bold text-white print:text-gray-900">{item.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Per-Question Results */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white print:text-gray-900">📝 Question-wise Breakdown</h2>
          
          {results.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-white/20 rounded-2xl bg-white/5 print:bg-gray-50 print:border-gray-300">
              <FiAward className="text-6xl text-gray-500 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-300 mb-2 print:text-gray-700">No detailed results available</h3>
              <p className="text-gray-500 max-w-md mx-auto print:text-gray-600">
                Results are being processed. Refresh the page or contact your teacher.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((result, index) => {
                const questionPercentage = result.max_marks > 0 
                  ? ((result.marks_obtained || 0) / result.max_marks * 100).toFixed(1)
                  : 0;
                const isCorrect = (result.marks_obtained || 0) === result.max_marks;
                
                return (
                  <div key={result.result_id} className="group bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl p-6 transition-all print:bg-gray-50 print:border-gray-200 print:hover:border-gray-200">
                    {/* Question Header */}
                    <div className="flex items-start justify-between mb-6 print:mb-4">
                      <div className="flex items-center gap-3">
                        <span className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold text-sm border-2 ${isCorrect 
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500" 
                          : "bg-rose-500/10 text-rose-400 border-rose-500"
                        }`}>
                          {isCorrect ? "✓" : "✗"}
                        </span>
                        <div>
                          <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getDifficultyColor(result.difficulty || 'medium')}`}>
                            {result.difficulty || 'medium'}
                          </span>
                          <h3 className="ml-2 text-lg font-semibold text-white inline print:text-gray-900">{result.question_text}</h3>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white print:text-gray-900">
                          {result.marks_obtained?.toFixed(1) || 0}/{result.max_marks}
                        </div>
                        <div className={`text-sm font-bold mt-1 ${isCorrect ? "text-emerald-400" : "text-rose-400"}`}>
                          {questionPercentage}%
                        </div>
                      </div>
                    </div>

                    {/* Answer Details */}
                    {result.question_type === "mcq" && (
                      <div className="space-y-3">
                        <div className="bg-white/10 p-4 rounded-xl print:bg-gray-100">
                          <p className="text-sm text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                            Your Answer
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              isCorrect ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 border" 
                              : "bg-rose-500/20 text-rose-300 border-rose-500/30 border"
                            }`}>
                              You selected: {result.selected_option || 'None'}
                            </span>
                            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border-emerald-500/30 border font-medium">
                              Correct: {result.correct_option}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {result.question_type === "true_false" && (
                      <div className="bg-white/10 p-4 rounded-xl print:bg-gray-100">
                        <p className="text-sm text-gray-400 uppercase tracking-wider mb-2">Your Answer</p>
                        <span className={`px-4 py-2 rounded-xl font-bold text-sm ${
                          isCorrect 
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 border" 
                            : "bg-rose-500/20 text-rose-300 border-rose-500/30 border"
                        }`}>
                          {result.selected_option || 'No answer'}
                        </span>
                        {result.correct_option && (
                          <span className="ml-3 px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border-emerald-500/30 border font-bold text-sm">
                            Correct: {result.correct_option}
                          </span>
                        )}
                      </div>
                    )}

                    {result.question_type === "descriptive" && (
                      <div className="space-y-4">
                        {/* Student Answer */}
                        <div className="bg-gradient-to-br from-gray-900/50 to-black/30 border border-white/10 rounded-2xl p-5">
                          <p className="text-xs text-gray-500 uppercase mb-3 flex items-center gap-2">
                            📝 Your Answer
                          </p>
                          <p className="text-gray-200 leading-relaxed whitespace-pre-wrap print:text-gray-800">
                            {result.descriptive_answer || "No answer provided"}
                          </p>
                        </div>

                        {/* LLM Feedback */}
                        {result.feedback && (
                          <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-indigo-500/10 border border-indigo-500/20 rounded-2xl p-5 backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-indigo-500/20 rounded-xl">
                                <FiCpu className="w-5 h-5 text-indigo-400" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                                  AI Evaluation
                                  {result.confidence_score !== undefined && result.confidence_score !== null && (
                                    <>
                                      <span className="text-xs bg-indigo-500/20 px-2 py-1 rounded-full">
                                        Confidence: {(result.confidence_score * 100).toFixed(0)}%
                                      </span>
                                      <ConfidenceBar confidence={result.confidence_score} />
                                    </>
                                  )}
                                </p>
                              </div>
                            </div>
                            <p className="text-gray-100 text-sm leading-relaxed print:text-gray-800">
                              {result.feedback}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Print Styles */}
        <style jsx>{`
          @media print {
            .print\\:hidden { display: none !important; }
            .min-h-screen { min-height: auto !important; }
          }
        `}</style>
      </div>
    </div>
  );
};

export default Results;

