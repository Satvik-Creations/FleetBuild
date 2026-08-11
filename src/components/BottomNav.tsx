import React from 'react';
import { ViewType } from '../types';
import { LayoutDashboard, Bot, Footprints, Dumbbell, Menu } from 'lucide-react';

interface BottomNavProps {
  currentView: ViewType;
  onSelectView: (view: ViewType) => void;
  onOpenMobileMenu: () => void;
  isFleetBotPaid?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentView,
  onSelectView,
  onOpenMobileMenu,
  isFleetBotPaid = false,
}) => {
  const items: { id: ViewType; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'fleetbot',
      label: 'FleetBot',
      icon: <Bot className="w-5 h-5" />,
      badge: isFleetBotPaid ? 'PRO' : '₹49',
    },
    {
      id: 'steptracker',
      label: 'Steps',
      icon: <Footprints className="w-5 h-5" />,
    },
    {
      id: 'workout',
      label: 'Workout',
      icon: <Dumbbell className="w-5 h-5" />,
    },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#121212]/95 backdrop-blur-xl border-t border-white/10 px-2 py-1.5 pb-safe">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {items.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl min-w-[60px] transition-all relative cursor-pointer active:scale-95 ${
                isActive ? 'text-[#FF5722]' : 'text-white/60 hover:text-white'
              }`}
            >
              <div className="relative">
                {item.icon}
                {item.badge && (
                  <span className={`absolute -top-1.5 -right-3 text-[9px] font-black px-1 py-0.2 rounded-full ${
                    isActive ? 'bg-[#FF5722] text-white' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium mt-1 tracking-tight ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-[#FF5722] mt-0.5" />
              )}
            </button>
          );
        })}

        {/* Menu Toggle for rest of items */}
        <button
          onClick={onOpenMobileMenu}
          className="flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl min-w-[60px] text-white/60 hover:text-white transition-all cursor-pointer active:scale-95"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1 tracking-tight">Menu</span>
        </button>
      </div>
    </div>
  );
};
