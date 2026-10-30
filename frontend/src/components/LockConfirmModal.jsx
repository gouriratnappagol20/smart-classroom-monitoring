import React from 'react';
import { X, Lock, Unlock, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function LockConfirmModal({ student, onClose, onConfirm }) {
  if (!student) return null;

  const isCurrentlyLocked = student.isLocked;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className={`p-4 border-b flex items-center justify-between ${
          isCurrentlyLocked ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'
        }`}>
          <div className="flex items-center space-x-2.5">
            <div className={`p-2 rounded-lg ${
              isCurrentlyLocked ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
            }`}>
              {isCurrentlyLocked ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {isCurrentlyLocked ? 'Unlock Candidate Workstation' : 'Lock Candidate Workstation'}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Target: {student.id} · {student.studentName}
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
            {isCurrentlyLocked ? (
              <span>
                Unlocking this workstation will restore mouse and keyboard input devices for <strong>{student.studentName}</strong> ({student.id}) and clear the on-screen lockout banner.
              </span>
            ) : (
              <span>
                Locking this workstation will immediately freeze <strong>{student.id}</strong>, disabling candidate input devices and displaying an impenetrable proctor lockout message.
              </span>
            )}
          </p>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              This security intervention is timestamped and recorded in the forensic audit report.
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
              onConfirm(student.id);
              onClose();
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold text-white transition-colors shadow-xs ${
              isCurrentlyLocked 
                ? 'bg-emerald-600 hover:bg-emerald-700' 
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isCurrentlyLocked ? 'Confirm Unlock Station' : 'Confirm Lock Station'}
          </button>
        </div>

      </div>
    </div>
  );
}

