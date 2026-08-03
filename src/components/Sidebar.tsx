import React from 'react';
import { ViewType, MemoryContext } from '../types';
import { LayoutDashboard, Bot, Dumbbell, Activity, Flame, ShieldAlert, ChevronRight, Sparkles } from 'lucide-react';

interface SidebarProps {
  currentView: ViewType;
  onSelectView: (view: ViewType) => void;
  streakDays: number;
  memoryContext: MemoryContext;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  streakDays,
  memoryContext,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const navItems: { id: ViewType; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'fleetbot',
      label: 'FleetBot Coach',
      icon: <Bot className="w-5 h-5" />,
      badge: 'AI Engine',
    },
    {
      id: 'workout',
      label: 'Workout Planner',
      icon: <Dumbbell className="w-5 h-5" />,
    },
    {
      id: 'health',
      label: 'Health Tracker',
      icon: <Activity className="w-5 h-5" />,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-[#1E1E1E] border-r border-white/10 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 flex flex-col h-full justify-between">
          <div>
            {/* Logo */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF5722] to-[#FF8A65] flex items-center justify-center shadow-lg shadow-[#FF5722]/30 text-white font-bold text-xl">
                  ⚡
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                    FleetBuild <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-[#FF5722]/20 text-[#FF5722]">MVP</span>
                  </h1>
                  <p className="text-xs text-white/50">Adaptive AI Performance</p>
                </div>
              </div>
            </div>

            {/* User Streak Card */}
            <div className="mb-6 p-4 rounded-2xl bg-[#121212] border border-[#FFC107]/30 flex items-center justify-between shadow-inner">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FFC107]/15 flex items-center justify-center text-[#FFC107]">
                  <Flame className="w-5 h-5 fill-[#FFC107]" />
                </div>
                <div>
                  <p className="text-xs text-white/60 uppercase font-medium tracking-wider">Current Streak</p>
                  <p className="text-base font-bold text-[#FFC107] flex items-center gap-1">
                    {streakDays} Days Strong!
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-[#FFC107]/20 text-[#FFC107]">
                🔥 Peak
              </span>
            </div>

            {/* Navigation Menu */}
            <nav className="space-y-2">
              <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider px-3 mb-2">
                Navigation
              </p>
              {navItems.map((item) => {
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectView(item.id);
                      setIsMobileOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl font-medium text-sm transition-all duration-300 ${
                      isActive
                        ? 'bg-[#FF5722] text-white shadow-lg shadow-[#FF5722]/30 font-semibold translate-x-1'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={isActive ? 'text-white' : 'text-white/60'}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-[#FF5722]/20 text-[#FF5722]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom Active Memory Engine Context Snippet */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="p-3.5 rounded-2xl bg-[#121212] border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#FF5722]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>FleetBot Memory Engine</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="space-y-1 text-xs text-white/70">
                <p className="truncate">
                  <strong className="text-white">Goal:</strong> {memoryContext.goal}
                </p>
                <p className="truncate text-amber-300/90 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-[#FF5722]" />
                  <strong className="text-white">Adaptation:</strong> {memoryContext.injury}
                </p>
              </div>
              <button
                onClick={() => {
                  onSelectView('fleetbot');
                  setIsMobileOpen(false);
                }}
                className="w-full mt-1 py-1.5 px-2 text-[11px] font-medium text-white/80 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center gap-1 transition-colors"
              >
                <span>View Full Context</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
