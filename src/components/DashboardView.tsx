import React from 'react';
import { UserProfile } from '../domain/models';
import { ViewType } from '../types';
import { Dumbbell, Target, AlertTriangle, Bot, Utensils, Plus, Calendar, Activity, Sparkles, ArrowRight, ShieldCheck, Footprints, PhoneCall } from 'lucide-react';

interface DashboardViewProps {
  userProfile: UserProfile;
  onNavigateToView: (view: ViewType) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  userProfile,
  onNavigateToView,
}) => {
  const goalTitle = userProfile.fitnessGoal?.title || 'Personal Fitness Goal';
  const equipment = userProfile.equipmentAccess || [];
  const activeConstraints = (userProfile.healthConstraints || []).filter((c) => c.active);
  const dietary = userProfile.dietaryRestrictions || [];

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Personalized Welcoming Header */}
      <div className="relative overflow-hidden rounded-3xl bg-[#1E1E1E] p-6 sm:p-8 border border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#FF5722]/15 via-[#FFC107]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF5722]/15 border border-[#FF5722]/30 text-[#FF5722] text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personal Fitness Space</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70">{userProfile.name}</span>
            </h1>
            <p className="text-xs sm:text-sm text-white/60 max-w-xl">
              Your personal fitness space starts here. All training context is customized to your registered profile and goals.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateToView('livecoach')}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#FF5722] to-[#E64A19] text-white text-sm font-bold flex items-center gap-2 transition-all duration-300 shadow-xl shadow-[#FF5722]/25 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 animate-pulse" />
              <span>FleetBuild Voice Call</span>
            </button>
            <button
              onClick={() => onNavigateToView('fleetbot')}
              className="px-4 py-3 rounded-2xl bg-[#121212] border border-white/10 hover:border-[#FF5722] text-white text-sm font-semibold flex items-center gap-2 transition-all duration-300 hover:shadow-lg hover:shadow-[#FF5722]/10"
            >
              <Bot className="w-4 h-4 text-[#FF5722]" />
              <span>Consult FleetBot</span>
            </button>
            <button
              onClick={() => onNavigateToView('workout')}
              className="px-6 py-3 rounded-2xl bg-[#FF5722] hover:bg-[#E64A19] text-white text-sm font-bold flex items-center gap-2 transition-all duration-300 shadow-xl shadow-[#FF5722]/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Log Workout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2 Cols): Stated Profile Context & Empty Workout State */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Stated Personal Profile Card */}
          <div className="rounded-3xl bg-[#1E1E1E] p-6 sm:p-8 border border-white/10 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-xs uppercase font-bold text-white/50 tracking-wider">Active Configuration</span>
                <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2 mt-0.5">
                  <ShieldCheck className="w-5 h-5 text-[#FF5722]" />
                  <span>Your Stated Profile</span>
                </h2>
              </div>
              <button
                onClick={() => onNavigateToView('profile')}
                className="text-xs font-semibold text-[#FFC107] hover:underline"
              >
                Edit Profile Settings
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Primary Goal Box */}
              <div className="p-4 rounded-2xl bg-[#121212] border border-white/5 space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-white/50 font-bold uppercase">
                  <Target className="w-4 h-4 text-[#FF5722]" />
                  <span>Stated Fitness Goal</span>
                </div>
                <p className="text-sm font-bold text-white">{goalTitle}</p>
                {userProfile.fitnessGoal?.primaryFocus && (
                  <span className="inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#FF5722]/20 text-[#FF5722]">
                    {userProfile.fitnessGoal.primaryFocus.replace('_', ' ')}
                  </span>
                )}
              </div>

              {/* Equipment Box */}
              <div className="p-4 rounded-2xl bg-[#121212] border border-white/5 space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-white/50 font-bold uppercase">
                  <Dumbbell className="w-4 h-4 text-[#FFC107]" />
                  <span>Available Equipment</span>
                </div>
                {equipment.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {equipment.map((eq) => (
                      <span key={eq} className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/10 text-white/90">
                        {eq}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-white/40 italic">No equipment specified</p>
                )}
              </div>

              {/* Limitations Box */}
              <div className="p-4 rounded-2xl bg-[#121212] border border-white/5 space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-white/50 font-bold uppercase">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Stated Limitations</span>
                </div>
                {activeConstraints.length > 0 ? (
                  <ul className="space-y-1">
                    {activeConstraints.map((c) => (
                      <li key={c.id} className="text-xs text-amber-300 font-semibold">
                        • {c.description}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-white/40 italic">No limitations reported</p>
                )}
              </div>

              {/* Dietary Restrictions Box */}
              <div className="p-4 rounded-2xl bg-[#121212] border border-white/5 space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-white/50 font-bold uppercase">
                  <Utensils className="w-4 h-4 text-emerald-400" />
                  <span>Dietary Preferences</span>
                </div>
                {dietary.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {dietary.map((d) => (
                      <span key={d} className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        {d}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-white/40 italic">None specified</p>
                )}
              </div>
            </div>
          </div>

          {/* Quick Access Fitness Modules */}
          <div className="rounded-3xl bg-[#1E1E1E] p-6 sm:p-8 border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-xs uppercase font-bold text-white/50 tracking-wider">Platform Hub</span>
                <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2 mt-0.5">
                  <Sparkles className="w-5 h-5 text-[#FF5722]" />
                  <span>FleetBuild Training Modules</span>
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => onNavigateToView('livecoach')}
                className="p-4 rounded-2xl bg-gradient-to-br from-[#241815] to-[#121212] hover:bg-zinc-800 border border-[#FF5722]/40 hover:border-[#FF5722] text-left transition-all group cursor-pointer relative overflow-hidden"
              >
                <div className="w-9 h-9 rounded-xl bg-[#FF5722] text-white flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-md shadow-[#FF5722]/30">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-white group-hover:text-[#FF5722] transition-colors">FleetBuild AI Trainer</p>
                <p className="text-[10px] text-[#FF5722] font-semibold">3-Min AI Voice Call</p>
              </button>
              <button
                onClick={() => onNavigateToView('steptracker')}
                className="p-4 rounded-2xl bg-[#121212] hover:bg-zinc-800 border border-white/10 hover:border-[#FF5722] text-left transition-all group"
              >
                <div className="w-9 h-9 rounded-xl bg-[#FF5722]/15 text-[#FF5722] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Footprints className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-white group-hover:text-[#FF5722] transition-colors">Step & Calorie Counter</p>
                <p className="text-[10px] text-white/50">Pedometer & Distance</p>
              </button>
              <button
                onClick={() => onNavigateToView('programs')}
                className="p-4 rounded-2xl bg-[#121212] hover:bg-zinc-800 border border-white/10 hover:border-[#FF5722] text-left transition-all group"
              >
                <div className="w-9 h-9 rounded-xl bg-[#FF5722]/15 text-[#FF5722] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Dumbbell className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-white group-hover:text-[#FF5722] transition-colors">4-Week Programs</p>
                <p className="text-[10px] text-white/50">PPL, Upper/Lower, Shred</p>
              </button>

              <button
                onClick={() => onNavigateToView('bodyfocus')}
                className="p-4 rounded-2xl bg-[#121212] hover:bg-zinc-800 border border-white/10 hover:border-amber-400 text-left transition-all group"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Target className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">Body Focus</p>
                <p className="text-[10px] text-white/50">Muscle Isolation</p>
              </button>

              <button
                onClick={() => onNavigateToView('library')}
                className="p-4 rounded-2xl bg-[#121212] hover:bg-zinc-800 border border-white/10 hover:border-blue-400 text-left transition-all group"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Activity className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">Exercise Library</p>
                <p className="text-[10px] text-white/50">Bio-mechanics Cues</p>
              </button>

              <button
                onClick={() => onNavigateToView('planner')}
                className="p-4 rounded-2xl bg-[#121212] hover:bg-zinc-800 border border-white/10 hover:border-emerald-400 text-left transition-all group"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Calendar className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">Weekly Planner</p>
                <p className="text-[10px] text-white/50">Calendar Schedule</p>
              </button>

              <button
                onClick={() => onNavigateToView('nutrition')}
                className="p-4 rounded-2xl bg-[#121212] hover:bg-zinc-800 border border-white/10 hover:border-[#FF5722] text-left transition-all group"
              >
                <div className="w-9 h-9 rounded-xl bg-[#FF5722]/15 text-[#FF5722] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Utensils className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-white group-hover:text-[#FF5722] transition-colors">Nutrition Engine</p>
                <p className="text-[10px] text-white/50">Calories & Macros</p>
              </button>

              <button
                onClick={() => onNavigateToView('achievements')}
                className="p-4 rounded-2xl bg-[#121212] hover:bg-zinc-800 border border-white/10 hover:border-amber-400 text-left transition-all group"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">Achievements</p>
                <p className="text-[10px] text-white/50">Badges & Streaks</p>
              </button>
            </div>
          </div>

          {/* Honest Empty State: Workout Sessions */}
          <div className="rounded-3xl bg-[#1E1E1E] p-8 border border-white/10 shadow-xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#121212] border border-white/10 text-white/40 flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6 text-[#FF5722]" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-lg font-bold text-white">No workouts logged yet</h3>
              <p className="text-xs text-white/50">
                Log your real workout routines and exercises to build your personal training log.
              </p>
            </div>
            <button
              onClick={() => onNavigateToView('workout')}
              className="px-6 py-3 rounded-2xl bg-[#121212] hover:bg-white/10 border border-white/10 text-white text-xs font-bold inline-flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4 text-[#FF5722]" />
              <span>Record First Workout</span>
            </button>
          </div>

        </div>

        {/* Right Column (1 Col): Honest Empty State: Health & Biometrics */}
        <div className="space-y-8">
          
          {/* Honest Empty State: Biometrics */}
          <div className="rounded-3xl bg-[#1E1E1E] p-6 border border-white/10 shadow-xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-[#121212] text-[#FF5722] border border-white/10">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Health & Biometrics</h3>
                <p className="text-[11px] text-white/50">Track weight & hydration entries</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#121212] border border-white/5 text-center space-y-3">
              <p className="text-xs font-bold text-white/80">No health metrics added yet</p>
              <p className="text-[11px] text-white/40">
                Record your real body weight and hydration in the Health Tracker.
              </p>
              <button
                onClick={() => onNavigateToView('health')}
                className="w-full py-2.5 rounded-xl bg-[#FF5722]/15 hover:bg-[#FF5722]/25 border border-[#FF5722]/30 text-[#FF5722] text-xs font-bold transition-colors inline-flex items-center justify-center gap-1.5"
              >
                <span>Open Health Tracker</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* AI Assistant Context Quick Box */}
          <div className="rounded-3xl bg-[#1E1E1E] p-6 border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-[#FF5722]" />
                <h3 className="text-base font-bold text-white">FleetBot Neural Assistant</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FF5722]/20 text-[#FF5722]">
                Personal AI
              </span>
            </div>

            <p className="text-xs text-white/60 leading-relaxed">
              FleetBot uses your stored profile ({goalTitle}) to answer training queries and recommend general exercise form without fabricated metrics.
            </p>

            <button
              onClick={() => onNavigateToView('fleetbot')}
              className="w-full py-3 rounded-2xl bg-[#FF5722] hover:bg-[#E64A19] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#FF5722]/20"
            >
              <span>Ask FleetBot a Question</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
