import React from 'react';
import { Monitor, Lock, AlertTriangle } from 'lucide-react';

export default function ScreenPreview({
  imageBase64,
  status = 'safe',
  isLocked = false
}) {
  const imageSource = imageBase64
    ? (imageBase64.startsWith('data:')
        ? imageBase64
        : `data:image/jpeg;base64,${imageBase64}`)
    : null;

  return (
    <div className="relative w-full aspect-[16/10] bg-slate-900 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
      {imageSource ? (
        <img
          src={imageSource}
          alt="Live student screen shared with the proctor"
          className="w-full h-full object-contain"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2 p-4 text-center">
          <Monitor className="w-9 h-9 text-slate-500" />
          <p className="text-xs font-semibold">Waiting for student screen</p>
          <p className="text-[10px] text-slate-400">
            No screen frame has been received from this workstation yet.
          </p>
        </div>
      )}

      {status === 'violation' && (
        <div className="absolute top-2 left-2 flex items-center gap-1 rounded bg-red-600 text-white px-2 py-1 text-[10px] font-semibold">
          <AlertTriangle className="w-3 h-3" />
          Recent alert
        </div>
      )}

      {isLocked && (
        <div className="absolute inset-0 bg-slate-950/85 z-20 flex flex-col items-center justify-center text-center p-4">
          <Lock className="w-7 h-7 text-red-400 mb-2" />
          <h4 className="text-white font-bold text-xs uppercase tracking-wider">
            Exam Interface Locked
          </h4>
          <p className="text-[10px] text-slate-300 mt-1">
            A proctor lock command is active.
          </p>
        </div>
      )}
    </div>
  );
}
