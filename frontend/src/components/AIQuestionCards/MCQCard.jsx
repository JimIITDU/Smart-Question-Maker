import React from 'react';

export default function MCQCard({ question, answer, onAnswer }) {
  const selected = answer?.selected_option;
  const optionLabels = ['A', 'B', 'C', 'D'];
  const options = question.options || {};

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="bg-indigo-500/20 text-indigo-300 text-xs font-semibold px-2 py-1 rounded-full">MCQ</span>
        <span className="bg-white/5 text-gray-400 text-xs px-2 py-1 rounded-full border border-white/10">{question.total_marks} marks</span>
        <span className="bg-white/5 text-gray-400 text-xs px-2 py-1 rounded-full border border-white/10 capitalize">{question.difficulty}</span>
      </div>
      <h3 className="text-lg font-medium text-white mb-6">{question.question_text}</h3>
      <div className="space-y-3">
        {optionLabels.map(label => (
          options[label] && (
            <button key={label}
              onClick={() => onAnswer(question.id, { selected_option: label })}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all font-medium ${
                selected === label
                  ? 'border-indigo-500 bg-indigo-500/10 text-indigo-200'
                  : 'border-white/10 hover:border-white/20 text-gray-300 bg-white/5'
              }`}>
              <span className="font-bold mr-3 text-indigo-400">{label}.</span>
              {options[label]}
            </button>
          )
        ))}
      </div>
    </div>
  );
}