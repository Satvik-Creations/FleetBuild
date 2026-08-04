import React from 'react';
import { ViewType } from '../types';
import { Menu, Bot, Timer, Bell, Shield, User } from 'lucide-react';

interface HeaderProps {
  currentView: ViewType;
  userName: string;
  userAvatarUrl?: string;
  userRole: 'member' | 'admin';
  onOpenMobileMenu: () => void;
  activeTimerSeconds: number | null;
  onOpenTimer: () => void;
  onNavigateToFleetBot: () => void;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  userName,
  userAvatarUrl,
  userRole,
  onOpenMobileMenu,
  activeTimerSeconds,
  onOpenTimer,
  onNavigateToFleetBot,
  onSignOut,
}) => {
  const titles: Record<ViewType, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Performance Command',
      subtitle: 'Real-time adaptive intelligence for your training cycle.',
    },
    fleetbot: {
      title: 'FleetBot AI Neural Coach',
      subtitle: 'Active memory engine tracking goals & auto-adapting routines.',
    },
    workout: {
      title: 'Adaptive Workout Planner',
      subtitle: 'Target set logging & live rest recovery timer.',
    },
    health: {
      title: 'Health & Biometrics Tracker',
      subtitle: 'Authentic body weight logs and hydration tracking.',
    },
    profile: {
      title: 'Profile & Memory Settings',
      subtitle: 'Authenticated member profile and health constraints.',
    },
    account: {
      title: 'Account Settings & Preferences',
      subtitle: 'Profile details, password, avatar, notifications and app preferences.',
    },
    admin: {
      title: 'System Administration',
      subtitle: 'Role isolation & user account directory.',
    },
  };

  const activeInfo = titles[currentView] || titles.dashboard;

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const initials = userName
    ? userName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'FB';

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

        {/* FleetBot Button */}
        {userRole === 'member' && (
          <button
            onClick={onNavigateToFleetBot}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1E1E1E] border border-white/10 hover:border-[#FF5722]/50 text-xs font-medium text-white/80 transition-all"
          >
            <Bot className="w-3.5 h-3.5 text-[#FF5722]" />
            <span>FleetBot AI</span>
          </button>
        )}

        {/* User Profile Info */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-white/10">
          <div className="w-9 h-9 rounded-full bg-[#FF5722] text-white font-black text-xs flex items-center justify-center shadow-md overflow-hidden border border-amber-500/30">
            {userAvatarUrl ? (
              <img src={userAvatarUrl} alt={userName} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-bold text-white">{userName}</p>
            <p className="text-[10px] font-bold text-[#FFC107] flex items-center gap-1 uppercase">
              {userRole === 'admin' ? (
                <>
                  <Shield className="w-3 h-3 text-amber-400" />
                  <span className="text-amber-400">Admin</span>
                </>
              ) : (
                <>
                  <User className="w-3 h-3 text-[#FF5722]" />
                  <span>Member</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={onSignOut}
          className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#1E1E1E] hover:bg-red-500/20 text-white/70 hover:text-red-400 border border-white/10 transition-colors"
          title="Sign out of account"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
};
