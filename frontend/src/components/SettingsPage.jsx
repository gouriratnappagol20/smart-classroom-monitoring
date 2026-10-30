import React, { useState } from 'react';
import { 
  Settings, 
  Shield, 
  Sliders, 
  Globe, 
  Lock, 
  Save, 
  CheckCircle2,
  Server,
  User,
  Bell
} from 'lucide-react';
import { examConfig } from '../data/mockData';

export default function SettingsPage({ onShowToast }) {
  const [sensitivity, setSensitivity] = useState('High');
  const [autoLockOnCritical, setAutoLockOnCritical] = useState(false);
  const [webcamAuditInterval, setWebcamAuditInterval] = useState('2');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    if (onShowToast) onShowToast('Examination parameters updated successfully.', 'success');
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Header */}
      <div className="card-base p-5 bg-white">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-700">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Examination Configuration & Security Parameters
            </h2>
            <p className="text-xs text-slate-500">
              Manage proctoring thresholds, network firewall rules, and biometric optical frequency
            </p>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-5">
        
        {/* Section 1: Session Details */}
        <div className="card-base p-5 bg-white space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <Server className="w-4 h-4 text-blue-600" /> Exam Session Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-500 font-medium mb-1">Course Code & Title</label>
              <input
                type="text"
                readOnly
                value={examConfig.title}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 font-medium cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-medium mb-1">Assigned Laboratory</label>
              <input
                type="text"
                readOnly
                value={examConfig.room}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 font-medium cursor-not-allowed font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-medium mb-1">Authorized Chief Proctor</label>
              <input
                type="text"
                readOnly
                value={examConfig.invigilator}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 font-medium cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-medium mb-1">Standard Duration</label>
              <input
                type="text"
                readOnly
                value={`${examConfig.totalDurationMinutes} Minutes (Strict submission deadline)`}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 font-medium cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Section 2: AI Proctoring & Security Thresholds */}
        <div className="card-base p-5 bg-white space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <Shield className="w-4 h-4 text-blue-600" /> AI Detection & Integrity Engine
          </h3>

          <div className="space-y-4 text-xs">
            
            {/* Sensitivity */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-semibold text-slate-800">Violation Detection Sensitivity</span>
                <p className="text-[11px] text-slate-500">Determines optical facial tracking and DOM scraping strictness</p>
              </div>
              <select
                value={sensitivity}
                onChange={(e) => setSensitivity(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 font-medium focus:outline-none focus:border-blue-500"
              >
                <option value="Standard">Standard (Permissive)</option>
                <option value="High">High (Strict AI & Keystroke Monitoring)</option>
                <option value="Maximum">Maximum (Immediate Flagging)</option>
              </select>
            </div>

            {/* Auto Lock toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div>
                <span className="font-semibold text-slate-800">Automatic Workstation Lockout</span>
                <p className="text-[11px] text-slate-500">Automatically freeze terminal upon 2 or more critical violations</p>
              </div>
              <input
                type="checkbox"
                checked={autoLockOnCritical}
                onChange={(e) => setAutoLockOnCritical(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
            </div>

            {/* Webcam Audit Frequency */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <div>
                <span className="font-semibold text-slate-800">Webcam Optical Scan Frequency</span>
                <p className="text-[11px] text-slate-500">Sample rate for facial landmark verification</p>
              </div>
              <select
                value={webcamAuditInterval}
                onChange={(e) => setWebcamAuditInterval(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 font-medium focus:outline-none focus:border-blue-500 font-mono"
              >
                <option value="1">Every 1 Second (High Bandwidth)</option>
                <option value="2">Every 2 Seconds (Recommended)</option>
                <option value="5">Every 5 Seconds</option>
              </select>
            </div>

            {/* Blocked URL rules */}
            <div className="pt-2 border-t border-slate-100">
              <span className="font-semibold text-slate-800">Active Restricted Web Domain Filter</span>
              <p className="text-[11px] text-slate-500 mb-2">Requests to these domains trigger immediate critical incident alerts</p>
              <div className="flex flex-wrap gap-2 font-mono text-[11px]">
                {["chatgpt.com", "claude.ai", "gemini.google.com", "stackoverflow.com", "discord.com", "reddit.com"].map(domain => (
                  <span key={domain} className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                    {domain}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-1">
          <div>
            {saved && (
              <span className="text-xs text-emerald-700 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Settings saved successfully!
              </span>
            )}
          </div>

          <button
            type="submit"
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Configuration</span>
          </button>
        </div>

      </form>

    </div>
  );
}

