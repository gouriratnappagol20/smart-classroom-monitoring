import React, { useState } from 'react';
import { 
  Shield, 
  Lock, 
  User, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Monitor,
  Wifi,
  Eye,
  Laptop
} from 'lucide-react';
import { preconfiguredStudents, examMetadata } from '../data/examQuestions';

export default function LoginPage({ onLoginSuccess }) {
  const [selectedPreset, setSelectedPreset] = useState("PC-02");
  const [studentId, setStudentId] = useState("STU-1092");
  const [studentName, setStudentName] = useState("David Miller");
  const [examCode, setExamCode] = useState(examMetadata.examId);
  const [seatNumber, setSeatNumber] = useState("Station A-02");
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Quick preset selector for hackathon convenience
  const handlePresetChange = (pcId) => {
    setSelectedPreset(pcId);
    const found = preconfiguredStudents.find(s => s.id === pcId);
    if (found) {
      setStudentId(found.studentId);
      setStudentName(found.name);
      setSeatNumber(found.seat);
      setExamCode(found.examCode);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!studentId.trim()) newErrors.studentId = "Student ID or Roll Number is required.";
    if (!studentName.trim()) newErrors.studentName = "Candidate Name is required.";
    if (!examCode.trim()) newErrors.examCode = "Examination Access Key is required.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess({
        id: selectedPreset,
        studentId: studentId.trim(),
        name: studentName.trim(),
        seat: seatNumber,
        examCode: examCode.trim()
      });
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      
      {/* Top Simple Bar */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between pb-6">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <span className="font-mono font-bold text-sm tracking-tight text-slate-900">
              SENTINEL
            </span>
            <span className="text-[10px] text-slate-400 block font-medium">
              Academic Integrity System
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
          <span>Portal Status: Ready</span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md mx-auto w-full my-auto">
        <div className="exam-card bg-white p-6 sm:p-8">
          
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto mb-3 border border-blue-100">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Candidate Examination Login
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Please enter your institutional credentials to begin your monitored session
            </p>
          </div>

          {/* Preset Workstation Picker */}
          <div className="mb-5 p-3 rounded-lg bg-slate-50 border border-slate-200">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Select Workstation (Demo Testing Roster)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {preconfiguredStudents.map((s) => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => handlePresetChange(s.id)}
                  className={`py-1.5 px-2 rounded-md text-xs font-mono font-semibold border transition-all ${
                    selectedPreset === s.id
                      ? 'bg-blue-700 text-white border-blue-800 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {s.id}
                </button>
              ))}
            </div>
            <span className="text-[10px] text-slate-400 block mt-1.5 font-sans">
              Selected: <strong>{studentName}</strong> ({seatNumber})
            </span>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Student ID */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Student ID / Roll Number
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g. STU-1092"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
                />
              </div>
              {errors.studentId && (
                <span className="text-[11px] text-red-600 mt-1 block">{errors.studentId}</span>
              )}
            </div>

            {/* Candidate Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Legal Name
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Candidate Name"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
              />
              {errors.studentName && (
                <span className="text-[11px] text-red-600 mt-1 block">{errors.studentName}</span>
              )}
            </div>

            {/* Exam Access Key */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Examination Access Key
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={examCode}
                  onChange={(e) => setExamCode(e.target.value)}
                  placeholder="e.g. CS-301-MIDTERM"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
                />
              </div>
              {errors.examCode && (
                <span className="text-[11px] text-red-600 mt-1 block">{errors.examCode}</span>
              )}
            </div>

            {/* Environmental Check Bar */}
            <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200/80 text-[11px] text-blue-900 space-y-1.5">
              <div className="font-semibold flex items-center gap-1.5 text-blue-950">
                <Shield className="w-3.5 h-3.5 text-blue-700" />
                <span>Pre-Flight Integrity Checks Passed:</span>
              </div>
              <div className="grid grid-cols-2 gap-1 text-[10.5px] text-slate-600">
                <span className="flex items-center gap-1 text-emerald-700">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Web Visibility API
                </span>
                <span className="flex items-center gap-1 text-emerald-700">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Dual Activity Agent
                </span>
                <span className="flex items-center gap-1 text-emerald-700">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Camera Detection
                </span>
                <span className="flex items-center gap-1 text-emerald-700">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Secure Storage
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-lg font-semibold text-xs bg-blue-700 hover:bg-blue-800 text-white transition-colors flex items-center justify-center space-x-2 shadow-xs disabled:opacity-60"
            >
              {isLoading ? (
                <span>Authenticating Session...</span>
              ) : (
                <>
                  <span>Authenticate & View Instructions</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

          </form>

        </div>
      </div>

      {/* Footer */}
      <div className="max-w-6xl mx-auto w-full text-center text-xs text-slate-400 pt-6">
        SENTINEL Secure Examination Environment · Department of Computer Science & Engineering
      </div>

    </div>
  );
}

