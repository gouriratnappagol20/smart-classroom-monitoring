import React, { useState } from 'react';
import { 
  Shield, 
  FileText, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Laptop, 
  Globe, 
  Award, 
  HelpCircle 
} from 'lucide-react';
import { examMetadata } from '../data/examQuestions';

export default function InstructionsPage({ student, examData, onStartExam, onBackToLogin }) {
  const [agreed, setAgreed] = useState(false);

  const resolvedMetadata = examData?.metadata || examMetadata;
  const totalQuestions = examData?.questions?.length || resolvedMetadata.totalQuestions || 4;
  const duration = resolvedMetadata.durationMinutes || resolvedMetadata.duration || 60;
  const instructions = resolvedMetadata.instructions || examMetadata.instructions;
  const examId = student?.examCode || resolvedMetadata.examId || "EXAM_101";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      
      {/* Top Header */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between pb-6">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <span className="font-mono font-bold text-sm tracking-tight text-slate-900">
              SENTINEL
            </span>
            <span className="text-[10px] text-slate-400 block font-medium">
              Pre-Examination Security Briefing
            </span>
          </div>
        </div>

        <button
          onClick={onBackToLogin}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-white border border-slate-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit Session</span>
        </button>
      </div>

      {/* Main Instructions Card */}
      <div className="max-w-4xl mx-auto w-full my-auto space-y-6">
        
        {/* Exam Metadata Strip */}
        <div className="exam-card bg-white p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
            <div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                Authorized Session
              </span>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                {resolvedMetadata.examTitle || resolvedMetadata.title}
              </h1>
              <p className="text-xs text-slate-500">
                {resolvedMetadata.department || examMetadata.department} · Exam ID: <span className="font-mono text-slate-700 font-semibold">{examId}</span>
              </p>
            </div>

            {/* Candidate Verification Pill */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <div className="text-slate-500 text-[10px] uppercase font-semibold">Candidate Verified</div>
              <div className="font-bold text-slate-900 text-sm">{student?.name}</div>
              <div className="font-mono text-[11px] text-blue-700">{student?.studentId || student?.id} · {student?.seat}</div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-500 text-[10px] uppercase block">Total Duration</span>
              <span className="font-bold text-slate-900 text-sm font-mono">{duration} Minutes</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-500 text-[10px] uppercase block">Total Questions</span>
              <span className="font-bold text-slate-900 text-sm font-mono">{totalQuestions} Items</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-500 text-[10px] uppercase block">Maximum Marks</span>
              <span className="font-bold text-slate-900 text-sm font-mono">{totalQuestions * 10} Marks</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-500 text-[10px] uppercase block">Passing Grade</span>
              <span className="font-bold text-emerald-700 text-sm font-mono">{resolvedMetadata.passingMarks || 50}% Score</span>
            </div>
          </div>
        </div>

        {/* Dual Activity Monitoring Notice */}
        <div className="exam-card bg-amber-50/70 border-amber-200 p-5 space-y-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-700" />
            <h3 className="text-sm font-bold text-amber-950">
              Mandatory Security Notice: Dual Activity Surveillance Active
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-white rounded-lg border border-amber-200">
              <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span>1. Browser Tab Switching Detection</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11.5px]">
                Switching away from the examination tab, opening new browser windows, or minimizing the window will trigger an immediate browser-level incident flag recorded on the Teacher Dashboard.
              </p>
            </div>

            <div className="p-3 bg-white rounded-lg border border-amber-200">
              <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                <Laptop className="w-3.5 h-3.5 text-red-600" />
                <span>2. Desktop OS Application Detection</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11.5px]">
                Authorized institutional computers run the SENTINEL OS Agent. Launching or switching to external applications (Notepad, Chrome, Calculator, File Explorer) logs operating-system policy violations.
              </p>
            </div>
          </div>
        </div>

        {/* Standard Rules & Agreement */}
        <div className="exam-card bg-white p-5 sm:p-6 space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Standard Examination Instructions
          </h3>

          <ul className="space-y-2 text-xs text-slate-600">
            {instructions.map((inst, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="font-bold text-blue-700 font-mono shrink-0 mt-0.5">{index + 1}.</span>
                <span className="leading-relaxed">{inst}</span>
              </li>
            ))}
          </ul>

          {/* Acknowledgement Checkbox */}
          <div className="pt-4 border-t border-slate-100">
            <label className="flex items-start space-x-3 cursor-pointer select-none p-3 rounded-lg bg-slate-50 border border-slate-200">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
              />
              <span className="text-xs font-medium text-slate-800 leading-snug">
                I acknowledge that I have read, understood, and agree to abide by all examination integrity rules. I understand that my screen and application activities are monitored and recorded.
              </span>
            </label>
          </div>

          {/* Start Exam CTA */}
          <div className="flex items-center justify-end pt-2">
            <button
              onClick={onStartExam}
              disabled={!agreed}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg text-xs font-semibold text-white transition-all shadow-xs ${
                agreed 
                  ? 'bg-blue-700 hover:bg-blue-800 shadow-sm' 
                  : 'bg-slate-300 cursor-not-allowed text-slate-500'
              }`}
            >
              <span>Commence Examination</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

      {/* Footer */}
      <div className="max-w-4xl mx-auto w-full text-center text-xs text-slate-400 pt-6">
        SENTINEL Secure Examination Environment · Department of Computer Science & Engineering
      </div>

    </div>
  );
}
