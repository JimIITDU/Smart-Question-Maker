import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getResults, downloadQuestionsPDF } from '../../api/aiQuestionApi';

export default function ResultsPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    getResults(sessionId)
      .then(({ data }) => { setResults(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [sessionId]);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      await downloadQuestionsPDF(sessionId);
    } catch {
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-[#0B0C15]">
      <p className="text-indigo-400">Loading results...</p>
    </div>
  );

  if (!results) return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#0B0C15] gap-4">
      <p className="text-gray-400">Results not found or not submitted yet.</p>
      <button onClick={() => navigate('/ai-generate')}
        className="bg-indigo-600 text-white px-6 py-2 rounded-xl">
        Try Again
      </button>
    </div>
  );

  const {
    overall_score = 0,
    grade = 'F',
    answers = [],
    marks_obtained = 0,
    total_marks = 0,
    total_questions = 0,
    answered_questions = 0
  } = results;

  const gradeColor =
    overall_score >= 80 ? '#22c55e' :
    overall_score >= 60 ? '#3b82f6' :
    overall_score >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className="min-h-screen bg-[#0B0C15] py-10 px-4">
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10">

        {/* Actions */}
        <div className="flex justify-between mb-6">
          <button onClick={() => navigate('/dashboard')}
            className="text-gray-400 hover:text-white transition-colors text-sm">
            ← Dashboard
          </button>
          <button onClick={handleDownloadPDF} disabled={downloading}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors text-sm">
            {downloading ? 'Preparing...' : 'Download PDF'}
          </button>
        </div>

        {/* Score hero */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center mb-5">
          <div className="text-7xl font-bold mb-1" style={{ color: gradeColor }}>
            {Math.round(overall_score)}%
          </div>
          <div className="text-3xl font-bold mb-1" style={{ color: gradeColor }}>
            Grade: {grade}
          </div>
          <p className="text-gray-400">{marks_obtained} / {total_marks} marks</p>
          <p className="text-gray-500 text-sm mt-1">
            {answered_questions} of {total_questions} questions answered
          </p>
          <div className={`mt-4 inline-block px-4 py-2 rounded-full text-sm font-medium ${
            overall_score >= 80 ? 'bg-emerald-500/10 text-emerald-300' :
            overall_score >= 60 ? 'bg-indigo-500/10 text-indigo-300' :
            overall_score >= 40 ? 'bg-amber-500/10 text-amber-300' :
            'bg-red-500/10 text-red-300'}`}>
            {overall_score >= 80 ? '🎉 Excellent!' :
             overall_score >= 60 ? '👍 Good Job!' :
             overall_score >= 40 ? '📚 Keep Studying' :
             '❗ Review the Material'}
          </div>
        </div>

        {/* Detailed results */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden mb-5">
          <div className="px-5 py-4 border-b border-white/10">
            <h2 className="font-semibold text-white">Detailed Results</h2>
          </div>
          <div className="divide-y divide-white/5">
            {answers.map((ans, i) => (
              <div key={ans.id || i} className="p-5">
                <div
                  className="flex items-start justify-between gap-3 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === ans.id ? null : ans.id)}>
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full mt-0.5 shrink-0 flex items-center justify-center text-xs font-bold text-white ${
                      (ans.score_percentage || 0) >= 70 ? 'bg-emerald-500' :
                      (ans.score_percentage || 0) >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}>
                      {i + 1}
                    </div>
                    <div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mr-2 ${
                        ans.question_type === 'mcq' ? 'bg-indigo-500/20 text-indigo-300' :
                        ans.question_type === 'short' ? 'bg-purple-500/20 text-purple-300' :
                        'bg-emerald-500/20 text-emerald-300'}`}>
                        {ans.question_type?.toUpperCase()}
                      </span>
                      <p className="text-gray-300 text-sm font-medium mt-1">{ans.question_text}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`font-bold text-lg ${
                      (ans.score_percentage || 0) >= 70 ? 'text-emerald-400' :
                      (ans.score_percentage || 0) >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
                      {ans.marks_obtained}/{ans.total_marks}
                    </div>
                    <div className="text-xs text-gray-600">
                      {expandedId === ans.id ? '▲ hide' : '▼ show'}
                    </div>
                  </div>
                </div>

                {expandedId === ans.id && (
                  <div className="mt-4 space-y-3">
                    {(ans.selected_option || ans.answer_text) && (
                      <div className="bg-white/5 rounded-xl p-3">
                        <p className="text-xs font-semibold text-gray-500 mb-1">YOUR ANSWER</p>
                        <p className="text-gray-300 text-sm">
                          {ans.question_type === 'mcq'
                            ? `Option ${ans.selected_option}`
                            : ans.answer_text}
                        </p>
                      </div>
                    )}
                    {ans.question_type === 'mcq' && ans.correct_answer && (
                      <div className="bg-emerald-500/10 rounded-xl p-3 border border-emerald-500/20">
                        <p className="text-xs font-semibold text-emerald-400 mb-1">CORRECT ANSWER</p>
                        <p className="text-emerald-300 text-sm">Option {ans.correct_answer}</p>
                      </div>
                    )}
                    {ans.llm_feedback?.feedback && (
                      <div className="bg-indigo-500/10 rounded-xl p-3 border border-indigo-500/20">
                        <p className="text-xs font-semibold text-indigo-400 mb-1">🤖 AI FEEDBACK</p>
                        <p className="text-indigo-200 text-sm">{ans.llm_feedback.feedback}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <button onClick={() => navigate('/ai-generate')}
            className="bg-gradient-to-r from-indigo-600 to-cyan-600 text-white px-8 py-3 rounded-xl font-medium hover:shadow-lg transition-all">
            Generate New Questions
          </button>
        </div>
      </div>
    </div>
  );
}