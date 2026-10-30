import React from 'react';
import { 
  Bookmark, 
  RotateCcw, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  HelpCircle,
  Code2
} from 'lucide-react';

export default function QuestionCard({ 
  question, 
  currentIndex, 
  totalQuestions, 
  selectedOption, 
  isMarkedForReview, 
  onSelectOption, 
  onToggleReview, 
  onClearResponse, 
  onNext, 
  onPrev 
}) {
  if (!question) return null;

  return (
    <div className="exam-card bg-white p-5 sm:p-6 flex flex-col justify-between min-h-[480px]">
      
      {/* 1. Question Header Banner */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center space-x-2.5">
            <span className="text-sm font-bold text-slate-900 font-mono">
              Question {currentIndex + 1}
            </span>
            <span className="text-slate-300">/</span>
            <span className="text-xs text-slate-500 font-mono">
              {totalQuestions}
            </span>

            {/* Topic Badge */}
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
              {question.topic}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Status Indicator */}
            {isMarkedForReview && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                <Bookmark className="w-3 h-3 fill-current" /> In Review
              </span>
            )}

            {selectedOption ? (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                Answered
              </span>
            ) : (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                Not Answered
              </span>
            )}

            <span className="text-xs font-mono font-bold text-blue-700 px-2 py-0.5 rounded bg-blue-50 border border-blue-200">
              +{question.marks} Marks
            </span>
          </div>
        </div>

        {/* 2. Question Text */}
        <div className="text-sm sm:text-base font-medium text-slate-900 leading-relaxed whitespace-pre-line mb-6 font-sans">
          {question.question}
        </div>

        {/* 3. Multiple Choice Options */}
        <div className="space-y-2.5 mb-6">
          {question.options.map((opt) => {
            const isSelected = selectedOption === opt.key;

            return (
              <div
                key={opt.key}
                onClick={() => onSelectOption(opt.key)}
                className={`flex items-start space-x-3 p-3.5 rounded-xl border text-xs sm:text-sm cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-blue-50/80 border-blue-500 ring-1 ring-blue-500/30 text-blue-950 font-medium shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 text-slate-800'
                }`}
              >
                {/* Option Key Badge [A], [B] */}
                <div className={`w-6 h-6 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 transition-colors ${
                  isSelected 
                    ? 'bg-blue-700 text-white' 
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  {opt.key}
                </div>

                {/* Option Label */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <span className="leading-snug">{opt.text}</span>
                </div>

                {/* Radio selection circle */}
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                  isSelected ? 'border-blue-600' : 'border-slate-300'
                }`}>
                  {isSelected && <div className="w-2 h-2 rounded-full bg-blue-600"></div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Action Control Bar */}
      <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Left Actions: Review and Clear */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onToggleReview}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg border font-medium transition-colors shadow-xs ${
              isMarkedForReview
                ? 'bg-purple-100 text-purple-800 border-purple-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isMarkedForReview ? 'fill-current text-purple-700' : 'text-slate-500'}`} />
            <span>{isMarkedForReview ? 'Unmark Review' : 'Mark for Review'}</span>
          </button>

          {selectedOption && (
            <button
              onClick={onClearResponse}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Response</span>
            </button>
          )}
        </div>

        {/* Right Actions: Prev and Save & Next */}
        <div className="flex items-center space-x-2 ml-auto">
          <button
            onClick={onPrev}
            disabled={currentIndex === 0}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg border font-medium transition-colors ${
              currentIndex === 0
                ? 'opacity-40 cursor-not-allowed bg-slate-50 text-slate-400 border-slate-200'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-xs'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <button
            onClick={onNext}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg font-semibold bg-blue-700 hover:bg-blue-800 text-white transition-colors shadow-xs"
          >
            <span>{currentIndex === totalQuestions - 1 ? 'Save & Review' : 'Save & Next'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
}

