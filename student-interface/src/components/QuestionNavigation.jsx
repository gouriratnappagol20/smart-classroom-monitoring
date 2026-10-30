import React from 'react';
import { Bookmark, CheckCircle2, Circle, AlertCircle, Send } from 'lucide-react';

export default function QuestionNavigation({ 
  totalQuestions, 
  currentIndex, 
  userAnswers, 
  markedForReview, 
  onSelectQuestion,
  onRequestSubmit 
}) {
  const answeredCount = Object.keys(userAnswers).filter(k => userAnswers[k] !== null).length;
  const reviewCount = markedForReview.length;
  const unansweredCount = totalQuestions - answeredCount;

  return (
    <div className="exam-card bg-white p-4 sm:p-5 flex flex-col justify-between space-y-5">
      
      <div>
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
          Question Palette
        </h3>

        {/* 1. Questions Grid Tiles */}
        <div className="grid grid-cols-5 gap-2 sm:gap-2.5 mb-5">
          {Array.from({ length: totalQuestions }, (_, i) => {
            const qId = i + 1;
            const isAnswered = userAnswers[qId] !== undefined && userAnswers[qId] !== null;
            const isReview = markedForReview.includes(qId);
            const isCurrent = currentIndex === i;

            // Compute Tile Color
            let tileStyle = "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200";
            if (isAnswered && isReview) {
              tileStyle = "bg-amber-500 text-white border-amber-600 font-bold";
            } else if (isReview) {
              tileStyle = "bg-purple-100 text-purple-800 border-purple-300 font-bold";
            } else if (isAnswered) {
              tileStyle = "bg-emerald-600 text-white border-emerald-700 font-bold";
            }

            return (
              <button
                key={qId}
                onClick={() => onSelectQuestion(i)}
                className={`relative h-10 rounded-lg text-xs font-mono font-medium border flex items-center justify-center transition-all ${tileStyle} ${
                  isCurrent ? 'ring-2 ring-blue-600 ring-offset-2 scale-105 shadow-xs' : ''
                }`}
              >
                {qId}
                {isReview && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-purple-600"></span>
                )}
              </button>
            );
          })}
        </div>

        {/* 2. Visual Status Legend */}
        <div className="pt-3 border-t border-slate-100 space-y-2 text-[11px] text-slate-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-3.5 h-3.5 rounded bg-emerald-600 inline-block"></span>
              <span>Answered</span>
            </div>
            <span className="font-mono font-bold text-slate-900">{answeredCount}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-3.5 h-3.5 rounded bg-slate-200 inline-block"></span>
              <span>Not Answered</span>
            </div>
            <span className="font-mono font-bold text-slate-900">{unansweredCount}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-3.5 h-3.5 rounded bg-purple-100 border border-purple-300 inline-block"></span>
              <span>Marked for Review</span>
            </div>
            <span className="font-mono font-bold text-slate-900">{reviewCount}</span>
          </div>
        </div>
      </div>

      {/* 3. Submit Quick Action */}
      <div className="pt-3 border-t border-slate-100">
        <button
          onClick={onRequestSubmit}
          className="w-full py-2.5 px-3 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-colors flex items-center justify-center space-x-1.5 shadow-xs"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Final Exam Submit</span>
        </button>
      </div>

    </div>
  );
}

