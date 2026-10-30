/**
 * APPLICATION SWITCHING MONITOR (TYPE 2)
 * Connects with the authorized Python OS Agent running on institution computers.
 * Detects operating-system level foreground window changes to unauthorized applications.
 * Also provides a clearly labelled simulator for offline/demo testing.
 */

export class ApplicationMonitor {
  constructor({ studentId, examId, onWarning, onEventLogged }) {
    this.studentId = studentId || "STU-UNKNOWN";
    this.examId = examId || "CS-301-MIDTERM";
    this.onWarning = onWarning;
    this.onEventLogged = onEventLogged;

    this.warningCount = 0;
    this.isAgentConnected = false;
    this.socket = null;
    this.agentPollInterval = null;
  }

  start() {
    this.tryConnectAgent();
  }

  stop() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    if (this.agentPollInterval) {
      clearInterval(this.agentPollInterval);
      this.agentPollInterval = null;
    }
  }

  tryConnectAgent() {
    // Attempt WebSocket connection to backend which relays agent messages
    try {
      this.socket = new WebSocket("ws://localhost:8000/ws/monitoring");

      this.socket.onopen = () => {
        this.isAgentConnected = true;
        console.log("[SENTINEL Agent] Connected to SENTINEL Monitoring Gateway.");
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.event_type === "APPLICATION_SWITCH" && data.student_id === this.studentId) {
            this.handleRealAppSwitch(data);
          }
        } catch (err) {
          console.error("Failed to parse monitoring event:", err);
        }
      };

      this.socket.onerror = () => {
        this.isAgentConnected = false;
      };

      this.socket.onclose = () => {
        this.isAgentConnected = false;
      };
    } catch (e) {
      this.isAgentConnected = false;
    }
  }

  handleRealAppSwitch(data) {
    this.warningCount += 1;

    if (this.onWarning) {
      this.onWarning({
        category: "APPLICATION_SWITCH",
        title: "Unauthorized Application Switching Detected",
        applicationName: data.application_name || "Desktop Application",
        message: data.description || `Active foreground window switched to: ${data.application_name}`,
        warningCount: this.warningCount,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        source: "AUTHENTIC_OS_AGENT"
      });
    }

    if (this.onEventLogged) {
      this.onEventLogged(data);
    }
  }

  /**
   * Transparently labelled simulation trigger for hackathon demonstration
   * when running without the native Python OS background agent.
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

