import React from 'react';
import { 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  FileText, 
  Award, 
  User, 
  Home, 
  Download 
} from 'lucide-react';
import { examMetadata } from '../data/examQuestions';

export default function SubmissionPage({ submissionResult, onResetToLogin }) {
  const { student, summary, submittedAt, referenceId: apiRefId } = submissionResult || {};

  const referenceId = apiRefId || `SENTINEL-SUB-${Date.now().toString().slice(-6)}`;
  const formattedTime = submittedAt 
    ? new Date(submittedAt).toLocaleString() 
    : new Date().toLocaleString();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      
      {/* Top Simple Bar */}
      <div className="max-w-3xl mx-auto w-full flex items-center justify-between pb-6">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="font-mono font-bold text-sm tracking-tight text-slate-900">
              SENTINEL
            </span>
            <span className="text-[10px] text-slate-400 block font-medium">
              Official Examination Receipt
            </span>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          STATUS: VERIFIED SUBMISSION
        </span>
      </div>

      {/* Main Submission Receipt Card */}
      <div className="max-w-2xl mx-auto w-full my-auto">
        <div className="exam-card bg-white p-6 sm:p-8 text-center">
          
          {/* Animated Success Badge */}
          <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-4 animate-in zoom-in-75 duration-300">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Examination Successfully Submitted
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Your responses and live activity monitoring audit logs have been cryptographically sealed and delivered to the invigilator.
          </p>

          {/* Reference ID Pill */}
          <div className="my-5 inline-flex flex-col items-center p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Official Reference Token
            </span>
            <span className="font-mono font-bold text-sm sm:text-base text-blue-800 mt-0.5 tracking-wider">
              {referenceId}
            </span>
          </div>

          {/* Candidate & Completion Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left text-xs mb-6 p-4 rounded-xl bg-slate-50 border border-slate-100 font-mono">
            <div>
              <span className="text-[10px] text-slate-400 block">Candidate</span>
              <span className="font-bold text-slate-800 text-xs truncate block">{student?.name}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 block">Student ID</span>
              <span className="font-bold text-slate-800 text-xs">{student?.studentId || student?.id}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 block">Total Answered</span>
              <span className="font-bold text-emerald-700 text-xs">
                {summary?.answeredCount ?? 0} / {summary?.totalQuestions || examMetadata.totalQuestions}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 block">Submission Time</span>
              <span className="font-bold text-slate-800 text-[11px] truncate block">
                {submittedAt ? new Date(submittedAt).toLocaleTimeString() : new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>

          {/* Audit Trail Note */}
          <div className="p-3.5 rounded-lg bg-blue-50/70 border border-blue-200/80 text-[11px] text-blue-900 text-left space-y-1 mb-6">
            <div className="font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
              <span>Institutional Honor Code & Security Audit</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
              Dual Activity Surveillance (Browser Tab Visibility & Desktop Operating System Application Monitoring) has concluded. Session telemetry will be reviewed during academic grading.
            </p>
          </div>

          {/* Action Button */}
          <div className="flex items-center justify-center space-x-3">
            <button
              onClick={onResetToLogin}
              className="flex items-center space-x-1.5 px-5 py-2.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-colors shadow-xs"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Exit Examination Portal</span>
            </button>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="max-w-3xl mx-auto w-full text-center text-xs text-slate-400 pt-6 font-mono">
        Official Timestamp: {formattedTime} · SENTINEL v3.0 Examination System
      </div>

    </div>
  );
}
