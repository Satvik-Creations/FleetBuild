import React from 'react';
import { INITIAL_ACHIEVEMENTS } from '../data/achievementsData';
import { 
  Award, 
  Trophy, 
  Zap, 
  Flame, 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  Star 
} from 'lucide-react';

export const AchievementsView: React.FC = () => {
  const totalUnlocked = INITIAL_ACHIEVEMENTS.filter((a) => a.unlocked).length;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-amber-950/30 border border-zinc-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
            <Trophy className="w-3.5 h-3.5" />
            Gamified Fitness Progression
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Badges & Fitness Achievements
          </h1>
          <p className="text-sm text-zinc-400 max-w-2xl">
            Track your consistency, streak milestones, protein goals, and workout achievements in FleetBuild.
          </p>
        </div>

        <div className="bg-zinc-950 border border-amber-500/30 rounded-xl p-4 shrink-0 text-center space-y-1">
          <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Trophies Earned</span>
          <div className="text-2xl font-black text-white font-mono">
            {totalUnlocked} / {INITIAL_ACHIEVEMENTS.length}
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {INITIAL_ACHIEVEMENTS.map((ach) => (
          <div
            key={ach.id}
            className={`p-6 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
              ach.unlocked
                ? 'bg-zinc-900 border-amber-500/40 shadow-lg shadow-amber-500/10'
                : 'bg-zinc-950/80 border-zinc-800/80 opacity-70'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                    ach.unlocked
                      ? 'bg-gradient-to-tr from-amber-500 to-[#FF5722] border-amber-400 text-zinc-950 shadow-md'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                  }`}
                >
                  {ach.unlocked ? <Award className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
                </div>

                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                    {ach.category}
                  </span>
                  <h3 className="text-base font-bold text-white">{ach.title}</h3>
                </div>
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              {ach.description}
            </p>

            {/* Progress bar */}
            <div className="space-y-1 pt-2 border-t border-zinc-800/60">
              <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                <span className={ach.unlocked ? 'text-amber-400' : 'text-zinc-500'}>
                  {ach.unlocked ? 'Unlocked' : 'In Progress'}
                </span>
                <span className="text-zinc-400">
                  {ach.progress} / {ach.maxProgress}
                </span>
              </div>

              <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800">
                <div
                  className={`h-full transition-all duration-500 ${
                    ach.unlocked ? 'bg-amber-400' : 'bg-zinc-700'
                  }`}
                  style={{ width: `${Math.min(100, (ach.progress / ach.maxProgress) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
