# 🛡️ SENTINEL — Smart Examination Integrity & Classroom Monitoring System

A clean, modern, enterprise-grade **Light Theme 3-Page Application** engineered for university examination halls and national-level hackathons. Built with **Vite, React 18, and Tailwind CSS**.

---

## 🎨 Enterprise Light Design System

- **Clean Aesthetic**: Crisp white cards (`bg-white`), subtle slate borders (`border-slate-200`), soft natural elevation (`shadow-xs` / `shadow-sm`), and comfortable spacing.
- **Color Coding & Compliance Indicators**:
  - 🔵 **Primary Brand**: Professional Blue (`#2563EB`)
  - 🟢 **Safe Stations**: Emerald Green badge (`bg-emerald-50 text-emerald-700 border-emerald-200`)
  - 🔴 **Violations**: High-Contrast Red badge (`bg-red-50 text-red-700 border-red-200`)
  - 🟡 **Proctor Warnings**: Amber badge (`bg-amber-50 text-amber-800 border-amber-200`)
- **Zero Distractions**: Avoids dark cyberpunk glows, excess gradients, and heavy glassmorphism in favor of accessible contrast and readable typography.

---

## 📑 3-Page Architecture

### 📊 Page 1 — System Overview & Analytics
- **Welcome & Exam Session Header**: Displays course code (`CS-301`), hall (`Lab 402`), scheduled duration, and lead invigilator (`Dr. Evelyn Reed`).
- **Key Metric Cards**:
  1. Connected Candidates: `3 Active` (100% attendance)
  2. Compliant Stations: `2 Safe` (67% compliance rate)
  3. Active Violations: `1 Flagged` (PC-02 - Unauthorized AI tool)
  4. Time Remaining: `45m remaining` of 120m total
- **Station Compliance Distribution Bar**: Real-time visual progress distribution of compliant vs flagged workstations.
- **Candidate Roster Table**: Quick station lookup with candidate names, active windows, and statuses.
- **Hardware & Network Telemetry**: Average latency (`18.3ms`), CPU utilization (`36.6%`), and zero WAN leak packet filtering.
- **Chronological Activity Feed**: Real-time events including unit test completions, alerts, warnings, and logins.
- **Quick Controls**: Instant **Start / End Exam** and emergency **Lock All Workstations**.

### 🖥️ Page 2 — Live Student Monitoring
- **Responsive Monitor Grid**: Displays **PC-01**, **PC-02**, and **PC-03** in an aligned, spacious grid.
- **High-Fidelity Screen Previews**:
  - **PC-01**: Clean dark/light VS Code editor with syntax-colored C code for red-black tree insertion, line numbers, and terminal test status (`✓ 4/4 Passed`).
  - **PC-02**: Google Chrome browser displaying active ChatGPT tab with candidate prompt asking for code solutions and a prominent red security warning banner.
  - **PC-03**: Interactive Bash terminal with GCC compiler output and zero warnings.
- **Biometric Webcam PiP**: Top-right corner status indicator (`Cam OK` or `Face Alert`).
- **Interactive Station Actions**:
  - **Send Warning**: Transmit direct on-screen warning messages to the student.
  - **Lock Screen**: Requests confirmation dialog and freezes candidate inputs with an on-screen lockout banner.
  - **Inspect**: Opens full-resolution deep-dive dialog with process trees and telemetry.
  - **Capture Screenshot**: One-click forensic evidence capture with visual flash feedback.
- **Interactive Demo Control**: Built-in **"Simulate PC-02 Violation"** button to toggle David Miller between safe code editor and flagged ChatGPT session live during presentations!

### 🚨 Page 3 — Incident Radar & Forensic Audit Reports
- **Real-Time Incident Cards Feed**:
  - Critical, High, and Medium severity warning cards.
  - Candidate ID, name, violation reason, and specific unauthorized application (e.g. `Google Chrome (chatgpt.com)`).
  - Working **Acknowledge** button with instant state update.
  - Direct **Lock Station** button for high-risk workstations.
- **Filter Toolbar**:
  - Filter by Candidate (`All Stations`, `PC-01`, `PC-02`, `PC-03`).
  - Filter by Status (`All`, `Pending / Unresolved`, `Acknowledged`).
  - Filter by Severity (`All`, `Critical`, `High`, `Medium`).
- **Official Forensic Table**: Complete institutional compliance log with incident IDs, timestamps, and severity rankings.
- **Working CSV Export**: Instant client-side download of `SENTINEL_Audit_Report.csv` with student roster, timestamps, compliance scores, and resolution statuses!
- **JSON Export**: Forensic JSON audit file generator.

---

## 🚀 How to Run the App

Open your terminal in the `frontend/` folder:

```powershell
cd "c:\Users\gouri\OneDrive\Desktop\class monitoring\frontend"
npm run dev
```

> **Note:** Node.js v26.13.0 and npm 11.20.0 are installed on your machine in `C:\Program Files\nodejs`. `C:\Program Files\nodejs` has been added to your environment PATH and script execution policy has been configured.
>
> If you open a new PowerShell window, you can run `npm run dev` directly. The app will launch at `http://localhost:3000` with instant hot-reload.

---

## 📁 Component Directory

```
frontend/src/
├── App.jsx                     # Core application shell & state coordinator
├── main.jsx                    # React mount
├── index.css                   # Enterprise light styling & clean scrollbars
├── data/
│   └── mockData.js             # PC-01 to PC-03 roster, incidents, and activities
└── components/
    ├── Sidebar.jsx             # Left navigation sidebar with working links
    ├── Header.jsx              # Top header with breadcrumb, timer, live badge
    ├── OverviewPage.jsx        # Page 1: Analytics, metrics, activity feed
    ├── LiveMonitoringPage.jsx  # Page 2: Responsive workstation monitor grid
    ├── AlertsReportsPage.jsx   # Page 3: Incident cards, audit table, CSV download
    ├── SettingsPage.jsx        # Page 4: Examination security parameters
    ├── StudentCard.jsx         # Station monitor card with actions
    ├── ScreenPreview.jsx       # VS Code, ChatGPT, & Terminal mockups
    ├── LockConfirmModal.jsx    # Workstation lockout confirmation modal
    ├── SendWarningModal.jsx    # Transmit proctor warning dialog
    ├── StudentDetailModal.jsx  # Candidate deep-dive inspection modal
    └── ExamActionModal.jsx     # Start / End exam confirmation modal
```
