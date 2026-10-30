import React from 'react';
import { 
  Code2, 
  Terminal as TerminalIcon, 
  Globe, 
  Camera, 
  Lock, 
  Bot, 
  AlertTriangle,
  UserCheck,
  UserX,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export default function ScreenPreview({ 
  screenType = 'vscode', 
  status = 'safe', 
  isLocked = false,
  webcamStatus = 'verified',
  studentName = '' 
}) {
  const isViolation = status === 'violation';

  return (
    <div className="relative w-full aspect-[16/10] bg-slate-900 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
      
      {/* ===================== VS CODE SCREEN MOCKUP ===================== */}
      {screenType === 'vscode' && (
        <div className="w-full h-full flex flex-col text-[10px] font-mono select-none bg-[#1e1e1e] text-slate-300">
          {/* Editor Window Top Bar */}
          <div className="h-6 bg-[#252526] border-b border-[#333333] flex items-center justify-between px-2.5 text-[10px] text-slate-400">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#ff5f56] inline-block"></span>
              <span className="w-2 h-2 rounded-full bg-[#ffbd2e] inline-block"></span>
              <span className="w-2 h-2 rounded-full bg-[#27c93f] inline-block"></span>
              <span className="ml-2 font-sans font-medium text-slate-300 flex items-center gap-1">
                <Code2 className="w-3 h-3 text-blue-400" /> lab_exam.c
              </span>
            </div>
            <div className="text-[9px] text-slate-400 font-sans">GCC 13.2 · C99 Mode</div>
          </div>

          {/* Editor Body */}
          <div className="flex-1 flex overflow-hidden">
            {/* VS Code Mini Activity Bar */}
            <div className="w-6 bg-[#333333] flex flex-col items-center py-2 space-y-2 text-slate-400">
              <div className="w-3 h-3 rounded bg-blue-500/30 border border-blue-400/50"></div>
              <div className="w-3 h-3 rounded bg-slate-600/30"></div>
              <div className="w-3 h-3 rounded bg-slate-600/30"></div>
            </div>

            {/* Code Lines with Syntax Coloring */}
            <div className="flex-1 p-2 leading-relaxed bg-[#1e1e1e] overflow-hidden text-[9px] sm:text-[10px]">
              <div className="text-slate-400"><span className="text-purple-400 font-semibold">#include</span> &lt;<span className="text-emerald-400">stdio.h</span>&gt;</div>
              <div className="text-slate-400"><span className="text-purple-400 font-semibold">#include</span> &lt;<span className="text-emerald-400">stdlib.h</span>&gt;</div>
              <div className="text-emerald-600 italic">// Task 2: Red-Black Tree Balancing</div>
              <div><span className="text-blue-400 font-semibold">typedef struct</span> <span className="text-amber-300 font-semibold">Node</span> &#123;</div>
              <div className="pl-3"><span className="text-blue-400">int</span> key, color; <span className="text-slate-500">// 0: Black, 1: Red</span></div>
              <div className="pl-3"><span className="text-blue-400">struct</span> Node *left, *right;</div>
              <div>&#125; <span className="text-amber-300 font-semibold">Node</span>;</div>
              <div className="mt-1">
                <span className="text-blue-400">Node</span>* <span className="text-yellow-300 font-semibold">rotate_left</span>(<span className="text-blue-400">Node</span>* root) &#123;
              </div>
              <div className="pl-3">
                <span className="text-blue-400">Node</span>* y = root-&gt;right;
              </div>
              <div className="pl-3">
                root-&gt;right = y-&gt;left;
              </div>
              <div className="pl-3 text-slate-300">
                y-&gt;left = root; <span className="inline-block w-1.5 h-3 bg-blue-400 animate-pulse ml-0.5 align-middle"></span>
              </div>
              <div>&#125;</div>
            </div>
          </div>

          {/* Integrated Terminal Panel */}
          <div className="h-7 bg-[#181818] border-t border-[#333333] px-2.5 flex items-center justify-between text-[9px] font-mono">
            <div className="flex items-center gap-1.5 text-slate-300 truncate">
              <span className="text-blue-400 font-bold">$</span>
              <span>./test_runner</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" /> 4/4 Passed
              </span>
            </div>
            <span className="text-[8px] bg-emerald-900/60 text-emerald-300 px-1.5 py-0.5 rounded font-sans font-semibold">
              PASSED
            </span>
          </div>
        </div>
      )}

      {/* ===================== CHATGPT BROWSER SCREEN MOCKUP ===================== */}
      {screenType === 'chatgpt' && (
        <div className="w-full h-full flex flex-col text-[10px] select-none bg-slate-900">
          {/* Chrome Light Header */}
          <div className="h-6 bg-slate-100 border-b border-slate-300 flex items-center px-2 space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-400 inline-block"></span>
            <span className="w-2 h-2 rounded-full bg-slate-400 inline-block"></span>
            <span className="w-2 h-2 rounded-full bg-slate-400 inline-block"></span>
            <div className="flex-1 max-w-[220px] mx-auto bg-white border border-red-300 rounded px-2 py-0.5 text-[8.5px] text-red-700 font-mono flex items-center justify-center gap-1 shadow-xs">
              <Globe className="w-2.5 h-2.5 text-red-500" />
              <span>chatgpt.com/c/exam-help</span>
            </div>
          </div>

          {/* ChatGPT UI */}
          <div className="flex-1 flex bg-[#202123] p-2 space-x-2">
            {/* Sidebar */}
            <div className="w-16 bg-[#202123] rounded p-1.5 hidden sm:flex flex-col space-y-1 text-[8px] text-slate-400 border border-slate-700/60">
              <div className="text-slate-200 font-medium flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-emerald-400" /> ChatGPT
              </div>
              <div className="bg-slate-700/70 p-1 rounded text-slate-100 truncate">CS301 exam code</div>
            </div>

            {/* Conversation */}
            <div className="flex-1 flex flex-col justify-between overflow-hidden">
              <div className="space-y-1.5">
                <div className="bg-[#343541] rounded p-1.5 ml-auto max-w-[90%] text-slate-200 text-[8.5px]">
                  "Provide the complete C implementation for balancing a red black tree insertion for my exam"
                </div>
                <div className="bg-[#444654] rounded p-1.5 mr-auto max-w-[95%] text-slate-100 text-[8.5px] border-l-2 border-emerald-500">
                  <div className="text-[8px] text-emerald-400 font-semibold mb-0.5 flex items-center gap-1">
                    <Bot className="w-2.5 h-2.5" /> Assistant:
                  </div>
                  Here is the rotate_left helper function with parent and child pointer adjustments...
                </div>
              </div>

              <div className="h-5 bg-[#40414f] rounded px-2 flex items-center text-[8px] text-slate-400 justify-between">
                <span>Message ChatGPT...</span>
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping"></span>
              </div>
            </div>
          </div>

          {/* Red Flag Warning Banner */}
          <div className="bg-red-600 text-white font-medium text-[9px] py-1 px-2.5 flex items-center justify-between tracking-wide shadow-sm">
            <span className="flex items-center gap-1.5 font-semibold">
              <AlertTriangle className="w-3 h-3 text-amber-200" /> UNAUTHORIZED APPLICATION DETECTED
            </span>
            <span className="text-[8px] uppercase tracking-wider bg-black/30 px-1.5 py-0.5 rounded font-mono font-bold">
              SECURITY FLAG
            </span>
          </div>
        </div>
      )}

      {/* ===================== TERMINAL SCREEN MOCKUP ===================== */}
      {screenType === 'terminal' && (
        <div className="w-full h-full flex flex-col text-[10px] font-mono select-none bg-[#0f172a] text-slate-200">
          {/* Terminal Window Header */}
          <div className="h-6 bg-[#1e293b] border-b border-slate-700 flex items-center justify-between px-2.5 text-[10px] text-slate-400">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-500 inline-block"></span>
              <span className="w-2 h-2 rounded-full bg-slate-500 inline-block"></span>
              <span className="w-2 h-2 rounded-full bg-slate-500 inline-block"></span>
              <span className="ml-2 font-mono text-slate-200 flex items-center gap-1 text-[9px]">
                <TerminalIcon className="w-3 h-3 text-emerald-400" /> bash ~ /midterm-exam
              </span>
            </div>
            <div className="text-[8px] text-emerald-400 font-sans">PID: 4092 · ACTIVE</div>
          </div>

          {/* Terminal Content */}
          <div className="flex-1 p-2.5 leading-snug overflow-hidden text-[9px] sm:text-[10px] space-y-1">
            <div className="text-slate-400">
              <span className="text-emerald-400">student@pc-03</span>:<span className="text-blue-400">~/exam</span>$ make clean && make
            </div>
            <div className="text-slate-300">
              gcc -Wall -Wextra -O2 -c lab_exam.c -o lab_exam.o<br/>
              gcc lab_exam.o -o exam_binary
            </div>
            <div className="text-emerald-400 font-semibold flex items-center gap-1">
              <span>[BUILD SUCCESSFUL] Zero warnings. Code compiled.</span>
            </div>
            <div className="text-slate-400 flex items-center">
              <span className="text-emerald-400">student@pc-03</span>:<span className="text-blue-400">~/exam</span>$&nbsp;
              <span className="w-1.5 h-3 bg-emerald-400 animate-pulse"></span>
            </div>
          </div>
        </div>
      )}

      {/* ===================== WEBCAM PICTURE-IN-PICTURE (PIP) ===================== */}
      <div className="absolute top-2 right-2 z-10">
        <div className={`px-2 py-0.5 rounded-md border text-[9px] font-sans font-medium flex items-center gap-1.5 shadow-sm ${
          webcamStatus === 'verified' 
            ? 'bg-white text-emerald-700 border-emerald-300' 
            : 'bg-red-50 text-red-700 border-red-300 font-semibold animate-pulse'
        }`}>
          <div className="relative">
            <Camera className="w-3 h-3" />
            <span className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${
              webcamStatus === 'verified' ? 'bg-emerald-500' : 'bg-red-500 animate-ping'
            }`}></span>
          </div>

          <span>
            {webcamStatus === 'verified' ? 'Cam OK' : 'Face Alert'}
          </span>
        </div>
      </div>

      {/* ===================== LOCKED SCREEN OVERLAY ===================== */}
      {isLocked && (
        <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xs z-20 flex flex-col items-center justify-center text-center p-4">
          <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 mb-2">
            <Lock className="w-5 h-5" />
          </div>
          <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-0.5">
            Workstation Locked
          </h4>
          <p className="text-[10px] text-slate-300 max-w-[200px]">
            Input devices disabled by proctor. Awaiting manual clearance.
          </p>
          <div className="mt-2 text-[8px] bg-red-950/80 text-red-200 px-2 py-0.5 rounded border border-red-800">
            PROCTOR OVERRIDE ACTIVE
          </div>
        </div>
      )}
    </div>
  );
}
