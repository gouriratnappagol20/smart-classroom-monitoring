import React, { useState, useMemo } from 'react';
import StudentCard from './StudentCard';
import { 
  Search, 
  Filter, 
  ShieldCheck, 
  AlertOctagon, 
  Monitor, 
  Users, 
  Lock, 
  Unlock,
  RotateCcw,
  Sparkles
} from 'lucide-react';

export default function LiveMonitoringPage({ 
  students, 
  onSendWarning, 
  onRequestLockToggle, 
  onInspect, 
  onCaptureScreenshot,
  onToggleLockAll,
  isAllLocked,
  onSimulateViolationToggle 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'safe' | 'violation'

  const safeCount = students.filter(s => s.status === 'safe').length;
  const violationCount = students.filter(s => s.status === 'violation').length;

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = 
        student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.activeWindow.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.ipAddress.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = 
        statusFilter === 'all' || 
        student.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [students, searchTerm, statusFilter]);

  return (
    <div className="space-y-5">
      
      {/* 1. Monitoring Header & Control Bar */}
      <div className="card-base p-4 bg-white flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name, PC ID, or active window..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors font-mono"
          />
        </div>

        {/* Filter Tabs & Quick Action Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Status Filters */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({students.length})
            </button>
            <button
              onClick={() => setStatusFilter('safe')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md font-medium transition-colors ${
                statusFilter === 'safe'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Safe ({safeCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('violation')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md font-medium transition-colors ${
                statusFilter === 'violation'
                  ? 'bg-red-50 text-red-700 border border-red-200 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-red-700'
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5 text-red-600" />
              <span>Violations ({violationCount})</span>
            </button>
          </div>

          {/* Master Lock All */}
          <button
            onClick={onToggleLockAll}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium border transition-colors shadow-xs ${
              isAllLocked
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-red-700'
            }`}
          >
            {isAllLocked ? (
              <>
                <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Unlock All</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-red-600" />
                <span>Lock All</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* 2. Responsive Workstation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredStudents.map((student) => (
          <StudentCard
            key={student.id}
            student={student}
            onSendWarning={onSendWarning}
            onRequestLockToggle={onRequestLockToggle}
            onInspect={onInspect}
            onCaptureScreenshot={onCaptureScreenshot}
          />
        ))}
      </div>

      {/* Zero State if Filter matches nothing */}
      {filteredStudents.length === 0 && (
        <div className="card-base p-10 text-center bg-white">
          <Users className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No live student connections</h3>
          <p className="text-xs text-slate-500 mt-1">Try clearing your search query or selecting "All".</p>
          <button
            onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
            className="mt-3 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200"
          >
            Reset Filters
          </button>
        </div>
      )}

    </div>
  );
}


