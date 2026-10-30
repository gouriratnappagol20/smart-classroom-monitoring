import React from 'react';
import { X, Play, Square, AlertTriangle, ShieldCheck } from 'lucide-react';
import { examConfig } from '../data/mockData';

export default function ExamActionModal({ isExamActive, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className={`p-4 border-b flex items-center justify-between ${
          isExamActive ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'
        }`}>
          <div className="flex items-center space-x-2.5">
            <div className={`p-2 rounded-lg ${
              isExamActive ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {isExamActive ? <Square className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {isExamActive ? 'Conclude Examination Session' : 'Resume Examination Session'}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {examConfig.courseCode} · Lab 402
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3 text-xs text-slate-600">
          <p>
            {isExamActive ? (
              <span>
                Are you sure you want to <strong>conclude the examination</strong>? This will freeze student submission timers, finalize the incident audit trail, and compile the final attendance roster.
              </span>
            ) : (
              <span>
                Resume active proctoring for <strong>{examConfig.title}</strong>? Workstations will return to active monitoring and live compliance tracking will resume.
              </span>
            )}
          </p>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              Chief Invigilator authorization required: <strong>Dr. Evelyn Reed</strong>.
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-2.5">
          <button
            onClick={onClose}
            className="px-3.5 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-200/70 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold text-white transition-colors shadow-xs ${
              isExamActive 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {isExamActive ? 'Yes, Conclude Exam' : 'Yes, Resume Exam'}
          </button>
        </div>

      </div>
    </div>
  );
}

