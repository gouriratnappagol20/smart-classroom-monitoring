import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Shield, 
  Play, 
  Square, 
  FileDown, 
  Clock, 
  Radio, 
  Layers, 
  Users, 
  AlertTriangle,
  Settings,
  Bell
} from 'lucide-react';

export default function Navbar({ 
  isExamActive, 
  onToggleExam, 
  onExportReport,
  stats,
  unacknowledgedAlertsCount = 0
}) {
  const [time, setTime] = useState(new Date());
  const [elapsedSeconds, setElapsedSeconds] = useState(3740); // Initial 1h 02m

  // Live wall clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Exam timer
  useEffect(() => {
    let interval;
    if (isExamActive) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isExamActive]);

  const formatTimer = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 shadow-glass">
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* ================= LEFT: BRAND & ROOM INFO ================= */}
        <div className="flex items-center space-x-4">
          {/* Logo badge with glowing shield */}
          <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 p-[1px] shadow-glow-cyan">
            <div className="w-full h-full bg-[#0b0f19] rounded-2xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-cyan-400" />
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold tracking-wider text-base sm:text-lg bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent font-mono">
                SENTINEL
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-medium">
                AI PROCTOR
              </span>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
              <span className="text-slate-300 font-medium">Lab 402</span>
              <span>·</span>
              <span className="hidden md:inline text-slate-400">CS-301 Midterm Exam</span>
            </div>
          </div>
        </div>

        {/* ================= CENTER: LIVE STATUS & CLOCK ================= */}
        <div className="hidden md:flex items-center space-x-4 bg-[#090d18]/80 px-4 py-2 rounded-2xl border border-slate-800/90 shadow-inner">
          {/* Pulsing Live indicator */}
          <div className="flex items-center space-x-2">
            <span className="relative flex h-3 w-3">
              {isExamActive ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              )}
            </span>
            <span className={`text-xs font-mono font-bold tracking-widest uppercase ${
              isExamActive ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              {isExamActive ? 'LIVE MONITORING' : 'EXAM PAUSED'}
            </span>
          </div>

          <div className="h-4 w-px bg-slate-800"></div>

          {/* Real-time wall clock */}
          <div className="flex items-center space-x-1.5 text-xs font-mono text-slate-300">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </div>

          <div className="h-4 w-px bg-slate-800"></div>

          {/* Exam Elapsed Timer */}
          <div className="text-xs font-mono">
            <span className="text-slate-500 mr-1.5">ELAPSED:</span>
            <span className="text-cyan-300 font-semibold">{formatTimer(elapsedSeconds)}</span>
          </div>
        </div>

        {/* ================= RIGHT: CONTROLS & EXPORT ================= */}
        <div className="flex items-center space-x-3">
          
          {/* Quick Metrics Badges (Desktop) */}
          <div className="hidden xl:flex items-center space-x-2 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 font-mono">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>3 / 3 Active</span>
            </div>
            
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono ${
              stats.violations > 0 
                ? 'bg-rose-500/10 border-rose-500/40 text-rose-300' 
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            }`}>
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{stats.violations} Violation</span>
            </div>
          </div>

          {/* Start / End Exam Toggle Button with smooth color transition */}
          <button
            onClick={onToggleExam}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium text-xs tracking-wide transition-all duration-300 shadow-md ${
              isExamActive 
                ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/50 hover:shadow-glow-danger' 
                : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 hover:shadow-glow-safe'
            }`}
          >
            {isExamActive ? (
              <>
                <Square className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
                <span>End Exam</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
                <span>Start Exam</span>
              </>
            )}
          </button>

          {/* Export Audit Report Button */}
          <button
            onClick={onExportReport}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 transition-all duration-200 text-xs font-medium shadow-sm hover:shadow-glow-cyan"
            title="Export Comprehensive Audit Log"
          >
            <FileDown className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Export Audit Report</span>
            <span className="sm:hidden">Report</span>
          </button>
        </div>

      </div>
    </header>
  );
}

