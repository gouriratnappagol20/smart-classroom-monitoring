import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Bot, 
  CameraOff, 
  Clipboard, 
  CheckCircle, 
  Volume2, 
  VolumeX, 
  Filter, 
  Trash2, 
  ExternalLink, 
  Lock, 
  Clock, 
  ChevronRight,
  BellRing
} from 'lucide-react';

export default function AlertSidebar({ 
  alerts, 
  onAcknowledgeAlert, 
  onAcknowledgeAll, 
  onSelectStudent,
  onLockStudent,
  students
}) {
  const [filter, setFilter] = useState('all'); // 'all' | 'unresolved' | 'critical'
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Filtered alerts
  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'unresolved') return !alert.acknowledged;
    if (filter === 'critical') return alert.severity === 'critical';
    return true;
  });

  const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length;

  const getAlertIcon = (iconType, severity) => {
    switch (iconType) {
      case 'Bot':
        return <Bot className="w-4 h-4 text-rose-400" />;
      case 'CameraOff':
        return <CameraOff className="w-4 h-4 text-amber-400" />;
      case 'Clipboard':
        return <Clipboard className="w-4 h-4 text-cyan-400" />;
      default:
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
    }
  };

  return (
    <aside className="w-full lg:w-96 glass-panel rounded-2xl flex flex-col border border-slate-800/80 shadow-2xl overflow-hidden h-[calc(100vh-6.5rem)] sticky top-24">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-800/80 bg-[#0c101c]/90 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="relative p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <BellRing className="w-4 h-4 animate-pulse" />
            {unacknowledgedCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping"></span>
            )}
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-1.5 tracking-wide">
              REAL-TIME ALERTS
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40">
                {unacknowledgedCount} Active
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">Live integrity radar & incident log</p>
          </div>
        </div>

        {/* Audio Mute & Bulk Action Controls */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-1.5 rounded-lg border transition-colors ${
              soundEnabled 
                ? 'bg-slate-800 border-slate-700 text-cyan-400 hover:text-cyan-300' 
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
            title={soundEnabled ? "Mute audio alarms" : "Enable audio alarms"}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {unacknowledgedCount > 0 && (
            <button
              onClick={onAcknowledgeAll}
              className="text-[10px] px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="Acknowledge All Alerts"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 py-2 border-b border-slate-800/60 bg-[#090d16]/70 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({alerts.length})
          </button>
          <button
            onClick={() => setFilter('unresolved')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
              filter === 'unresolved' 
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pending ({unacknowledgedCount})
          </button>
          <button
            onClick={() => setFilter('critical')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
              filter === 'critical' 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Critical
          </button>
        </div>

        <span className="text-[10px] text-slate-500 font-mono">
          Auto-eval: 2s
        </span>
      </div>

      {/* Vertically Scrolling Alert Cards Feed */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center p-4">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2">
              <CheckCircle className="w-5 h-5" />
            </div>
            <p className="text-xs font-medium text-slate-300">All Systems Nominal</p>
            <p className="text-[11px] text-slate-500 mt-0.5">No unresolved incident alerts in this filter.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isCritical = alert.severity === 'critical';
            const isHigh = alert.severity === 'high';
            const matchedStudent = students.find(s => s.id === alert.pcId);

            return (
              <div 
                key={alert.id}
                className={`relative rounded-xl p-3.5 transition-all duration-200 border ${
                  alert.acknowledged 
                    ? 'bg-slate-900/40 border-slate-800/50 opacity-60' 
                    : isCritical
                      ? 'bg-rose-950/30 border-rose-500/50 shadow-glow-danger hover:border-rose-400' 
                      : isHigh
                        ? 'bg-amber-950/25 border-amber-500/40 hover:border-amber-400'
                        : 'bg-slate-900/80 border-cyan-500/30'
                }`}
              >
                {/* Header: Alert Icon + Reason + Severity Tag */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`p-1.5 rounded-lg border ${
                      isCritical 
                        ? 'bg-rose-500/20 border-rose-500/40' 
                        : isHigh 
                          ? 'bg-amber-500/20 border-amber-500/40' 
                          : 'bg-cyan-500/20 border-cyan-500/40'
                    }`}>
                      {getAlertIcon(alert.iconType, alert.severity)}
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold leading-tight ${
                        isCritical ? 'text-rose-200' : isHigh ? 'text-amber-200' : 'text-slate-200'
                      }`}>
                        {alert.reason}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5 text-slate-500" />
                          {alert.timestamp}
                        </span>
                        <span className="text-slate-600">·</span>
                        <span className="text-[10px] text-slate-500">{alert.timeAgo}</span>
                      </div>
                    </div>
                  </div>

                  <span className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border ${
                    isCritical 
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
                      : isHigh
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  }`}>
                    {alert.severity}
                  </span>
                </div>

                {/* Target Student Tag */}
                <div className="mb-2 flex items-center justify-between bg-slate-950/60 rounded-lg px-2.5 py-1.5 border border-slate-800/80">
                  <div className="flex items-center space-x-1.5 text-[11px]">
                    <span className="font-mono font-bold text-cyan-400">{alert.pcId}</span>
                    <span className="text-slate-400">({alert.studentName})</span>
                  </div>
                  {matchedStudent && (
                    <button
                      onClick={() => onSelectStudent && onSelectStudent(matchedStudent)}
                      className="text-[10px] text-slate-400 hover:text-cyan-300 flex items-center gap-0.5 transition-colors"
                      title="Inspect Student Card"
                    >
                      <span>Focus</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Description details */}
                <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
                  {alert.details}
                </p>

                {/* Card Action Buttons */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                  {/* Acknowledge Button */}
                  {alert.acknowledged ? (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                      <CheckCircle className="w-3 h-3" /> Acknowledged
                    </span>
                  ) : (
                    <button
                      onClick={() => onAcknowledgeAlert(alert.id)}
                      className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition-colors shadow-sm"
                    >
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                      <span>Acknowledge</span>
                    </button>
                  )}

                  {/* Immediate Lock Student button if critical */}
                  {isCritical && matchedStudent && !matchedStudent.isLocked && (
                    <button
                      onClick={() => onLockStudent && onLockStudent(matchedStudent.id)}
                      className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition-colors"
                    >
                      <Lock className="w-2.5 h-2.5" />
                      <span>Lock PC</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Mini System Telemetry Ticker at footer */}
      <div className="p-2.5 bg-[#080b13] border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between font-mono">
        <div className="flex items-center space-x-1.5 truncate">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="text-slate-300">AI PROCTOR ENGINE: ONLINE</span>
        </div>
        <span className="text-slate-500">v2.4.0-HACK</span>
      </div>
    </aside>
  );
}

