import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Play, 
  Square, 
  FileDown, 
  Menu, 
  ShieldCheck, 
  AlertTriangle,
  ChevronRight,
  Radio
} from 'lucide-react';

export default function Header({ 
  activePage, 
  isExamActive, 
  onToggleExamRequest, 
  onExportReport,
  onOpenMobileSidebar,
  stats
}) {
  const [time, setTime] = useState(new Date());
  const [elapsedSeconds, setElapsedSeconds] = useState(4460); // 1h 14m approx

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

  const getPageTitle = () => {
    switch (activePage) {
      case 'overview':
        return {
          title: 'System Overview & Analytics',
          subtitle: 'Live integrity metrics, candidate status breakdown, and recent activity'
        };
      case 'monitoring':
        return {
          title: 'Live Student Monitoring',
          subtitle: 'Active workstation grid for PC-01, PC-02, and PC-03'
        };
      case 'alerts':
        return {
          title: 'Incident Radar & Audit Reports',
          subtitle: 'Real-time security violations log, candidate audit table, and CSV export'
        };
      case 'settings':
        return {
          title: 'Examination Parameters & Settings',
          subtitle: 'Room configuration, proctor authorizations, and security thresholds'
        };
      default:
        return {
          title: 'Classroom Monitoring System',
          subtitle: 'Computer Science Department Examination Hall'
        };
    }
  };

  const pageInfo = getPageTitle();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        
        {/* Left: Mobile Menu & Page Title */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenMobileSidebar}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden border border-slate-200"
            title="Open Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {pageInfo.title}
              </h1>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              {pageInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Center: Live Monitoring Status & Clock */}
        <div className="hidden md:flex items-center space-x-3 bg-slate-50 px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs">
          {/* Status Badge */}
          <div className="flex items-center space-x-1.5">
            <span className="relative flex h-2.5 w-2.5">
              {isExamActive ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              )}
            </span>
            <span className={`font-semibold tracking-wide uppercase text-[11px] ${
              isExamActive ? 'text-emerald-700' : 'text-amber-700'
            }`}>
              {isExamActive ? 'Live Monitoring' : 'Exam Paused'}
            </span>
          </div>

          <div className="h-3.5 w-px bg-slate-300"></div>

          {/* Clock */}
          <div className="flex items-center space-x-1 text-slate-600 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </div>

          <div className="h-3.5 w-px bg-slate-300"></div>

          {/* Elapsed */}
          <div className="font-mono text-slate-600">
            <span className="text-slate-400 mr-1">Elapsed:</span>
            <span className="font-semibold text-slate-800">{formatTimer(elapsedSeconds)}</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-2.5">
          {/* Start / End Exam Control Button */}
          <button
            onClick={onToggleExamRequest}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors shadow-xs ${
              isExamActive 
                ? 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200' 
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
            }`}
          >
            {isExamActive ? (
              <>
                <Square className="w-3 h-3 fill-red-600 text-red-600" />
                <span>End Exam</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                <span>Start Exam</span>
              </>
            )}
          </button>

          {/* Export Report Shortcut */}
          <button
            onClick={onExportReport}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-xs"
            title="Download CSV Audit Report"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export Report</span>
          </button>
        </div>

      </div>
    </header>
  );
}

