/**
 * BROWSER SWITCHING MONITOR (TYPE 1)
 * Uses browser-level APIs (Page Visibility, Window Blur/Focus)
 * to monitor student focus on the examination window.
 */

export class BrowserMonitor {
  constructor({ studentId, examId, onWarning, onEventLogged }) {
    this.studentId = studentId || "STU-UNKNOWN";
    this.examId = examId || "CS-301-MIDTERM";
    this.onWarning = onWarning;
    this.onEventLogged = onEventLogged;
    
    this.isActive = false;
    this.warningCount = 0;
    this.blurTimestamp = null;
    this.debounceTimer = null;
    
    // Bind handlers
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handleWindowBlur = this.handleWindowBlur.bind(this);
    this.handleWindowFocus = this.handleWindowFocus.bind(this);
  }

  start() {
    if (this.isActive) return;
    this.isActive = true;

    document.addEventListener("visibilitychange", this.handleVisibilityChange);
    window.addEventListener("blur", this.handleWindowBlur);
    window.addEventListener("focus", this.handleWindowFocus);

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

    console.log("[SENTINEL Monitor] Browser Switching Detection disengaged.");
  }

  handleVisibilityChange() {
    if (!this.isActive) return;

    if (document.hidden) {
      this.recordSwitch("TAB_HIDDEN", "Student switched away from examination tab or minimized browser.");
    } else {
      this.recordRestore("TAB_RESTORED", "Student returned to examination tab.");
    }
  }

  handleWindowBlur() {
    if (!this.isActive) return;
    
    // Avoid duplicate event if already hidden
    if (document.hidden) return;

    // Small debounce to avoid micro-focus loss (e.g. system alert dialogue)
    this.debounceTimer = setTimeout(() => {
      this.recordSwitch("WINDOW_BLUR", "Examination browser window lost focus (student may have clicked outside or opened window).");
    }, 250);
  }

  handleWindowFocus() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    if (this.blurTimestamp) {
      this.recordRestore("WINDOW_FOCUS", "Examination window regained active focus.");
    }
  }

  recordSwitch(subtype, description) {
    this.blurTimestamp = new Date();
    this.warningCount += 1;

    const event = {
      student_id: this.studentId,
      exam_id: this.examId,
      event_type: "BROWSER_SWITCH",
      subtype: subtype,
      description: description,
      timestamp: this.blurTimestamp.toISOString(),
      warning_count: this.warningCount,
      severity: this.warningCount > 2 ? "high" : "medium"
    };

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
    if (!this.blurTimestamp) return;

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

