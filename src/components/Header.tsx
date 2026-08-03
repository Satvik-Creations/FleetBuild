import React from 'react';
import { ViewType, MemoryContext } from '../types';
import { Menu, Flame, Bot, Timer, Bell, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  currentView: ViewType;
  streakDays: number;
  memoryContext: MemoryContext;
  onOpenMobileMenu: () => void;
  activeTimerSeconds: number | null;
  onOpenTimer: () => void;
  onNavigateToFleetBot: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  streakDays,
  memoryContext,
  onOpenMobileMenu,
  activeTimerSeconds,
  onOpenTimer,
  onNavigateToFleetBot,
}) => {
  const titles: Record<ViewType, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Performance Command',
      subtitle: 'Real-time adaptive intelligence for your training cycle.',
    },
    fleetbot: {
      title: 'FleetBot AI Neural Coach',
      subtitle: 'Active memory engine tracking goals, injuries & auto-adapting routines.',
    },
    workout: {
      title: 'Adaptive Workout Planner',
      subtitle: 'Precision target volume, set logging & live rest recovery timer.',
    },
    health: {
      title: 'Health & Biometrics Tracker',
      subtitle: '7-Day weight progression, macronutrients & recovery readiness.',
    },
  };

  const activeInfo = titles[currentView];

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <header className="sticky top-0 z-30 bg-[#121212]/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Mobile Toggle Button */}
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl bg-[#1E1E1E] border border-white/10 text-white hover:bg-white/10 transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            {activeInfo.title}
          </h2>
          <p className="text-xs sm:text-sm text-white/50 hidden sm:block">
            {activeInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Active Timer Pill if running */}
        {activeTimerSeconds !== null && activeTimerSeconds > 0 && (
          <button
            onClick={onOpenTimer}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FF5722]/20 border border-[#FF5722] text-[#FF5722] text-xs font-bold animate-pulse hover:bg-[#FF5722]/30 transition-all cursor-pointer"
          >
            <Timer className="w-4 h-4" />
            <span>Rest: {formatTimer(activeTimerSeconds)}</span>
          </button>
        )}

        {/* FleetBot Memory Context Pill */}
        <button
          onClick={onNavigateToFleetBot}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1E1E1E] border border-white/10 hover:border-[#FF5722]/50 text-xs font-medium text-white/80 transition-all"
        >
          <Bot className="w-3.5 h-3.5 text-[#FF5722]" />
          <span>Active Context:</span>
          <span className="text-[#FFC107] font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            {memoryContext.injury}
          </span>
        </button>

        {/* Streak Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFC107]/15 border border-[#FFC107]/40 text-[#FFC107] text-xs font-bold shadow-sm">
          <Flame className="w-4 h-4 fill-[#FFC107]" />
          <span>{streakDays}d</span>
        </div>

        {/* Notifications Icon */}
        <button
          className="p-2 rounded-full bg-[#1E1E1E] border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors relative"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FF5722]" />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-white/10">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#FF5722] via-[#FFC107] to-amber-500 p-[2px]">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
              alt="Alex Rivers Avatar"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div className="hidden xl:block">
            <p className="text-xs font-bold text-white">Alex Rivers</p>
            <p className="text-[10px] text-[#FFC107] font-semibold">Pro Fleet Athlete</p>
          </div>
        </div>
      </div>
    </header>
  );
};
