import React, { useState, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import OverviewPage from './components/OverviewPage';
import LiveMonitoringPage from './components/LiveMonitoringPage';
import AlertsReportsPage from './components/AlertsReportsPage';
import SettingsPage from './components/SettingsPage';
import LockConfirmModal from './components/LockConfirmModal';
import SendWarningModal from './components/SendWarningModal';
import StudentDetailModal from './components/StudentDetailModal';
import ExamActionModal from './components/ExamActionModal';
import { initialStudents, initialAlerts, initialActivities, examConfig } from './data/mockData';
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, X } from 'lucide-react';

export default function App() {
  // Navigation State
  const [activePage, setActivePage] = useState('overview'); // 'overview' | 'monitoring' | 'alerts' | 'settings'
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Core Data States
  const [students, setStudents] = useState(initialStudents);
  const [alerts, setAlerts] = useState(initialAlerts);
  const [activities, setActivities] = useState(initialActivities);
  const [isExamActive, setIsExamActive] = useState(true);

  // Modals
  const [studentToLockConfirm, setStudentToLockConfirm] = useState(null);
  const [studentToWarn, setStudentToWarn] = useState(null);
  const [studentToInspect, setStudentToInspect] = useState(null);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3800);
  };

  // Quick Stats
  const stats = useMemo(() => {
    const safeCount = students.filter(s => s.status === 'safe').length;
    const violationCount = students.filter(s => s.status === 'violation').length;
    const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length;

    return {
      total: students.length,
      safe: safeCount,
      violations: violationCount,
      unresolvedAlerts: unacknowledgedCount,
      isAllLocked: students.every(s => s.isLocked)
    };
  }, [students, alerts]);

  // Handle Lock / Unlock Station
  const handleConfirmLockToggle = (studentId) => {
    setStudents(prev => prev.map(student => {
      if (student.id === studentId) {
        const nextState = !student.isLocked;
        showToast(
          nextState 
            ? `Workstation ${student.id} has been locked. Keyboard & mouse disabled.` 
            : `Workstation ${student.id} unlocked. Input restored.`,
          nextState ? 'danger' : 'success'
        );

        // Add to activity log
        setActivities(acts => [
          {
            id: `act-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            pcId: student.id,
            studentName: student.studentName,
            type: nextState ? 'danger' : 'success',
            title: nextState ? 'Station Locked' : 'Station Unlocked',
            description: nextState ? 'Workstation locked by Chief Proctor override.' : 'Workstation unlocked and restored.',
          },
          ...acts
        ]);

        return { ...student, isLocked: nextState };
      }
      return student;
    }));
  };

  // Handle Send Warning
  const handleConfirmWarning = (studentId, message) => {
    setStudents(prev => prev.map(student => {
      if (student.id === studentId) {
        return {
          ...student,
          warningsSent: [...(student.warningsSent || []), message],
        };
      }
      return student;
    }));

    showToast(`Warning sent to ${studentId}: "${message.substring(0, 32)}..."`, 'warning');

    // Add to activity log
    const targetStudent = students.find(s => s.id === studentId);
    setActivities(acts => [
      {
        id: `act-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        pcId: studentId,
        studentName: targetStudent ? targetStudent.studentName : 'Candidate',
        type: 'warning',
        title: 'Proctor Warning Transmitted',
        description: `Message: "${message}"`,
      },
      ...acts
    ]);
  };

  // Handle Acknowledge Alert
  const handleAcknowledgeAlert = (alertId) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a));
    showToast('Incident alert marked as acknowledged.', 'success');
  };

  // Handle Acknowledge All Alerts
  const handleAcknowledgeAll = () => {
    setAlerts(prev => prev.map(a => ({ ...a, acknowledged: true })));
    showToast('All active incident alerts acknowledged.', 'success');
  };

  // Handle Start / End Exam toggle
  const handleConfirmExamToggle = () => {
    setIsExamActive(prev => {
      const next = !prev;
      showToast(
        next 
          ? 'Examination resumed. Live telemetry and compliance tracking online.' 
          : 'Examination concluded / paused.',
        next ? 'success' : 'warning'
      );
      return next;
    });
  };

  // Master Lock All Workstations
  const handleToggleLockAll = () => {
    const nextLocked = !stats.isAllLocked;
    setStudents(prev => prev.map(s => ({ ...s, isLocked: nextLocked })));
    showToast(
      nextLocked 
        ? 'Emergency protocol engaged: ALL workstations locked.' 
        : 'ALL workstations unlocked.',
      nextLocked ? 'danger' : 'success'
    );
  };

  // Capture Screenshot Feedback
  const handleCaptureScreenshot = (student) => {
    showToast(`Forensic screenshot saved for ${student.id} (${new Date().toLocaleTimeString()})`, 'info');
  };

  // Interactive Demo Simulator Toggle for Judges
  const handleSimulateViolationToggle = () => {
    setStudents(prev => prev.map(student => {
      if (student.id === 'PC-02') {
        const isNowSafe = student.status === 'violation';
        if (isNowSafe) {
          return {
            ...student,
            status: 'safe',
            activeWindow: 'lab_exam.c - Visual Studio Code',
            processName: 'code.exe',
            screenType: 'vscode',
            webcamStatus: 'verified',
            complianceScore: 97,
            violationReason: undefined,
          };
        } else {
          return {
            ...student,
            status: 'violation',
            activeWindow: 'ChatGPT - Google Chrome',
            processName: 'chrome.exe',
            screenType: 'chatgpt',
            webcamStatus: 'suspicious',
            complianceScore: 32,
            violationReason: 'Unauthorized AI Tool (OpenAI ChatGPT)',
          };
        }
      }
      return student;
    }));

    const pc02 = students.find(s => s.id === 'PC-02');
    if (pc02 && pc02.status === 'safe') {
      showToast('Simulated PC-02 violation: Unauthorized AI Tool opened.', 'danger');
    } else {
      showToast('PC-02 restored to compliant code editor.', 'success');
    }
  };

  // Inject Simulated Alert
  const handleAddSimulatedAlert = () => {
    const newAlert = {
      id: `alert-${Date.now()}`,
      pcId: "PC-01",
      studentName: "Sarah Jenkins",
      severity: "high",
      reason: "Window Focus Lost (Alt+Tab)",
      unauthorizedApp: "Desktop Workspace Switch",
      details: "Candidate attempted switching workspace during active exam window.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      timeAgo: "Just now",
      iconType: "Clipboard",
      acknowledged: false,
    };

    setAlerts(prev => [newAlert, ...prev]);
    showToast('New real-time incident injected into radar!', 'danger');
  };

  // Working CSV Download shortcut
  const handleQuickCSVExport = () => {
    const headers = [
      "Station ID", 
      "Student Name", 
      "Roll Number", 
      "Status", 
      "Compliance Score", 
      "Active Window", 
      "Violations", 
      "Last Timestamp"
    ];

    const rows = students.map(s => [
      s.id,
      `"${s.studentName}"`,
      s.studentRoll,
      s.status.toUpperCase(),
      `${s.complianceScore}%`,
      `"${s.activeWindow}"`,
      s.violationCount,
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

    showToast('Official Examination Audit CSV downloaded to disk.', 'success');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">
      
      {/* 1. Left Fixed Sidebar */}
      <Sidebar 
        activePage={activePage}
        onNavigate={(pageId) => setActivePage(pageId)}
        unresolvedAlertsCount={stats.unresolvedAlerts}
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* 2. Main Application Body Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        
        {/* Top Header Bar */}
        <Header 
          activePage={activePage}
          isExamActive={isExamActive}
          onToggleExamRequest={() => setIsExamModalOpen(true)}
          onExportReport={handleQuickCSVExport}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          stats={stats}
        />

        {/* Dynamic Page Content Router (Zero page reloads) */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {activePage === 'overview' && (
            <OverviewPage 
              students={students}
              alerts={alerts}
              activities={activities}
              isExamActive={isExamActive}
              onToggleExamRequest={() => setIsExamModalOpen(true)}
              onNavigate={(pageId) => setActivePage(pageId)}
              onToggleLockAll={handleToggleLockAll}
              isAllLocked={stats.isAllLocked}
            />
          )}

          {activePage === 'monitoring' && (
            <LiveMonitoringPage 
              students={students}
              onSendWarning={(student) => setStudentToWarn(student)}
              onRequestLockToggle={(student) => setStudentToLockConfirm(student)}
              onInspect={(student) => setStudentToInspect(student)}
              onCaptureScreenshot={handleCaptureScreenshot}
              onToggleLockAll={handleToggleLockAll}
              isAllLocked={stats.isAllLocked}
              onSimulateViolationToggle={handleSimulateViolationToggle}
            />
          )}

          {activePage === 'alerts' && (
            <AlertsReportsPage 
              alerts={alerts}
              students={students}
              onAcknowledgeAlert={handleAcknowledgeAlert}
              onAcknowledgeAll={handleAcknowledgeAll}
              onRequestLockToggle={(student) => setStudentToLockConfirm(student)}
              onAddSimulatedAlert={handleAddSimulatedAlert}
            />
          )}

          {activePage === 'settings' && (
            <SettingsPage 
              onShowToast={showToast}
            />
          )}
        </main>

        {/* Enterprise Footer */}
        <footer className="border-t border-slate-200 bg-white px-6 py-3 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-700">SENTINEL AI</span>
            <span>·</span>
            <span>Academic Integrity & Examination Monitoring System</span>
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            National Hackathon Edition · v3.0.0
          </div>
        </footer>

      </div>

      {/* ================= MODALS & OVERLAYS ================= */}

      {/* Lock Confirmation Dialog */}
      {studentToLockConfirm && (
        <LockConfirmModal 
          student={studentToLockConfirm}
          onClose={() => setStudentToLockConfirm(null)}
          onConfirm={handleConfirmLockToggle}
        />
      )}

      {/* Send Warning Modal */}
      {studentToWarn && (
        <SendWarningModal 
          student={studentToWarn}
          onClose={() => setStudentToWarn(null)}
          onConfirmSend={handleConfirmWarning}
        />
      )}

      {/* Inspect Student Full Modal */}
      {studentToInspect && (
        <StudentDetailModal 
          student={studentToInspect}
          onClose={() => setStudentToInspect(null)}
          onSendWarning={(student) => setStudentToWarn(student)}
          onRequestLockToggle={(student) => setStudentToLockConfirm(student)}
        />
      )}

      {/* Start / End Exam Action Modal */}
      {isExamModalOpen && (
        <ExamActionModal 
          isExamActive={isExamActive}
          onClose={() => setIsExamModalOpen(false)}
          onConfirm={handleConfirmExamToggle}
        />
      )}

      {/* Action Toast Feedback Banner */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-3 fade-in duration-200">
          <div className={`px-4 py-2.5 rounded-lg border shadow-lg text-xs font-medium flex items-center gap-2.5 bg-white ${
            toast.type === 'danger' 
              ? 'border-red-300 text-red-800' 
              : toast.type === 'warning' 
                ? 'border-amber-300 text-amber-800' 
                : 'border-emerald-300 text-emerald-800'
          }`}>
            {toast.type === 'danger' ? (
              <AlertOctagon className="w-4 h-4 text-red-600 shrink-0" />
            ) : toast.type === 'warning' ? (
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span>{toast.message}</span>
            <button 
              onClick={() => setToast(null)}
              className="ml-2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
