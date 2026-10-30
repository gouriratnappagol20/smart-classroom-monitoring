import React from 'react';
import { 
  Shield, 
  Clock, 
  CheckCircle2, 
  Send, 
  UserCheck 
} from 'lucide-react';

export default function Header({ 
  student, 
  secondsLeft, 
  answeredCount, 
  totalQuestions, 
  isAutoSaving, 
  onRequestSubmit 
}) {
  const formatTime = (totalSec) => {
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const progressPercentage = Math.round((answeredCount / totalQuestions) * 100);

  // Timer color threshold
  const isUrgent = secondsLeft < 300; // < 5 mins
  const isWarning = secondsLeft < 900; // < 15 mins

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Brand & Course Title */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold shadow-xs">
            <Shield className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-bold text-sm tracking-tight text-slate-900">
                SENTINEL
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">
                CANDIDATE
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium truncate max-w-[220px] sm:max-w-none">
              CS-301: Advanced Systems Programming Midterm
            </p>
          </div>
        </div>

        {/* Center: Candidate Info & Auto-save Status */}
        <div className="hidden md:flex items-center space-x-4 bg-slate-50 px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center text-[10px] font-mono">
              {student?.name?.charAt(0) || "S"}
            </div>
            <div>
              <span className="font-semibold text-slate-800">{student?.name || "Candidate"}</span>
              <span className="text-[11px] text-slate-400 font-mono ml-1.5">({student?.id || "PC-02"})</span>
            </div>
          </div>

          <div className="h-3 w-px bg-slate-300"></div>

          {/* Auto-save status */}
          <div className="flex items-center space-x-1 font-mono text-[11px]">
            {isAutoSaving ? (
              <span className="text-amber-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                Saving...
              </span>
            ) : (
              <span className="text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                All responses saved
              </span>
            )}
          </div>
        </div>

        {/* Right: Countdown Timer & Submit CTA */}
        <div className="flex items-center space-x-3">
          
          {/* Progress (hidden on small) */}
          <div className="hidden lg:flex flex-col items-end text-xs mr-2">
            <span className="text-[11px] text-slate-500 font-medium">
              Progress: <strong className="text-slate-800">{answeredCount}/{totalQuestions}</strong> ({progressPercentage}%)
            </span>
            <div className="w-28 h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
              <div 
                className="bg-blue-600 h-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Countdown Clock */}
          <div className={`px-3 py-1.5 rounded-lg border font-mono font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-xs ${
            isUrgent 
              ? 'bg-red-50 text-red-700 border-red-300 animate-pulse' 
              : isWarning 
                ? 'bg-amber-50 text-amber-700 border-amber-300' 
                : 'bg-slate-50 text-slate-800 border-slate-200'
          }`}>
            <Clock className={`w-4 h-4 ${isUrgent ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-slate-500'}`} />
            <span>{formatTime(secondsLeft)}</span>
          </div>

          {/* Submit Exam Button */}
          <button
            onClick={onRequestSubmit}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white transition-colors shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Submit Examination</span>
            <span className="sm:hidden">Submit</span>
          </button>

        </div>

      </div>
    </header>
  );
}
