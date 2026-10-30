import React, { useState } from 'react';
import { 
  X, 
  FileDown, 
  CheckCircle, 
  Download, 
  FileText, 
  Calendar, 
  Award, 
  ShieldCheck, 
  AlertTriangle,
  Printer
} from 'lucide-react';
import { examConfig } from '../data/mockData';

export default function AuditReportModal({ 
  onClose, 
  students, 
  alerts, 
  stats 
}) {
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Generate real CSV download
  const handleDownloadCSV = () => {
    const headers = ["Station ID", "Student Name", "Roll Number", "Status", "Compliance Score", "Violations Count", "Active Window", "Last Log"];
    const rows = students.map(s => [
      s.id,
      `"${s.studentName}"`,
      s.studentRoll,
      s.status.toUpperCase(),
      `${s.complianceScore}%`,
      s.violationCount,
      `"${s.activeWindow}"`,
      `"${s.lastActiveTime}"`
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

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  // Generate real JSON download
  const handleDownloadJSON = () => {
    const reportData = {
      system: "SENTINEL Smart Classroom Monitoring System",
      exportTimestamp: new Date().toISOString(),
      examDetails: examConfig,
      summary: {
        totalStations: students.length,
        violations: stats.violations,
        safeStations: stats.safe,
        overallIntegrityScore: `${Math.round(students.reduce((acc, curr) => acc + curr.complianceScore, 0) / students.length)}%`
      },
      students: students,
      alertsLog: alerts
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `SENTINEL_Audit_Export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] glass-card rounded-2xl border border-slate-700/80 shadow-2xl flex flex-col overflow-hidden bg-dark-900">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#0c101c] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Exam Integrity Audit Report</h3>
              <p className="text-xs text-slate-400">
                Official proctoring summary & forensic event audit
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Metadata Card */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div>
              <div className="text-slate-500 text-[10px] uppercase">Course Exam</div>
              <div className="text-slate-200 font-bold mt-0.5">CS-301 Midterm</div>
            </div>
            <div>
              <div className="text-slate-500 text-[10px] uppercase">Hall / Room</div>
              <div className="text-slate-200 font-bold mt-0.5">Lab 402 - Wing B</div>
            </div>
            <div>
              <div className="text-slate-500 text-[10px] uppercase">Invigilator</div>
              <div className="text-slate-200 font-bold mt-0.5">Dr. Evelyn Reed</div>
            </div>
            <div>
              <div className="text-slate-500 text-[10px] uppercase">Integrity Index</div>
              <div className="text-emerald-400 font-bold mt-0.5">
                {Math.round(students.reduce((acc, curr) => acc + curr.complianceScore, 0) / students.length)}% Compliant
              </div>
            </div>
          </div>

          {/* Student Status Roster */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
              Candidate Performance & Compliance Roster
            </h4>
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0b0f19] text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3">PC ID</th>
                    <th className="p-3">Candidate</th>
                    <th className="p-3">Compliance</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Active Process</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-900/50">
                      <td className="p-3 font-bold text-cyan-400">{student.id}</td>
                      <td className="p-3 font-sans text-slate-200">{student.studentName}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          student.complianceScore > 85 ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                        }`}>
                          {student.complianceScore}%
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          student.status === 'safe' 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="p-3 text-[11px] text-slate-400 truncate max-w-[200px]">
                        {student.activeWindow}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Incidents Forensic Summary */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Forensic Incident Log ({alerts.length} Recorded)
            </h4>
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div 
                  key={alert.id}
                  className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-cyan-400 font-bold">{alert.pcId}</span>
                    <span className="text-slate-400">·</span>
                    <span className="font-semibold text-slate-200">{alert.reason}</span>
                    <span className="text-slate-500 hidden sm:inline text-[11px]">- {alert.details}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 shrink-0">{alert.timestamp}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Export Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0a0e18] flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            {downloadSuccess && (
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> File generated successfully!
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleDownloadCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV</span>
            </button>

            <button
              onClick={handleDownloadJSON}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-glow-cyan"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Download JSON Audit</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

