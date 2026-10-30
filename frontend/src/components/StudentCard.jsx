import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertOctagon, 
  Monitor, 
  Cpu, 
  HardDrive, 
  Wifi, 
  Send, 
  Lock, 
  Unlock, 
  Maximize2, 
  Camera, 
  Activity,
  Clock,
  ExternalLink
} from 'lucide-react';
import ScreenPreview from './ScreenPreview';

export default function StudentCard({ 
  student, 
  onSendWarning, 
  onRequestLockToggle, 
  onInspect,
  onCaptureScreenshot 
}) {
  const [screenshotFlash, setScreenshotFlash] = useState(false);

  const isViolation = student.status === 'violation';

  const handleCapture = (e) => {
    e.stopPropagation();
    setScreenshotFlash(true);
    setTimeout(() => setScreenshotFlash(false), 400);
    if (onCaptureScreenshot) onCaptureScreenshot(student);
  };

  return (
    <div 
      className={`card-base card-hover flex flex-col overflow-hidden transition-all duration-200 ${
        isViolation 
          ? 'border-red-300 ring-1 ring-red-100 bg-white' 
          : 'border-slate-200 bg-white'
      }`}
    >
      {/* 1. Card Header */}
      <div className={`px-4 py-3 flex items-center justify-between border-b ${
        isViolation ? 'bg-red-50/60 border-red-200' : 'bg-slate-50/80 border-slate-200'
      }`}>
        <div className="flex items-center space-x-2.5">
          <div className={`p-1.5 rounded-lg border ${
            isViolation 
              ? 'bg-red-100 text-red-700 border-red-200' 
              : 'bg-white text-blue-600 border-slate-200'
          }`}>
            <Monitor className="w-4 h-4" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-bold text-sm text-slate-900">{student.id}</span>
              <span className="text-slate-300">·</span>
              <span className="text-xs font-semibold text-slate-800">{student.studentName}</span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              {student.seat} · {student.ipAddress}
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div>
          {isViolation ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Violation</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Safe</span>
            </span>
          )}
        </div>
      </div>

      {/* 2. Large Clear Screen Preview */}
      <div className="p-3.5 relative">
        <ScreenPreview 
          screenType={student.screenType}
          status={student.status}
          isLocked={student.isLocked}
          webcamStatus={student.webcamStatus}
          studentName={student.studentName}
        />

        {/* Screenshot feedback flash */}
        {screenshotFlash && (
          <div className="absolute inset-3.5 bg-white/70 rounded-lg pointer-events-none transition-opacity duration-300 z-30"></div>
        )}
      </div>

      {/* 3. Active Window & Application Title */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2 truncate pr-2">
          <span className="text-slate-500 text-[11px] font-medium shrink-0">Active App:</span>
          <span className={`font-mono text-[11px] truncate font-medium ${
            isViolation ? 'text-red-700 font-semibold' : 'text-slate-700'
          }`} title={student.activeWindow}>
            {student.activeWindow}
          </span>
        </div>

        <span className="text-[10px] text-slate-500 flex items-center gap-1 shrink-0 font-sans">
          <Clock className="w-3 h-3 text-slate-400" />
          {student.lastActiveTime}
        </span>
      </div>

      {/* 4. Station Telemetry Strip */}
      <div className="px-4 py-2 border-t border-slate-100 grid grid-cols-4 gap-2 text-[11px] text-slate-600 bg-white">
        {/* CPU */}
        <div>
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>CPU</span>
            <span className="font-mono text-slate-700 font-medium">{student.cpuUsage}%</span>
          </div>
          <div className="w-full h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
            <div 
              className={`h-full rounded-full ${student.cpuUsage > 50 ? 'bg-amber-500' : 'bg-blue-600'}`}
              style={{ width: `${student.cpuUsage}%` }}
            ></div>
          </div>
        </div>

        {/* RAM */}
        <div>
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>RAM</span>
            <span className="font-mono text-slate-700 font-medium">{student.ramUsage}%</span>
          </div>
          <div className="w-full h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
            <div 
              className={`h-full rounded-full ${student.ramUsage > 70 ? 'bg-red-500' : 'bg-slate-600'}`}
              style={{ width: `${student.ramUsage}%` }}
            ></div>
          </div>
        </div>

        {/* Latency */}
        <div className="flex items-center space-x-1 justify-center border-l border-slate-100 pl-2">
          <Wifi className="w-3 h-3 text-slate-400" />
          <span className="font-mono text-[10px] text-slate-700">{student.latency}</span>
        </div>

        {/* Compliance */}
        <div className="flex items-center space-x-1 justify-end border-l border-slate-100 pl-2">
          <Activity className="w-3 h-3 text-blue-500" />
          <span className={`font-mono text-[10px] font-bold ${
            student.complianceScore > 85 ? 'text-emerald-700' : 'text-red-600'
          }`}>
            {student.complianceScore}%
          </span>
        </div>
      </div>

      {/* 5. Warning Alert strip if warnings exist */}
      {student.warningsSent && student.warningsSent.length > 0 && (
        <div className="px-4 py-1.5 bg-amber-50/80 border-t border-amber-200 text-[11px] text-amber-800 flex items-center justify-between">
          <span className="truncate">⚠️ Sent: "{student.warningsSent[student.warningsSent.length - 1]}"</span>
          <span className="text-[10px] bg-amber-100 px-1.5 py-0.2 rounded font-semibold shrink-0">
            {student.warningsSent.length} warning(s)
          </span>
        </div>
      )}

      {/* 6. Card Action Footer */}
      <div className="px-4 py-2.5 bg-slate-50/60 border-t border-slate-200 flex items-center justify-between gap-2 mt-auto">
        <div className="flex items-center space-x-1.5">
          {/* Send Warning */}
          <button
            onClick={() => onSendWarning(student)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-700 border border-slate-200 hover:border-amber-300 transition-colors shadow-xs"
            title="Send Warning Message to Candidate"
          >
            <Send className="w-3 h-3 text-amber-600" />
            <span>Send Warning</span>
          </button>

          {/* Lock / Unlock Screen */}
          <button
            onClick={() => onRequestLockToggle(student)}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors shadow-xs ${
              student.isLocked
                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300'
                : 'bg-white hover:bg-red-50 text-slate-700 hover:text-red-700 border-slate-200 hover:border-red-300'
            }`}
            title={student.isLocked ? "Unlock Candidate Workstation" : "Lock Candidate Workstation"}
          >
            {student.isLocked ? (
              <>
                <Unlock className="w-3 h-3 text-emerald-600" />
                <span>Unlock</span>
              </>
            ) : (
              <>
                <Lock className="w-3 h-3 text-red-600" />
                <span>Lock Screen</span>
              </>
            )}
          </button>
        </div>

        <div className="flex items-center space-x-1">
          {/* Capture Evidence */}
          <button
            onClick={handleCapture}
            className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors shadow-xs"
            title="Capture Screenshot Evidence"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>

          {/* Inspect Screen Details */}
          <button
            onClick={() => onInspect(student)}
            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors shadow-xs"
            title="Inspect Candidate Detail"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
