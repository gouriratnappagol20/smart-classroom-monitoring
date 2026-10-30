import React, { useState, useMemo, useEffect, useRef } from 'react';
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
// Dashboard data is loaded from the live backend.
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, X } from 'lucide-react';

export default function App() {
  // Navigation State
  const [activePage, setActivePage] = useState('overview'); // 'overview' | 'monitoring' | 'alerts' | 'settings'
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Core Data States
  const [students, setStudents] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [activities, setActivities] = useState([]);
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

  const teacherSocketRef = useRef(null);

  // Load actual SQLite records and current WebSocket connection state.
  useEffect(() => {
    const apiBase = (
      import.meta.env.VITE_API_BASE_URL ||
      `http://${window.location.hostname}:8000`
    ).replace(/\/$/, '');

    const wsBase = (
      import.meta.env.VITE_WS_BASE_URL ||
      apiBase.replace(/^http/, 'ws')
    ).replace(/\/$/, '');

    let active = true;
    let reconnectTimer = null;
    let pollTimer = null;

    const mapAlert = (item, previousAlerts) => {
      const old = previousAlerts.find(a => String(a.id) === String(item.alert_id));

      return {
        id: String(item.alert_id),
        pcId: item.student_id,
        studentName: item.student_name || item.student_id,
        severity: item.event_type === 'APPLICATION_SWITCH' ? 'critical' :
                  item.event_type === 'BROWSER_SWITCH' ? 'high' : 'medium',
        reason: item.event_type,
        unauthorizedApp: item.application_name || 'Not reported',
        details: item.description || '',
        timestamp: item.timestamp
          ? new Date(item.timestamp).toLocaleTimeString()
          : 'Unknown',
        timeAgo: 'Recorded by backend',
        iconType: 'AlertTriangle',
        acknowledged: old ? old.acknowledged : false
      };
    };

    const refreshDashboard = async () => {
      try {
        const [studentsResponse, alertsResponse] = await Promise.all([
          fetch(`${apiBase}/api/students`),
          fetch(`${apiBase}/api/alerts`)
        ]);

        if (!studentsResponse.ok || !alertsResponse.ok) {
          throw new Error('Backend returned an unsuccessful response.');
        }

        const studentData = await studentsResponse.json();
        const alertData = await alertsResponse.json();

        const mappedAlerts = (alertData.alerts || []).map(item =>
          mapAlert(item, alerts)
        );

        // Only show students whose browser or OS agent is genuinely connected.
        const connectedStudents = (studentData.students || [])
          .filter(item => item.online);

        setStudents(previous => connectedStudents.map(item => {
          const old = previous.find(s => s.id === item.student_id);
          const latest = item.latest_alert;
          const alertTime = latest?.timestamp
            ? new Date(latest.timestamp).getTime()
            : 0;

          const recentViolation =
            latest &&
            !['INTEGRATION_TEST', 'STUDENT_DISCONNECTED'].includes(latest.event_type) &&
            Date.now() - alertTime < 10 * 60 * 1000;

          return {
            id: item.student_id,
            studentName: item.name,
            studentRoll: item.student_id,
            seat: item.web_connected && item.os_connected
              ? 'Browser + Desktop Agent'
              : item.web_connected ? 'Browser Connected' : 'Desktop Agent Connected',
            ipAddress: 'LAN — address not reported',
            status: recentViolation ? 'violation' : 'safe',
            activeWindow: latest?.application_name ||
              (item.os_connected ? 'Agent connected — awaiting application event' :
               'Browser connected — desktop agent offline'),
            processName: 'Not reported',
            screenType: 'live',
            screenImage: old?.screenImage || null,
            cpuUsage: null,
            ramUsage: null,
            latency: null,
            webcamStatus: 'offline',
            lastActiveTime: 'Connected now',
            complianceScore: null,
            violationCount: item.violation_count || 0,
            isLocked: item.status === 'LOCKED',
            warningsSent: old?.warningsSent || [],
            details: {
              webConnected: item.web_connected,
              osConnected: item.os_connected,
              latestAlert: latest || null
            }
          };
        }));

        setAlerts(mappedAlerts);

        setActivities(mappedAlerts.slice(0, 20).map(alert => ({
          id: `alert-${alert.id}`,
          timestamp: alert.timestamp,
          pcId: alert.pcId,
          studentName: alert.studentName,
          type: alert.severity === 'critical' ? 'danger' : 'warning',
          title: alert.reason,
          description: alert.details
        })));

      } catch (error) {
        console.error('[SENTINEL] Dashboard refresh failed:', error);
      }
    };

    const connectTeacherSocket = () => {
      if (!active) return;

      const socket = new WebSocket(`${wsBase}/ws/teacher`);
      teacherSocketRef.current = socket;

      socket.onopen = () => {
        console.info('[SENTINEL] Teacher live connection established.');
        refreshDashboard();
      };

      socket.onmessage = event => {
        try {
          const message = JSON.parse(event.data);

          if (
            message.type === 'INITIAL_SYNC' ||
            message.type === 'STUDENT_STATUS' ||
            message.type === 'ALERT'
          ) {
            refreshDashboard();
          }

          if (message.type === 'SCREEN_STREAM' && message.image_base64) {
            const image = `data:image/jpeg;base64,${message.image_base64}`;

            setStudents(previous => previous.map(student =>
              student.id === message.student_id
                ? { ...student, screenImage: image }
                : student
            ));
          }

          if (message.type === 'COMMAND_ACK') {
            const delivered = message.delivery &&
              (message.delivery.web_delivered || message.delivery.os_delivered);

            showToast(
              delivered
                ? `${message.action} delivered to a connected student client.`
                : `${message.action} was not delivered: no matching client connection.`,
              delivered ? 'success' : 'warning'
            );

            refreshDashboard();
          }

          if (message.type === 'ERROR') {
            showToast(message.message || 'Backend command error.', 'danger');
          }
        } catch (error) {
          console.error('[SENTINEL] Invalid WebSocket message:', error);
        }
      };

      socket.onclose = () => {
        teacherSocketRef.current = null;
        if (active) {
          reconnectTimer = window.setTimeout(connectTeacherSocket, 2500);
        }
      };

      socket.onerror = () => socket.close();
    };

    connectTeacherSocket();
    refreshDashboard();
    pollTimer = window.setInterval(refreshDashboard, 5000);

    return () => {
      active = false;
      window.clearInterval(pollTimer);
      window.clearTimeout(reconnectTimer);

      if (teacherSocketRef.current) {
        teacherSocketRef.current.close();
        teacherSocketRef.current = null;
      }
    };
  }, []);

  const sendTeacherCommand = (studentId, action, message = '') => {
    const socket = teacherSocketRef.current;

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      showToast('Teacher live connection is unavailable. Command not sent.', 'danger');
      return false;
    }

    socket.send(JSON.stringify({
      student_id: studentId,
      action,
      message,
      target: 'all'
    }));

    return true;
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
      isAllLocked: students.length > 0 && students.every(s => s.isLocked)
    };
  }, [students, alerts]);

  // Send a real lock/unlock command through the teacher WebSocket.
  const handleConfirmLockToggle = (studentId) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const action = student.isLocked ? 'UNLOCK' : 'LOCK';

    if (sendTeacherCommand(studentId, action)) {
      showToast(`${action} command sent. Waiting for backend delivery confirmation.`, 'warning');
    }
  };

  // Send warning to the connected student interface and desktop agent.
  const handleConfirmWarning = (studentId, message) => {
    sendTeacherCommand(studentId, 'WARNING', message);
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

  // Exam start/end controls are not yet backed by a backend endpoint.
  const handleConfirmExamToggle = () => {
    showToast('Exam start/end control is not connected to the backend yet.', 'warning');
  };

  // Send lock/unlock commands to all currently connected students.
  const handleToggleLockAll = () => {
    if (students.length === 0) {
      showToast('No connected students are available.', 'warning');
      return;
    }

    const nextLocked = !stats.isAllLocked;
    const action = nextLocked ? 'LOCK' : 'UNLOCK';

    students.forEach(student => {
      sendTeacherCommand(student.id, action);
    });
  };

  // Download the latest genuinely received screen frame.
  const handleCaptureScreenshot = (student) => {
    if (!student.screenImage) {
      showToast('No live screen frame has been received from this student.', 'warning');
      return;
    }

    const link = document.createElement('a');
    link.href = student.screenImage;
    link.download = `SENTINEL_${student.id}_${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Received student screen frame downloaded.', 'success');
  };

  // Simulation disabled in live operation.
  const handleSimulateViolationToggle = () => {
    showToast('Demo simulation is disabled. Use the real student monitoring agent.', 'warning');
  };

  // Simulated alerts are disabled in live operation.
  const handleAddSimulatedAlert = () => {
    showToast('Simulated alerts are disabled. Real alerts arrive from connected clients.', 'warning');
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
            <span>Â·</span>
            <span>Academic Integrity & Examination Monitoring System</span>
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            National Hackathon Edition Â· v3.0.0
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

