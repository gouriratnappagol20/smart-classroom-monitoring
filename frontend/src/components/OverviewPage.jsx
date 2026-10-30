import React from 'react';
import { 
  Users, 
  ShieldCheck, 
  AlertOctagon, 
  Clock, 
  Activity, 
  Wifi, 
  Play, 
  Square, 
  CheckCircle2, 
  ArrowRight, 
  AlertTriangle, 
  Monitor, 
  HardDrive,
  FileText,
  Lock,
  Unlock,
  Bell
} from 'lucide-react';
import { examConfig } from '../data/mockData';

export default function OverviewPage({ 
  students, 
  alerts, 
  activities,
  isExamActive, 
  onToggleExamRequest, 
  onNavigate, 
  onToggleLockAll,
  isAllLocked 
}) {
  const safeCount = students.filter(s => s.status === 'safe').length;
  const violationCount = students.filter(s => s.status === 'violation').length;
  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged).length;

  const compliancePercentage = Math.round((safeCount / students.length) * 100);

  return (
    <div className="space-y-6">
      
      {/* 1. Welcome & Session Banner */}
      <div className="card-base p-5 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              Active Examination Hall
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Room 402 · Wing B
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            {examConfig.title}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Invigilated by <strong>{examConfig.invigilator}</strong> · Scheduled Duration: {examConfig.totalDurationMinutes} mins
          </p>
        </div>

        {/* Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigate('monitoring')}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-xs"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Go to Live Grid</span>
            <ArrowRight className="w-3 h-3 ml-0.5" />
          </button>

          <button
            onClick={() => onNavigate('alerts')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors shadow-xs ${
              unacknowledgedAlerts > 0 
                ? 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200' 
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>View Alerts ({unacknowledgedAlerts})</span>
          </button>
        </div>
      </div>

      {/* 2. Aligned Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Total Candidates */}
        <div className="card-base p-4 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Connected Candidates</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono">{students.length}</span>
            <span className="text-xs text-emerald-600 font-medium">100% Attendance</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Workstations PC-01 through PC-03 active
          </div>
        </div>

        {/* Metric 2: Safe Students */}
        <div className="card-base p-4 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Compliant Stations</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-700 font-mono">{safeCount}</span>
            <span className="text-xs px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
              {compliancePercentage}% Safe
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Permitted editors & terminals open
          </div>
        </div>

        {/* Metric 3: Active Violations */}
        <div className="card-base p-4 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Active Violations</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-red-600 font-mono">{violationCount}</span>
            <span className="text-xs px-1.5 py-0.2 rounded bg-red-50 text-red-700 font-medium border border-red-200">
              Needs Attention
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Flagged on candidate <strong>PC-02</strong>
          </div>
        </div>

        {/* Metric 4: Exam Duration */}
        <div className="card-base p-4 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Exam Window</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono">120m</span>
            <span className="text-xs text-blue-600 font-medium">45m Remaining</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Commenced at {examConfig.startTime}
          </div>
        </div>

      </div>

      {/* 3. Main Analytics Grid (Two Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Station Breakdown Table & Compliance Bar */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Station Status Overview Card */}
          <div className="card-base bg-white overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Workstation Compliance Summary</h3>
                <p className="text-xs text-slate-500">Live operational status across all assigned lab terminals</p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                  Safe ({safeCount})
                </span>
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
                  Flagged ({violationCount})
                </span>
              </div>
            </div>

            {/* Simple Visual Distribution Bar */}
            <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100">
              <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5 font-medium">
                <span>Compliance Distribution</span>
                <span>{compliancePercentage}% Compliant</span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden flex">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-500"
                  style={{ width: `${compliancePercentage}%` }}
                  title={`Compliant: ${safeCount} stations`}
                ></div>
                <div 
                  className="bg-red-500 h-full transition-all duration-500"
                  style={{ width: `${100 - compliancePercentage}%` }}
                  title={`Flagged: ${violationCount} stations`}
                ></div>
              </div>
            </div>

            {/* Candidate Roster Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="py-2.5 px-4">Station ID</th>
                    <th className="py-2.5 px-4">Candidate Name</th>
                    <th className="py-2.5 px-4">Active Window</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-blue-700">{student.id}</td>
                      <td className="py-3 px-4 font-sans font-medium text-slate-900">
                        {student.studentName}
                        <span className="text-slate-400 text-[11px] block font-mono">{student.seat}</span>
                      </td>
                      <td className="py-3 px-4 text-[11px] text-slate-600 max-w-[200px] truncate" title={student.activeWindow}>
                        {student.activeWindow}
                      </td>
                      <td className="py-3 px-4">
                        {student.status === 'safe' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Safe
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200">
                            <AlertOctagon className="w-3 h-3" /> Flagged
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onNavigate('monitoring')}
                          className="text-xs text-blue-600 hover:text-blue-800 font-sans font-medium"
                        >
                          View Feed
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* System Load & Telemetry Card */}
          <div className="card-base p-4 bg-white">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Lab Network & Hardware Telemetry</h3>
            <p className="text-xs text-slate-500 mb-4">Average operational metrics across Lab 402 client machines</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Network Latency</span>
                  <Wifi className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div className="text-lg font-bold font-mono text-slate-900">18.3 ms</div>
                <div className="text-[11px] text-emerald-600 font-medium mt-0.5">Low Latency · Stable</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Avg CPU Utilization</span>
                  <Activity className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div className="text-lg font-bold font-mono text-slate-900">36.6%</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Normal processing load</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Firewall Packet Filtering</span>
                  <HardDrive className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div className="text-lg font-bold font-mono text-slate-900">100%</div>
                <div className="text-[11px] text-emerald-600 font-medium mt-0.5">Zero WAN leaks</div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Recent Activity Feed & Proctor Controls */}
        <div className="space-y-6">
          
          {/* Proctor Quick Controls */}
          <div className="card-base p-4 bg-white">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Exam Controls</h3>
            <p className="text-xs text-slate-500 mb-3.5">Manage session status and emergency actions</p>

            <div className="space-y-2.5">
              {/* Start / End Exam Button */}
              <button
                onClick={onToggleExamRequest}
                className={`w-full py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 border transition-colors shadow-xs ${
                  isExamActive
                    ? 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                }`}
              >
                {isExamActive ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-red-600 text-red-600" />
                    <span>Conclude / End Examination</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                    <span>Resume / Start Examination</span>
                  </>
                )}
              </button>

              {/* Master Lock All Button */}
              <button
                onClick={onToggleLockAll}
                className="w-full py-2 px-3 rounded-lg text-xs font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center space-x-2 transition-colors"
              >
                {isAllLocked ? (
                  <>
                    <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Unlock All Candidate Workstations</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-red-600" />
                    <span>Emergency Lock All Workstations</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="card-base bg-white overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Recent Activity</h3>
                <p className="text-xs text-slate-500">Chronological proctoring log</p>
              </div>
              <button
                onClick={() => onNavigate('alerts')}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                View All
              </button>
            </div>

            <div className="p-4 space-y-3.5 max-h-[380px] overflow-y-auto">
              {activities.map((act) => (
                <div key={act.id} className="flex items-start space-x-3 text-xs">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    act.type === 'danger' 
                      ? 'bg-red-500' 
                      : act.type === 'warning' 
                        ? 'bg-amber-500' 
                        : act.type === 'success' 
                          ? 'bg-emerald-500' 
                          : 'bg-blue-500'
                  }`}></div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 truncate">{act.title}</span>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">{act.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                      {act.description}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                      <span>{act.pcId}</span>
                      <span>·</span>
                      <span>{act.studentName}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

