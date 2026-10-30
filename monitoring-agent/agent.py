"""
SENTINEL Institution-Managed OS Monitoring Agent (Type 2: Application Switching)
Monitors foreground active window switches on authorized candidate workstations.
Uses Windows Win32 APIs via standard library `ctypes` (No third-party packages required).
"""

import sys
import time
import json
import urllib.request
import urllib.error
from datetime import datetime
import ctypes
from ctypes import wintypes

# Windows API Function Definitions
user32 = ctypes.windll.user32
kernel32 = ctypes.windll.kernel32

# Buffer length for window titles
BUFFER_SIZE = 512

# Allowed/Approved Examination Windows (Case-insensitive substrings)
APPROVED_WINDOW_KEYWORDS = [
    "sentinel",
    "secure student examination",
    "cs-301: advanced systems",
    "examination portal",
    "vite",
    "localhost:3001"
]

# Specifically Restricted Target Applications
RESTRICTED_APP_POLICIES = {
    "notepad": "Notepad / Text Editor",
    "calculator": "System Calculator",
    "calc": "System Calculator",
    "explorer": "Windows File Explorer",
    "chatgpt": "Unauthorized AI Tool (ChatGPT)",
    "discord": "External Communication (Discord)",
    "whatsapp": "Instant Messaging (WhatsApp)",
    "telegram": "Instant Messaging (Telegram)",
    "stackoverflow": "External Programming Reference (Stack Overflow)",
    "code": "Visual Studio Code / External Editor"
}

def get_active_window_info():
    """Retrieves the handle, title, and process ID of the active foreground window."""
    hwnd = user32.GetForegroundWindow()
    if not hwnd:
        return None, "Unknown Window", 0

    title_buffer = ctypes.create_unicode_buffer(BUFFER_SIZE)
    user32.GetWindowTextW(hwnd, title_buffer, BUFFER_SIZE)
    window_title = title_buffer.value

    pid = wintypes.DWORD()
    user32.GetWindowThreadProcessId(hwnd, ctypes.byref(pid))

    return hwnd, window_title, pid.value

def is_window_approved(window_title):
    """Checks whether the given window title matches the permitted examination window."""
    if not window_title or not window_title.strip():
        return True # Desktop or transient system window

    title_lower = window_title.lower()
    for keyword in APPROVED_WINDOW_KEYWORDS:
        if keyword in title_lower:
            return True

    return False

def identify_restricted_application(window_title):
    """Categorizes the unauthorized application based on window title matching."""
    title_lower = window_title.lower()
    for keyword, app_label in RESTRICTED_APP_POLICIES.items():
        if keyword in title_lower:
            return app_label
    return "External Desktop Application"

def send_event_to_backend(backend_url, event_data):
    """Transmits an application switching event to the SENTINEL Monitoring Gateway."""
    try:
        url = f"{backend_url}/api/monitoring/event"
        data = json.dumps(event_data).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=3) as response:
            return response.status in (200, 201)
    except urllib.error.URLError:
        # Backend might not be running yet
        return False
    except Exception as e:
        print(f"[Agent Warning] Gateway transmission error: {e}")
        return False

def run_agent(student_id="PC-02", exam_id="CS-301-MIDTERM", backend_url="http://localhost:8000"):
    print("=" * 70)
    print(" 🛡️ SENTINEL INSTITUTIONAL MONITORING AGENT (OS APPLICATION DETECTION)")
    print("=" * 70)
    print(f" Target Workstation ID : {student_id}")
    print(f" Active Examination ID : {exam_id}")
    print(f" Monitoring Gateway    : {backend_url}")
    print(f" Status                : ACTIVE (Foreground Window Hook Engaged)")
    print(" Press Ctrl+C at any time to authorizedly terminate agent monitoring.")
    print("=" * 70)

    last_active_hwnd = None
    last_reported_title = None
    warning_count = 0

    try:
        while True:
            hwnd, title, pid = get_active_window_info()

            if hwnd and hwnd != last_active_hwnd:
                last_active_hwnd = hwnd

                # If the student switched away from the approved exam window
                if not is_window_approved(title) and title != last_reported_title:
                    last_reported_title = title
                    warning_count += 1
                    app_category = identify_restricted_application(title)
                    timestamp = datetime.utcnow().isoformat()

                    event_payload = {
                        "student_id": student_id,
                        "exam_id": exam_id,
                        "event_type": "APPLICATION_SWITCH",
                        "subtype": "FOREGROUND_CHANGE",
                        "application_name": app_category,
                        "description": f"Candidate switched to unauthorized application window: '{title}'",
                        "timestamp": timestamp,
                        "warning_count": warning_count,
                        "severity": "critical"
                    }

                    print(f"[{datetime.now().strftime('%H:%M:%S')}] 🚨 VIOLATION FLAGGED (#{warning_count}): {app_category}")
                    print(f"           Active Window Title : '{title}' (PID: {pid})")

                    success = send_event_to_backend(backend_url, event_payload)
                    if success:
                        print("           ✓ Transmitted to Teacher Dashboard & Student Portal")
                    else:
                        print("           [!] Gateway offline; logged to agent audit buffer")

                elif is_window_approved(title) and last_reported_title:
                    print(f"[{datetime.now().strftime('%H:%M:%S')}] ✓ Candidate returned to approved examination window.")
                    last_reported_title = None

            time.sleep(1.0) # Check interval (1 second)

    except KeyboardInterrupt:
        print("\n[SENTINEL Agent] Authorized termination received. Disengaging hooks.")
        # Send disconnect event
        disconnect_payload = {
            "student_id": student_id,
            "exam_id": exam_id,
            "event_type": "STUDENT_DISCONNECTED",
            "description": "Candidate workstation monitoring agent terminated authorizedly.",
            "timestamp": datetime.utcnow().isoformat()
        }
        send_event_to_backend(backend_url, disconnect_payload)
        print("[SENTINEL Agent] Workstation monitoring stopped cleanly.")

if __name__ == "__main__":
    student_id = sys.argv[1] if len(sys.argv) > 1 else "PC-02"
    exam_id = sys.argv[2] if len(sys.argv) > 2 else "CS-301-MIDTERM"
    backend_url = sys.argv[3] if len(sys.argv) > 3 else "http://localhost:8000"
    run_agent(student_id, exam_id, backend_url)

