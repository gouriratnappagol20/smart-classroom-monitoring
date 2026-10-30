/**
 * APPLICATION SWITCHING MONITOR (TYPE 2)
 * Note: Actual OS-level application monitoring is handled by the native
 * Python monitoring agent (monitoring-agent/agent.py) via Win32 ctypes hooks.
 * Browser JavaScript cannot and does not falsely claim OS-level process hooks.
 * This module manages candidate warning displays and demo simulation.
 */

export class ApplicationMonitor {
  constructor({ studentId, examId, onWarning, onEventLogged }) {
    this.studentId = studentId || "STU001";
    this.examId = examId || "EXAM_101";
    this.onWarning = onWarning;
    this.onEventLogged = onEventLogged;

    this.warningCount = 0;
    this.isAgentConnected = false;
  }

  start() {
    console.log("[SENTINEL AppMonitor] Native OS monitoring is governed by Python agent.");
  }

  stop() {
    // No background browser sockets to clean up
  }

  /**
   * Transparently labelled simulation trigger for hackathon demonstration
   * when demonstrating unauthorized application switching.
   */
  triggerSimulatedSwitch(appName = "Notepad.exe", reason = "Student switched to external desktop application") {
    this.warningCount += 1;

    const event = {
      student_id: this.studentId,
      exam_id: this.examId,
      event_type: "APPLICATION_SWITCH",
      application_name: appName,
      description: `[DEMO SIMULATION] Active foreground window switched to ${appName}. Policy violation recorded.`,
      timestamp: new Date().toISOString(),
      warning_count: this.warningCount,
      severity: "critical",
      is_simulated: true
    };

    if (this.onWarning) {
      this.onWarning({
        category: "APPLICATION_SWITCH",
        title: "Unauthorized Application Switching Detected",
        applicationName: appName,
        message: `Active foreground window switched to: ${appName}. All desktop inputs are monitored.`,
        warningCount: this.warningCount,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        source: "DEMO_SIMULATION"
      });
    }

    if (this.onEventLogged) {
      this.onEventLogged(event);
    }

    return event;
  }
}
