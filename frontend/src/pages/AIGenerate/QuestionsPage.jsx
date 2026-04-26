import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchSession, setAnswer, nextQuestion,
  prevQuestion, setIndex
} from '../../store/questionSlice';
import { submitAllAnswers, downloadQuestionsPDF } from '../../api/aiQuestionApi';
import MCQCard from '../../components/AIQuestionCards/MCQCard';
import ShortAnswerCard from '../../components/AIQuestionCards/ShortAnswerCard';
import WrittenCard from '../../components/AIQuestionCards/WrittenCard';

export default function QuestionsPage() {
  const { sessionId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { session, currentIndex, answers, loading } = useSelector(s => s.questions);
  const [submitting, setSubmitting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    dispatch(fetchSession(sessionId));
  }, [sessionId, dispatch]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  if (loading || !session) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#0B0C15]">
        <div className="text-center">
          <p className="text-indigo-400 text-lg mb-2">Loading questions...</p>
          <p className="text-gray-600 text-sm">Please wait</p>
        </div>
      </div>
    );
  }

  const questions = session.questions || [];
  const current = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;
  const isLast = currentIndex === questions.length - 1;

  const handleAnswer = (questionId, answerData) => {
    dispatch(setAnswer({ questionId, answer: answerData }));
  };

  const handleSubmitAll = async () => {
    if (answeredCount === 0) {
      showToast('Please answer at least one question.');
      return;
    }
    setSubmitting(true);
    try {
      const answersPayload = Object.entries(answers).map(([qId, ans]) => ({
        question_id: parseInt(qId),
        answer_text: ans.answer_text || '',
        selected_option: ans.selected_option || ''
      }));
      await submitAllAnswers(answersPayload);
      showToast('Answers submitted!');
      navigate(`/ai-results/${sessionId}`);
    } catch {
      showToast('Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      await downloadQuestionsPDF(sessionId);
      showToast('PDF downloaded!');
    } catch {
      showToast('Failed to download PDF.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0C15] pb-20">
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-indigo-600 text-white px-5 py-3 rounded-xl shadow-lg text-sm">
          {toast}
        </div>
      )}

      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b border-white/5 bg-[#0B0C15]/70 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate('/questions')} className="text-gray-400 hover:text-white text-sm transition-colors">
            ← Question Bank
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 bg-white/5 px-3 py-1 rounded-full border border-white/10">
              {answeredCount}/{questions.length} answered
            </span>
            <button onClick={handleDownloadPDF} disabled={downloading}
              className="bg-white/10 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-white/15 disabled:opacity-50 transition-colors border border-white/10">
              {downloading ? 'Downloading...' : 'PDF'}
            </button>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-3xl mx-auto px-6 pt-8">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-500 mb-1">
            <span>Q{currentIndex + 1} of {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-1.5">
            <div className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Question number pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {questions.map((q, i) => (
            <button key={q.id} onClick={() => dispatch(setIndex(i))}
              className={`w-9 h-9 rounded-full text-sm font-medium transition-all ${
                i === currentIndex ? 'bg-indigo-600 text-white'
                  : answers[q.id] ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-white/5 border border-white/10 text-gray-500 hover:border-white/20'
              }`}>
              {i + 1}
            </button>
          ))}
        </div>

        {/* Question card */}
        <div>
          {current?.question_type === 'mcq' && (
            <MCQCard question={current} answer={answers[current.id]} onAnswer={handleAnswer} />
          )}
          {current?.question_type === 'short' && (
            <ShortAnswerCard question={current} answer={answers[current.id]} onAnswer={handleAnswer} />
          )}
          {current?.question_type === 'written' && (
            <WrittenCard question={current} answer={answers[current.id]} onAnswer={handleAnswer} />
          )}
        </div>

        {/* Navigation buttons */}
        <div className="mt-6 flex gap-3">
          <button onClick={() => dispatch(prevQuestion())} disabled={currentIndex === 0}
            className="px-5 py-3 border border-white/10 bg-white/5 text-white rounded-xl font-medium disabled:opacity-40 hover:bg-white/10 transition-colors">
            ← Prev
          </button>

          {!isLast ? (
            <button onClick={() => dispatch(nextQuestion())}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-xl py-3 font-medium hover:shadow-lg transition-all">
              Next →
            </button>
          ) : (
            <button onClick={handleSubmitAll} disabled={submitting}
              className="flex-1 bg-emerald-600 text-white rounded-xl py-3 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-emerald-700 transition-colors">
              {submitting ? 'Submitting...' : `Submit All (${answeredCount}/${questions.length})`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}