/**
 * BROWSER SWITCHING MONITOR (TYPE 1)
 * Uses browser-level APIs (Page Visibility, Window Blur/Focus)
 * to monitor student focus on the examination window.
 * Connects directly to backend WebSocket: /ws/student/web/{student_id}
 */

import { WS_BASE_URL } from '../services/config';

export class BrowserMonitor {
  constructor({ studentId, examId, onWarning, onEventLogged, onCommand }) {
    this.studentId = studentId || "STU001";
    this.examId = examId || "EXAM_101";
    this.onWarning = onWarning;
    this.onEventLogged = onEventLogged;
    this.onCommand = onCommand;
    
    this.isActive = false;
    this.isAway = false;
    this.warningCount = 0;
    this.blurTimestamp = null;
    this.debounceTimer = null;

    // WebSocket state
    this.socket = null;
    this.isConnected = false;
    this.reconnectTimer = null;
    this.reconnectAttempts = 0;
    this.pingInterval = null;
    this.eventQueue = [];
    
    // Bind handlers
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handleWindowBlur = this.handleWindowBlur.bind(this);
    this.handleWindowFocus = this.handleWindowFocus.bind(this);
  }

  start() {
    if (this.isActive) return;
    this.isActive = true;
    this.isAway = false;

    document.addEventListener("visibilitychange", this.handleVisibilityChange);
    window.addEventListener("blur", this.handleWindowBlur);
    window.addEventListener("focus", this.handleWindowFocus);

    this.connectWebSocket();

    // Start periodic heartbeat ping
    this.pingInterval = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: "PING" }));
      }
    }, 25000);

    console.log("[SENTINEL Monitor] Browser Switching Detection engaged.");
  }

  stop() {
    if (!this.isActive) return;
    this.isActive = false;

    document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    window.removeEventListener("blur", this.handleWindowBlur);
    window.removeEventListener("focus", this.handleWindowFocus);

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    if (this.socket) {
      try {
        this.socket.close();
      } catch (e) {
        // Safe close
      }
      this.socket = null;
      this.isConnected = false;
    }

    console.log("[SENTINEL Monitor] Browser Switching Detection disengaged.");
  }

  connectWebSocket() {
    if (!this.isActive || this.socket) return;

    try {
      const url = `${WS_BASE_URL}/ws/student/web/${encodeURIComponent(this.studentId)}`;
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        console.log(`[SENTINEL Monitor] Connected to student web WebSocket for ${this.studentId}`);
        this.flushEventQueue();
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "CONNECTION_ESTABLISHED") {
            console.log("[SENTINEL Monitor] Web session verified by backend:", data);
          } else if (data.type === "ALERT_ACK") {
            console.log(`[SENTINEL Monitor] Alert #${data.alert_id} acknowledged by backend.`);
          } else if (data.type === "COMMAND") {
            this.handleTeacherCommand(data);
          }
        } catch (err) {
          console.error("[SENTINEL Monitor] Error parsing server message:", err);
        }
      };

      this.socket.onerror = (err) => {
        console.warn("[SENTINEL Monitor] WebSocket error:", err);
      };

      this.socket.onclose = () => {
        this.isConnected = false;
        this.socket = null;
        if (this.isActive) {
          this.scheduleReconnect();
        }
      };
    } catch (err) {
      console.warn("[SENTINEL Monitor] Failed to initialize WebSocket:", err);
      if (this.isActive) {
        this.scheduleReconnect();
      }
    }
  }

  scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectAttempts += 1;
    const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 10000);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this.isActive) {
        this.connectWebSocket();
      }
    }, delay);
  }

  flushEventQueue() {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
    while (this.eventQueue.length > 0) {
      const msg = this.eventQueue.shift();
      this.socket.send(JSON.stringify(msg));
    }
  }

  sendWebSocketMessage(payload) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(payload));
    } else {
      this.eventQueue.push(payload);
    }
  }

  handleTeacherCommand(command) {
    const action = (command.action || "").toUpperCase();
    const message = command.message || `Proctor action: ${action}`;

    if (this.onCommand) {
      this.onCommand(command);
    }

    if (action === "WARNING" && this.onWarning) {
      this.onWarning({
        category: "PROCTOR_COMMAND",
        title: "Proctor Warning Issued",
        message: message,
        warningCount: this.warningCount,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });
    }
  }

  handleVisibilityChange() {
    if (!this.isActive) return;

    if (document.hidden) {
      if (!this.isAway) {
        this.recordSwitch("TAB_HIDDEN", "Student switched away from examination tab or minimized browser.");
      }
    } else {
      if (this.isAway) {
        this.recordRestore("TAB_RESTORED", "Student returned to examination tab.");
      }
    }
  }

  handleWindowBlur() {
    if (!this.isActive || this.isAway || document.hidden) return;

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Small debounce to avoid micro-focus loss (e.g. system alert dialogs)
    this.debounceTimer = setTimeout(() => {
      if (!this.isActive || this.isAway || document.hidden) return;
      this.recordSwitch("WINDOW_BLUR", "Examination browser window lost focus (student may have clicked outside or opened window).");
    }, 250);
  }

  handleWindowFocus() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    if (this.isAway && !document.hidden) {
      this.recordRestore("WINDOW_FOCUS", "Examination window regained active focus.");
    }
  }

  recordSwitch(subtype, description) {
    // Strictly prevent duplicate violation events
    if (this.isAway) return;
    this.isAway = true;
    this.blurTimestamp = new Date();
    this.warningCount += 1;

    const event = {
      student_id: this.studentId,
      exam_id: this.examId,
      event_type: "BROWSER_SWITCH",
      subtype: subtype,
      description: description,
      application_name: "Browser Window",
      timestamp: this.blurTimestamp.toISOString(),
      warning_count: this.warningCount,
      severity: this.warningCount > 2 ? "high" : "medium"
    };

    // Send to backend over WebSocket
    this.sendWebSocketMessage({
      event_type: "BROWSER_SWITCH",
      description: description,
      application_name: "Browser Window",
      timestamp: event.timestamp
    });

    if (this.onWarning) {
      this.onWarning({
        category: "BROWSER_SWITCH",
        title: "Browser Tab Switching Detected",
        message: description,
        warningCount: this.warningCount,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });
    }

    if (this.onEventLogged) {
      this.onEventLogged(event);
    }
  }

  recordRestore(subtype, description) {
    // Strictly prevent duplicate restore events
    if (!this.isAway || !this.blurTimestamp) return;
    this.isAway = false;

    const returnTime = new Date();
    const durationSeconds = Math.round((returnTime - this.blurTimestamp) / 1000);
    this.blurTimestamp = null;

    const event = {
      student_id: this.studentId,
      exam_id: this.examId,
      event_type: "BROWSER_RESTORE",
      subtype: subtype,
      description: `${description} Duration away: ${durationSeconds} seconds.`,
      timestamp: returnTime.toISOString(),
      duration_away_seconds: durationSeconds
    };

    if (this.onEventLogged) {
      this.onEventLogged(event);
    }
  }
}
