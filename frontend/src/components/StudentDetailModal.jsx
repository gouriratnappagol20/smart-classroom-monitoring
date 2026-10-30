import React from 'react';
import { 
  X, 
  ShieldCheck, 
  AlertOctagon, 
  Send, 
  Lock, 
  Unlock, 
  Activity, 
  Terminal, 
  UserCheck, 
  UserX,
  Sparkles,
  Wifi,
  HardDrive
} from 'lucide-react';
import ScreenPreview from './ScreenPreview';

export default function StudentDetailModal({ 
  student, 
  onClose, 
  onSendWarning, 
  onRequestLockToggle 
}) {
  if (!student) return null;

  const isViolation = student.status === 'violation';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg border ${
              isViolation 
                ? 'bg-red-50 text-red-700 border-red-200' 
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {isViolation ? <AlertOctagon className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 font-mono">{student.id}</h3>
                <span className="text-slate-300">·</span>
                <span className="text-sm font-semibold text-slate-800">{student.studentName}</span>
                <span className="text-xs text-slate-500 font-mono">({student.studentRoll})</span>
              </div>
              <p className="text-xs text-slate-500 font-mono">
                {student.seat} · IP: {student.ipAddress} · Ping: {student.latency}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* High Resolution Screen Feed */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Live Full-Resolution Screen View
              </span>
              <span className="text-xs font-mono text-emerald-600 font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Direct Telemetry Stream (60 FPS)
              </span>
            </div>
            
            <div className="rounded-lg overflow-hidden border border-slate-200 shadow-sm">
              <ScreenPreview 
                screenType={student.screenType}
                status={student.status}
                isLocked={student.isLocked}
                webcamStatus={student.webcamStatus}
                studentName={student.studentName}
              />
            </div>
          </div>

          {/* Telemetry and Detailed Audit Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* System Health */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-blue-600" /> Workstation Telemetry
              </h4>

              <div className="space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Foreground Window:</span>
                  <span className="font-mono text-slate-900 font-medium truncate max-w-[200px]" title={student.activeWindow}>
                    {student.activeWindow}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Active Process:</span>
                  <span className="font-mono text-slate-900 font-medium">{student.processName}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Keystroke Rhythm:</span>
                  <span className="font-mono text-slate-800">{student.details?.keystrokeRate || '62 WPM'}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Network Traffic:</span>
                  <span className="font-mono text-emerald-700 font-medium">{student.details?.networkPackets}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Exam File Status:</span>
                  <span className="font-mono text-blue-700">{student.details?.examFile}</span>
                </div>
              </div>
            </div>

            {/* AI Proctor Assessment */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" /> AI Proctor Integrity Score
              </h4>

              <div className="space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Compliance Rating:</span>
                  <span className={`font-mono font-bold ${
                    student.complianceScore > 85 ? 'text-emerald-700' : 'text-red-600'
                  }`}>
                    {student.complianceScore}% / 100%
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Facial Biometrics:</span>
                  <span className="font-mono text-slate-800">{student.details?.faceConfidence}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Total Violations:</span>
                  <span className="font-mono text-red-600 font-bold">{student.violationCount} recorded</span>
                </div>
                {student.violationReason && (
                  <div className="p-2 rounded bg-red-100 text-red-800 text-[11px] leading-relaxed font-sans">
                    <strong>Flagged Cause:</strong> {student.violationReason}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Process List */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-slate-700" /> Process Tree
            </h4>
            <div className="flex flex-wrap gap-2">
              {student.details?.openedWindows?.map((app, idx) => (
                <span 
                  key={idx}
                  className={`text-xs px-2.5 py-1 rounded-md border font-mono ${
                    app.toLowerCase().includes('chatgpt') || app.toLowerCase().includes('chrome')
                      ? 'bg-red-100 text-red-800 border-red-200 font-bold'
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  {app}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-mono">
            State: <span className="font-bold text-slate-800">{student.isLocked ? 'LOCKED' : 'ONLINE'}</span>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => {
                onClose();
                onSendWarning(student);
              }}
              className="flex items-center gap-1.5 text-xs font-medium px-3.5 py-2 rounded-lg bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200 hover:border-amber-300 transition-colors shadow-xs"
            >
              <Send className="w-3.5 h-3.5 text-amber-600" />
              <span>Send Warning</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onRequestLockToggle(student);
              }}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg text-white transition-colors shadow-xs ${
                student.isLocked 
                  ? 'bg-emerald-600 hover:bg-emerald-700' 
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {student.isLocked ? (
                <>
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Unlock Workstation</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Lock Workstation</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
