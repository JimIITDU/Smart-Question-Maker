import React from 'react';

export default function ShortAnswerCard({ question, answer, onAnswer }) {
  const text = answer?.answer_text || '';

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="bg-purple-500/20 text-purple-300 text-xs font-semibold px-2 py-1 rounded-full">Short Answer</span>
        <span className="bg-white/5 text-gray-400 text-xs px-2 py-1 rounded-full border border-white/10">{question.total_marks} marks</span>
        <span className="bg-white/5 text-gray-400 text-xs px-2 py-1 rounded-full border border-white/10 capitalize">{question.difficulty}</span>
      </div>
      <h3 className="text-lg font-medium text-white mb-6">{question.question_text}</h3>
      <textarea
        value={text}
        onChange={e => onAnswer(question.id, { answer_text: e.target.value })}
        placeholder="Write your answer here..."
        rows={4}
        className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500 transition-colors placeholder-gray-600 resize-none"
      />
      <div className="flex justify-between mt-2">
        <span className="text-xs text-gray-600">Keep it concise</span>
        <span className="text-xs text-gray-600">{text.length} chars</span>
      </div>
    </div>
  );
}