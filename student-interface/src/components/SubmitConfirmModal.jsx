import React, { useState } from 'react';
import { X, Send, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function SubmitConfirmModal({ 
  totalQuestions, 
  answeredCount, 
  markedCount, 
  onClose, 
  onConfirm 
}) {
  const [confirmed, setConfirmed] = useState(false);
  const unansweredCount = totalQuestions - answeredCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Examination Submission Summary
              </h3>
              <p className="text-xs text-slate-500">
                Review your completion status before final confirmation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-lg font-bold font-mono text-emerald-700">{answeredCount}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Answered</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-lg font-bold font-mono text-slate-700">{unansweredCount}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Unanswered</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-lg font-bold font-mono text-purple-700">{markedCount}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">In Review</div>
            </div>
          </div>

          {/* Warning notice if questions are unanswered */}
          {unansweredCount > 0 && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                You have <strong>{unansweredCount} unanswered questions</strong>. Once submitted, you cannot re-enter the examination or modify your selections.
              </span>
            </div>
          )}

          {/* Checkbox agreement */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <label className="flex items-start space-x-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-slate-700 leading-snug">
                I confirm that I have completed my examination to the best of my ability and wish to finalize my submission now.
              </span>
            </label>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            Return to Examination
          </button>

          <button
            onClick={onConfirm}
            disabled={!confirmed}
            className={`px-4 py-2 rounded-lg text-xs font-semibold text-white transition-colors shadow-xs ${
              confirmed 
                ? 'bg-blue-700 hover:bg-blue-800' 
                : 'bg-slate-300 cursor-not-allowed text-slate-500'
            }`}
          >
            Confirm & Submit Exam
          </button>
        </div>

      </div>
    </div>
  );
}

