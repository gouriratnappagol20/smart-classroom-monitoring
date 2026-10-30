import React, { useEffect, useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  X, 
  Clock, 
  ExternalLink,
  Laptop
} from 'lucide-react';

export default function WarningBanner({ warning, onDismiss }) {
  if (!warning) return null;

  const [timeLeft, setTimeLeft] = useState(8); // Auto dismiss after 8s if not manually closed

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [warning, onDismiss]);

  const isAppSwitch = warning.category === "APPLICATION_SWITCH";

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4 animate-in slide-in-from-top-4 duration-300">
      <div className={`p-4 rounded-xl border shadow-xl backdrop-blur-xs flex items-start gap-3.5 ${
        isAppSwitch 
          ? 'bg-red-50/95 border-red-300 text-red-900 ring-2 ring-red-400/30' 
          : 'bg-amber-50/95 border-amber-300 text-amber-900 ring-2 ring-amber-400/30'
      }`}>
        
        {/* Category Icon */}
        <div className={`p-2 rounded-lg shrink-0 ${
          isAppSwitch ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
        }`}>
          {isAppSwitch ? (
            <Laptop className="w-5 h-5 animate-pulse" />
          ) : (
            <AlertTriangle className="w-5 h-5 animate-bounce" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 text-xs">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className={`font-bold uppercase tracking-wider text-[11px] px-2 py-0.5 rounded-full border ${
              isAppSwitch 
                ? 'bg-red-100 text-red-800 border-red-200' 
                : 'bg-amber-100 text-amber-800 border-amber-200'
            }`}>
              {isAppSwitch ? "OS Application Switching Violation" : "Browser Tab Switching Alert"}
            </span>

            <span className="font-mono text-[11px] font-semibold">
              Warning #{warning.warningCount}
            </span>
          </div>

          <h4 className="font-bold text-sm text-slate-900 mb-0.5">
            {warning.title}
          </h4>

          {warning.applicationName && (
            <div className="font-mono font-semibold text-[11px] text-red-800 bg-red-100/70 px-2 py-0.5 rounded w-fit my-1">
              Flagged Window: {warning.applicationName}
            </div>
          )}

          <p className="text-slate-700 leading-relaxed text-[11.5px] mt-0.5">
            {warning.message}
          </p>

          <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1 font-mono">
              <Clock className="w-3 h-3" />
              Recorded at {warning.timestamp}
            </span>

            <span className="text-[10px] text-slate-400 font-mono">
              Auto-minimizing in {timeLeft}s
            </span>
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={onDismiss}
          className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
          title="Acknowledge warning"
        >
          <X className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
}

