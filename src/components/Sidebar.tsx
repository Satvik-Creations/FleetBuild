import React from 'react';
import { ViewType } from '../types';
import { 
  LayoutDashboard, 
  Bot, 
  PhoneCall,
  Footprints,
  Dumbbell, 
  Activity, 
  User, 
  Shield, 
  LogOut, 
  Sparkles, 
  Settings,
  Layers,
  Target,
  BookOpen,
  Calendar,
  Utensils,
  Trophy
} from 'lucide-react';

interface SidebarProps {
  currentView: ViewType;
  onSelectView: (view: ViewType) => void;
  userRole: 'member' | 'admin';
  userName: string;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  onSignOut: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  userRole,
  userName,
  isMobileOpen,
  setIsMobileOpen,
  onSignOut,
}) => {
  const memberNavItems: { id: ViewType; label: string; icon: React.ReactNode; badge?: string }[] = [
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
      id: 'livecoach',
      label: 'FleetBuild AI Trainer',
      icon: <PhoneCall className="w-5 h-5 text-[#FF5722]" />,
      badge: '3-Min Voice',
    },
    {
      id: 'steptracker',
      label: 'Step & Calorie Counter',
      icon: <Footprints className="w-5 h-5" />,
      badge: 'Pedometer',
    },
    {
      id: 'programs',
      label: 'Workout Programs',
      icon: <Layers className="w-5 h-5" />,
      badge: '4-Week',
    },
    {
      id: 'bodyfocus',
      label: 'Body Focus',
      icon: <Target className="w-5 h-5" />,
    },
    {
      id: 'library',
      label: 'Exercise Library',
      icon: <BookOpen className="w-5 h-5" />,
    },
    {
      id: 'planner',
      label: 'Weekly Planner',
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      id: 'workout',
      label: 'Workout Builder',
      icon: <Dumbbell className="w-5 h-5" />,
    },
    {
      id: 'nutrition',
      label: 'Nutrition & Protein',
      icon: <Utensils className="w-5 h-5" />,
    },
    {
      id: 'achievements',
      label: 'Achievements',
      icon: <Trophy className="w-5 h-5" />,
      badge: 'Badges',
    },
    {
      id: 'health',
      label: 'Health Tracker',
      icon: <Activity className="w-5 h-5" />,
    },
    {
      id: 'profile',
      label: 'Profile & Memory',
      icon: <User className="w-5 h-5" />,
      badge: 'Secure',
    },
    {
      id: 'account',
      label: 'Account Settings',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  const adminNavItems: { id: ViewType; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'admin',
      label: 'User Directory',
      icon: <Shield className="w-5 h-5 text-amber-400" />,
      badge: 'Admin',
    },
  ];

  const navItems = userRole === 'admin' ? adminNavItems : memberNavItems;

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
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF5722] to-[#FF8A65] flex items-center justify-center shadow-lg shadow-[#FF5722]/30 p-2 overflow-hidden">
                  <img src="/favicon.png" alt="FleetBuild Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                    FleetBuild <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-[#FF5722]/20 text-[#FF5722]">AI</span>
                  </h1>
                  <p className="text-xs text-white/50">
                    {userRole === 'admin' ? 'Administrator Portal' : 'Personalized Fitness'}
                  </p>
                </div>
              </div>
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

          {/* Bottom Card: User Info & Sign Out */}
          <div className="pt-4 border-t border-white/10 space-y-3">
            <div className="p-3.5 rounded-2xl bg-[#121212] border border-white/10 flex items-center justify-between">
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">{userName}</p>
                <p className="text-[10px] text-white/50 uppercase font-semibold">{userRole}</p>
              </div>

              <button
                onClick={onSignOut}
                className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/70 hover:text-red-400 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
