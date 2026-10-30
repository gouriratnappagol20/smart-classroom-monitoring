# 🖥️ SENTINEL Operating System Monitoring Agent (Type 2: Application Switching)

The SENTINEL OS Monitoring Agent is a lightweight, non-invasive Python background service designed to run on **authorized, institution-managed candidate computers** during high-stakes examinations.

---

## 🔍 How It Works

1. **Native OS Foreground Window Hooks**: Uses Windows `ctypes.windll.user32.GetForegroundWindow` to detect when a student switches away from the examination window.
2. **Restricted Policy Evaluation**: Categorizes desktop applications like Notepad, Calculator, File Explorer, VS Code, or browser windows with unauthorized queries.
3. **Real-Time Gateway Ingestion**: Dispatches structured `APPLICATION_SWITCH` JSON events over HTTP and WebSockets to the SENTINEL backend, instantly displaying a warning on the Student Interface and flagging the workstation on the Teacher Dashboard.
4. **Transparent & Limited Scope**: Does not log keystrokes, does not inspect personal files, and only observes active window title changes during the exam duration.

---

## 🚀 Running the Agent

### Prerequisites
- Python 3.8+ on Windows (Uses standard library only, **no pip installs needed**).

### Start Command
```bash
python monitoring-agent/agent.py PC-02 CS-301-MIDTERM http://localhost:8000
```

Where arguments are:
- `Argument 1`: Student/Workstation ID (e.g. `PC-02`)
- `Argument 2`: Examination ID (e.g. `CS-301-MIDTERM`)
- `Argument 3`: Backend Gateway URL (default `http://localhost:8000`)

To stop monitoring, simply press `Ctrl+C` in the terminal.
