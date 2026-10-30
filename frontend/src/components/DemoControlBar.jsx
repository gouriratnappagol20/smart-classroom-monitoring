import React, { useState } from 'react';
import { 
  Sparkles, 
  RotateCcw, 
  AlertOctagon, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  ChevronDown, 
  ChevronUp, 
  Flame,
  Radio
} from 'lucide-react';

export default function DemoControlBar({ 
  onToggleViolationPC02, 
  onSimulateNewAlert, 
  onToggleLockAll, 
  onResetDemo,
  isPC02Violation,
  isAllLocked 
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 max-w-xl w-[92%] sm:w-auto">
      <div className="glass-card rounded-2xl border border-cyan-500/30 shadow-2xl backdrop-blur-xl bg-dark-900/95 overflow-hidden transition-all">
        
        {/* Toggle / Header bar */}
        <div 
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-4 py-2 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 flex items-center justify-between cursor-pointer border-b border-slate-800 text-xs"
        >
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span className="font-mono font-bold text-cyan-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> HACKATHON DEMO CONTROLS
            </span>
          </div>
          <button className="text-slate-400 hover:text-white p-0.5">
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />}
          </button>
        </div>

        {/* Buttons Row */}
        {isExpanded && (
          <div className="p-3 flex flex-wrap items-center justify-center gap-2 text-xs">
            
            {/* Toggle PC-02 Violation */}
            <button
              onClick={onToggleViolationPC02}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                isPC02Violation 
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30 shadow-glow-danger' 
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
              }`}
            >
              {isPC02Violation ? (
                <>
                  <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                  <span>Toggle PC-02 (Violation Active)</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Trigger PC-02 AI Violation</span>
                </>
              )}
            </button>

            {/* Simulate New Incident Alert */}
            <button
              onClick={onSimulateNewAlert}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-medium transition-all shadow-sm"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
              <span>+ Push New Incident</span>
            </button>

            {/* Lock All / Unlock All */}
            <button
              onClick={onToggleLockAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition-all"
            >
              {isAllLocked ? <Unlock className="w-3.5 h-3.5 text-emerald-400" /> : <Lock className="w-3.5 h-3.5 text-rose-400" />}
              <span>{isAllLocked ? "Unlock All" : "Lock All PCs"}</span>
            </button>

            {/* Reset */}
            <button
              onClick={onResetDemo}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-all"
              title="Reset Demo to Initial State"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

          </div>
        )}

      </div>
    </div>
  );
}

