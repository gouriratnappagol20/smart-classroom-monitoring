import React, { useState } from 'react';
import { ShieldCheck, Laptop, Globe, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

export default function AgentStatusBadge({ 
  browserMonitorActive = true, 
  isAgentConnected = false, 
  onSimulateAppSwitch 
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed bottom-4 left-4 z-40 max-w-sm">
      <div className="bg-white/95 rounded-xl border border-slate-200 shadow-md backdrop-blur-xs p-2.5 text-xs">
        
        {/* Toggle Summary Bar */}
        <div 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between gap-3 cursor-pointer select-none"
        >
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-slate-800 text-[11px] flex items-center gap-1 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              SENTINEL DUAL MONITOR
            </span>
          </div>

          <button className="text-slate-400 hover:text-slate-600">
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Detailed Breakdown when expanded */}
        {isExpanded && (
          <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-2 text-[11px]">
            {/* Type 1: Browser Monitor */}
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1.5">
                <Globe className="w-3 h-3 text-blue-600" />
                <span>Type 1: Browser Tab Monitor</span>
              </span>
              <span className="font-mono font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                ACTIVE
              </span>
            </div>

            {/* Type 2: OS App Monitor */}
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1.5">
                <Laptop className="w-3 h-3 text-slate-600" />
                <span>Type 2: OS App Agent</span>
              </span>
              <span className={`font-mono font-semibold px-1.5 py-0.2 rounded border ${
                isAgentConnected 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}>
                {isAgentConnected ? "CONNECTED" : "STANDALONE"}
              </span>
            </div>

            {/* Hackathon Demo Test Simulator */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onSimulateAppSwitch}
                className="w-full py-1.5 px-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-medium text-[11px] flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
                title="Simulate OS application switch to Notepad.exe for presentation"
              >
                <Sparkles className="w-3 h-3 text-red-600" />
                <span>[DEMO] Trigger Notepad.exe Switch</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

