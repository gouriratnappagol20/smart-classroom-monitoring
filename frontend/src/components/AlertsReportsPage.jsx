import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Bot, 
  CameraOff, 
  Clipboard, 
  CheckCircle, 
  FileDown, 
  Download, 
  Filter, 
  Clock, 
  Lock, 
  FileText, 
  CheckCircle2,
  Calendar,
  Layers,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { examConfig } from '../data/mockData';

export default function AlertsReportsPage({ 
  alerts, 
  students, 
  onAcknowledgeAlert, 
  onAcknowledgeAll,
  onRequestLockToggle,
  onAddSimulatedAlert 
}) {
  const [selectedStudentFilter, setSelectedStudentFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all'); // 'all' | 'unresolved' | 'acknowledged'
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState('all'); // 'all' | 'critical' | 'high' | 'medium'
  const [exportNotice, setExportNotice] = useState(false);

  // Filtered alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      const matchStudent = selectedStudentFilter === 'all' || alert.pcId === selectedStudentFilter;
      const matchStatus = 
        selectedStatusFilter === 'all' || 
        (selectedStatusFilter === 'unresolved' && !alert.acknowledged) ||
        (selectedStatusFilter === 'acknowledged' && alert.acknowledged);
      const matchSeverity = selectedSeverityFilter === 'all' || alert.severity === selectedSeverityFilter;

      return matchStudent && matchStatus && matchSeverity;
    });
  }, [alerts, selectedStudentFilter, selectedStatusFilter, selectedSeverityFilter]);

  const unresolvedCount = alerts.filter(a => !a.acknowledged).length;

  // Working CSV Export generator
  const handleExportCSV = () => {
    const headers = [
      "Incident ID", 
      "Station ID", 
      "Student Name", 
      "Violation Reason", 
      "Unauthorized Application", 
      "Severity", 
      "Timestamp", 
      "Resolution Status"
    ];

    const rows = alerts.map(a => [
      a.id,
      a.pcId,
      `"${a.studentName}"`,
      `"${a.reason}"`,
      `"${a.unauthorizedApp || a.details}"`,
      a.severity.toUpperCase(),
      `"${a.timestamp}"`,
      a.acknowledged ? "ACKNOWLEDGED" : "PENDING"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SENTINEL_Audit_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 4000);
  };

  // Working JSON Export generator
  const handleExportJSON = () => {
    const reportData = {
      system: "SENTINEL Examination Integrity Proctor",
      generatedAt: new Date().toISOString(),
      examDetails: examConfig,
      summary: {
        totalCandidates: students.length,
        unresolvedIncidents: unresolvedCount,
        totalRecordedIncidents: alerts.length
      },
      candidates: students,
      incidentHistory: alerts
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `SENTINEL_Forensic_Audit_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 4000);
  };

  const getAlertIcon = (iconType) => {
    switch (iconType) {
      case 'Bot':
        return <Bot className="w-4 h-4 text-red-600" />;
      case 'CameraOff':
        return <CameraOff className="w-4 h-4 text-amber-600" />;
      case 'Clipboard':
        return <Clipboard className="w-4 h-4 text-blue-600" />;
      default:
        return <ShieldAlert className="w-4 h-4 text-red-600" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header Banner & Actions */}
      <div className="card-base p-5 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
              Security Operations Center
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Integrity Radar Log
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Forensic Incident Radar & Audit Reports
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Active violations feed, detailed candidate audit log, and instant official CSV export
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Simulate Alert for demo */}
          <button
            onClick={onAddSimulatedAlert}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors shadow-xs"
            title="Inject simulated incident for presentation"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>+ Simulate Incident</span>
          </button>

          {/* Acknowledge All */}
          {unresolvedCount > 0 && (
            <button
              onClick={onAcknowledgeAll}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors shadow-xs"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Acknowledge All</span>
            </button>
          )}

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV Report</span>
          </button>
        </div>
      </div>

      {/* Export Success Feedback Notification */}
      {exportNotice && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Official Examination Audit Report downloaded to your device successfully!</span>
          </div>
          <span className="font-mono text-[11px] text-emerald-700 font-bold">CSV GENERATED</span>
        </div>
      )}

      {/* 2. Filters Toolbar */}
      <div className="card-base p-3.5 bg-white flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Filter by Candidate */}
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500 font-medium">Station:</span>
            <select
              value={selectedStudentFilter}
              onChange={(e) => setSelectedStudentFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1 text-slate-800 font-mono focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Stations ({students.length})</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.id} - {s.studentName}</option>
              ))}
            </select>
          </div>

          {/* Filter by Status */}
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1 text-slate-800 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Incidents ({alerts.length})</option>
              <option value="unresolved">Pending / Unresolved ({unresolvedCount})</option>
              <option value="acknowledged">Acknowledged ({alerts.length - unresolvedCount})</option>
            </select>
          </div>

          {/* Filter by Severity */}
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500 font-medium">Severity:</span>
            <select
              value={selectedSeverityFilter}
              onChange={(e) => setSelectedSeverityFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1 text-slate-800 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
            </select>
          </div>

        </div>

        <div className="text-slate-500 font-mono text-[11px]">
          Showing {filteredAlerts.length} of {alerts.length} incident records
        </div>
      </div>

      {/* 3. Real-Time Incident Cards Feed */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
          <span>Active Incident Cards</span>
          {unresolvedCount > 0 && (
            <span className="text-xs px-2 py-0.2 rounded-full bg-red-100 text-red-700 font-mono font-semibold">
              {unresolvedCount} Pending Review
            </span>
          )}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAlerts.map((alert) => {
            const isCritical = alert.severity === 'critical';
            const isHigh = alert.severity === 'high';
            const matchedStudent = students.find(s => s.id === alert.pcId);

            return (
              <div 
                key={alert.id}
                className={`card-base p-4 bg-white transition-all border-l-4 ${
                  alert.acknowledged 
                    ? 'border-l-slate-300 opacity-75' 
                    : isCritical
                      ? 'border-l-red-500 border-red-200' 
                      : isHigh
                        ? 'border-l-amber-500 border-amber-200'
                        : 'border-l-blue-500 border-blue-200'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2.5">
                    <div className={`p-2 rounded-lg border ${
                      isCritical ? 'bg-red-50 border-red-200' : isHigh ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'
                    }`}>
                      {getAlertIcon(alert.iconType)}
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">
                        {alert.reason}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                        <span className="font-mono font-bold text-blue-700">{alert.pcId}</span>
                        <span>·</span>
                        <span className="text-slate-700 font-medium">{alert.studentName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Severity Badge */}
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                    isCritical 
                      ? 'bg-red-50 text-red-700 border-red-200' 
                      : isHigh 
                        ? 'bg-amber-50 text-amber-700 border-amber-200' 
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    {alert.severity}
                  </span>
                </div>

                {/* Unauthorized App highlight */}
                <div className="my-2 px-2.5 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <span className="text-slate-500 font-medium">Flagged Application: </span>
                  <span className="font-mono font-semibold text-slate-800">
                    {alert.unauthorizedApp || alert.details}
                  </span>
                </div>

                {/* Evidence Details */}
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  {alert.details}
                </p>

                {/* Card Footer: Timestamp & Action */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {alert.timestamp} ({alert.timeAgo})
                  </span>

                  <div className="flex items-center space-x-2">
                    {alert.acknowledged ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Acknowledged
                      </span>
                    ) : (
                      <button
                        onClick={() => onAcknowledgeAlert(alert.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors shadow-xs"
                      >
                        <CheckCircle className="w-3 h-3" />
                        <span>Acknowledge</span>
                      </button>
                    )}

                    {/* Instant Lock Station button */}
                    {matchedStudent && !matchedStudent.isLocked && (
                      <button
                        onClick={() => onRequestLockToggle(matchedStudent)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors"
                      >
                        <Lock className="w-3 h-3" />
                        <span>Lock Station</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Complete Violation History & Forensic Table */}
      <div className="card-base bg-white overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Official Forensic Examination Table</h3>
            <p className="text-xs text-slate-500">Structured log for institutional compliance and academic honor council</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportCSV}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV</span>
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={handleExportJSON}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-2.5 px-4">Incident ID</th>
                <th className="py-2.5 px-4">Station</th>
                <th className="py-2.5 px-4">Candidate</th>
                <th className="py-2.5 px-4">Violation Type</th>
                <th className="py-2.5 px-4">Flagged Process/App</th>
                <th className="py-2.5 px-4">Recorded Time</th>
                <th className="py-2.5 px-4">Severity</th>
                <th className="py-2.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
              {alerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 text-slate-500">{alert.id}</td>
                  <td className="py-3 px-4 font-bold text-blue-700">{alert.pcId}</td>
                  <td className="py-3 px-4 font-sans font-medium text-slate-900">{alert.studentName}</td>
                  <td className="py-3 px-4 font-sans font-semibold text-slate-800">{alert.reason}</td>
                  <td className="py-3 px-4 text-slate-600 truncate max-w-[180px]" title={alert.unauthorizedApp || alert.details}>
                    {alert.unauthorizedApp || alert.details}
                  </td>
                  <td className="py-3 px-4 text-slate-500">{alert.timestamp}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      alert.severity === 'critical' 
                        ? 'bg-red-50 text-red-700 border border-red-200' 
                        : alert.severity === 'high' 
                          ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {alert.severity}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-sans">
                    {alert.acknowledged ? (
                      <span className="text-emerald-700 font-semibold">Acknowledged</span>
                    ) : (
                      <button
                        onClick={() => onAcknowledgeAlert(alert.id)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        Acknowledge
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

