import React from 'react';
import { 
  LayoutDashboard, 
  Monitor, 
  AlertTriangle, 
  Settings, 
  Shield, 
  UserCheck, 
  Award, 
  HelpCircle,
  ExternalLink,
  Layers
} from 'lucide-react';

export default function Sidebar({ 
  activePage, 
  onNavigate, 
  unresolvedAlertsCount = 0,
  isOpen = false,
  onClose
}) {
  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      description: 'System telemetry & stats',
    },
    {
      id: 'monitoring',
      label: 'Live Monitoring',
      icon: Monitor,
      description: 'PC-01 to PC-03 active grid',
    },
    {
      id: 'alerts',
      label: 'Alerts & Reports',
      icon: AlertTriangle,
      description: 'Incidents & CSV export',
      badge: unresolvedAlertsCount > 0 ? unresolvedAlertsCount : null,
      badgeColor: 'bg-red-100 text-red-700 border-red-200',
    },
    {
      id: 'settings',
      label: 'Settings & Exam Info',
      icon: Settings,
      description: 'Session parameters',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/30 z-40 lg:hidden backdrop-blur-xs"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`fixed top-0 bottom-0 left-0 w-64 bg-white border-r border-slate-200 z-50 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        {/* Brand & Logo Header */}
        <div className="p-5 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900 font-mono">
                  SENTINEL
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  PROCTOR
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Smart Classroom Monitor</p>
            </div>
          </div>

          {/* Current Exam Tag */}
          <div className="mt-3.5 p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 font-mono flex items-center justify-between">
            <span className="font-semibold text-slate-800">CS-301 Midterm</span>
            <span className="text-[11px] text-slate-500">Lab 402</span>
          </div>
        </div>

        {/* Navigation Items List */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] font-semibold tracking-wider uppercase text-slate-400">
            Main Navigation
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  if (onClose) onClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs transition-colors text-left ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold border-r-2 border-blue-600'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <div>
                    <span className="block">{item.label}</span>
                  </div>
                </div>

                {item.badge && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer: Proctor Profile */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/70">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-blue-100 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-xs">
              ER
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-900 truncate">Dr. Evelyn Reed</div>
              <div className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Chief Invigilator</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>Room 402 · 1Gbps LAN</span>
            <span className="text-blue-600 font-semibold">ONLINE</span>
          </div>
        </div>

      </aside>
    </>
  );
}

