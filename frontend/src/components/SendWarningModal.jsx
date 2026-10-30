import React, { useState } from 'react';
import { X, Send, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function SendWarningModal({ student, onClose, onConfirmSend }) {
  if (!student) return null;

  const quickTemplates = [
    "Unauthorized browser application detected. Close external windows immediately.",
    "Webcam optical sensor warning: Maintain centered face position within frame.",
    "Secondary individual or device detected in peripheral vision. Eye contact required on screen.",
    "Excessive clipboard paste activity flagged. All key inputs are monitored.",
  ];

  const [message, setMessage] = useState(quickTemplates[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    onConfirmSend(student.id, message);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-amber-50/70 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Transmit Proctor Warning</h3>
              <p className="text-xs text-slate-500 font-mono">
                Target: {student.id} · {student.studentName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-amber-100/60"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Preset Buttons */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-2">
              Select Warning Template
            </label>
            <div className="space-y-1.5">
              {quickTemplates.map((template, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setMessage(template)}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs transition-colors leading-relaxed ${
                    message === template 
                      ? 'bg-blue-50 border-blue-400 text-blue-900 font-medium' 
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  "{template}"
                </button>
              ))}
            </div>
          </div>

          {/* Custom Message Input */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1.5">
              Warning Text to Display on Screen
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter warning message..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              This warning will immediately flash as a priority banner on workstation <strong>{student.id}</strong>.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white transition-colors shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Transmit Warning</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
