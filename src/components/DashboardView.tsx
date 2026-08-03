import React from 'react';
import { WorkoutPlan, WeightDataPoint, MemoryContext, DailyMetrics, ViewType } from '../types';
import { Flame, Play, ShieldAlert, Bot, TrendingDown, ArrowRight, Zap, Scale, Heart, Sparkles, CheckCircle2 } from 'lucide-react';

interface DashboardViewProps {
  streakDays: number;
  currentWorkoutPlan: WorkoutPlan;
  weightHistory: WeightDataPoint[];
  memoryContext: MemoryContext;
  dailyMetrics: DailyMetrics;
  onStartWorkout: () => void;
  onNavigateToView: (view: ViewType) => void;
  onRestoreOriginalWorkout: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  streakDays,
  currentWorkoutPlan,
  weightHistory,
  memoryContext,
  dailyMetrics,
  onStartWorkout,
  onNavigateToView,
  onRestoreOriginalWorkout,
}) => {
  // Calculate max weight for graph relative sizing
  const maxWeight = Math.max(...weightHistory.map((d) => d.weightKg), 82);
  const minWeight = Math.min(...weightHistory.map((d) => d.weightKg), 77);
  const weightDiff = (weightHistory[0]?.weightKg || 81.2) - (weightHistory[weightHistory.length - 1]?.weightKg || 79.3);

  return (
    <div className="space-[#FF5722] space-y-8 animate-fadeIn pb-12">
      {/* Welcoming Header with Streak Highlight */}
      <div className="relative overflow-hidden rounded-3xl bg-[#1E1E1E] p-6 sm:p-8 border border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#FF5722]/15 via-[#FFC107]/5 to-transparent rounded-full blur-3xl -z-0 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFC107]/15 border border-[#FFC107]/30 text-[#FFC107] text-xs font-bold">
              <Flame className="w-4 h-4 fill-[#FFC107]" />
              <span>{streakDays}-DAY ACTIVE STREAK</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70">Alex</span>
            </h1>
            <p className="text-sm text-white/60 max-w-xl">
              Your neural coach FleetBot has analyzed your biometrics. System readiness is optimal at <strong className="text-emerald-400">88%</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateToView('fleetbot')}
              className="px-5 py-3 rounded-2xl bg-[#121212] border border-white/10 hover:border-[#FF5722] text-white text-sm font-semibold flex items-center gap-2 transition-all duration-300 hover:shadow-lg hover:shadow-[#FF5722]/10"
            >
              <Bot className="w-4 h-4 text-[#FF5722]" />
              <span>Consult FleetBot</span>
            </button>
            <button
              onClick={onStartWorkout}
              className="px-6 py-3 rounded-2xl bg-[#FF5722] hover:bg-[#E64A19] text-white text-sm font-bold flex items-center gap-2 transition-all duration-300 shadow-xl shadow-[#FF5722]/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Workout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2 Cols): Today's Plan & FleetBot AI Adaptation Notice */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* "Today's Plan" Card */}
          <div className="rounded-3xl bg-[#1E1E1E] p-6 sm:p-8 border border-white/10 shadow-xl relative overflow-hidden group">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div>
                <span className="text-xs uppercase font-bold text-white/50 tracking-wider">
                  Today's Plan
                </span>
                <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  {currentWorkoutPlan.title}
                </h2>
              </div>

              {currentWorkoutPlan.adaptedForInjury ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FF5722]/15 border border-[#FF5722]/50 text-[#FF5722] text-xs font-bold animate-pulse">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Knee-Safe Adaptive Plan</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Standard Hypertrophy</span>
                </div>
              )}
            </div>

            {/* AI Adaptation Alert Banner inside card if adapted */}
            {currentWorkoutPlan.adaptedForInjury && (
              <div className="mb-6 p-4 rounded-2xl bg-[#121212] border border-[#FF5722]/30 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-[#FF5722]/20 text-[#FF5722] shrink-0 mt-0.5">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="text-xs space-y-1">
                  <p className="font-bold text-[#FF5722]">
                    FleetBot AI Adaptation Active
                  </p>
                  <p className="text-white/70">
                    Recalculated routine due to recorded <strong className="text-amber-300">Left Knee Pain</strong>.
                    Barbell Squats removed and replaced with low-impact seated rows and core stabilization.
                  </p>
                  <button
                    onClick={onRestoreOriginalWorkout}
                    className="mt-1 text-[11px] font-semibold text-[#FFC107] hover:underline"
                  >
                    Revert to original Pull Day plan
                  </button>
                </div>
              </div>
            )}

            {/* Exercise List Preview */}
            <div className="space-y-3 mb-8">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                Prescribed Exercises ({currentWorkoutPlan.exercises.length})
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentWorkoutPlan.exercises.map((ex, idx) => (
                  <div
                    key={ex.id}
                    className="p-3.5 rounded-2xl bg-[#121212] border border-white/5 flex items-center justify-between hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-xl bg-white/5 text-white/70 font-bold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-white flex items-center gap-1.5">
                          {ex.name}
                          {ex.isAdapted && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#FF5722]/20 text-[#FF5722] font-semibold">
                              New
                            </span>
                          )}
                        </p>
                        <p className="text-[11px] text-white/50">{ex.targetMuscle}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-[#FFC107]">{ex.sets} sets</p>
                      <p className="text-[10px] text-white/50">{ex.reps} reps</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Button in #FF5722 */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10 flex-wrap gap-4">
              <div className="flex items-center gap-4 text-xs text-white/60">
                <span>⏱️ Est. <strong>{currentWorkoutPlan.durationMinutes} mins</strong></span>
                <span>🔥 Est. <strong>{currentWorkoutPlan.caloriesBurned} kcal</strong></span>
              </div>

              <button
                onClick={onStartWorkout}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#FF5722] hover:bg-[#E64A19] text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-xl shadow-[#FF5722]/40 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Start Workout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Metrics Cards Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-[#1E1E1E] border border-white/10 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-[#FF5722]/15 text-[#FF5722] flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <p className="text-xs text-white/50">Target Calories</p>
              <p className="text-xl font-bold text-white">{dailyMetrics.calorieTarget} <span className="text-xs text-white/50 font-normal">kcal</span></p>
            </div>

            <div className="p-5 rounded-3xl bg-[#1E1E1E] border border-white/10 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-[#FFC107]/15 text-[#FFC107] flex items-center justify-center">
                <Heart className="w-4 h-4" />
              </div>
              <p className="text-xs text-white/50">Recovery Score</p>
              <p className="text-xl font-bold text-[#FFC107]">{dailyMetrics.recoveryScore}% <span className="text-xs text-emerald-400 font-normal">Peak</span></p>
            </div>

            <div className="p-5 rounded-3xl bg-[#1E1E1E] border border-white/10 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
                <Scale className="w-4 h-4" />
              </div>
              <p className="text-xs text-white/50">Current Weight</p>
              <p className="text-xl font-bold text-white">{dailyMetrics.weight} <span className="text-xs text-white/50 font-normal">kg</span></p>
            </div>

            <div className="p-5 rounded-3xl bg-[#1E1E1E] border border-white/10 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <p className="text-xs text-white/50">HRV Score</p>
              <p className="text-xl font-bold text-white">{dailyMetrics.hrvMs} <span className="text-xs text-white/50 font-normal">ms</span></p>
            </div>
          </div>

        </div>

        {/* Right Column (1 Col): 7-Day Health Tracking Graph (Weight Progression) */}
        <div className="space-y-8">
          
          {/* 7-Day Weight Progression Card */}
          <div className="rounded-3xl bg-[#1E1E1E] p-6 border border-white/10 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase font-bold text-white/50 tracking-wider">
                  Biometric Trend
                </p>
                <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  7-Day Weight Progression
                </h3>
              </div>
              <div className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>-{weightDiff.toFixed(1)} kg</span>
              </div>
            </div>

            {/* Custom Responsive Bar Graph */}
            <div className="space-y-3">
              <div className="h-44 pt-6 pb-2 flex items-end justify-between gap-2 px-1">
                {weightHistory.map((item, index) => {
                  // Calculate height ratio
                  const normalizedHeight = Math.max(
                    20,
                    Math.min(100, ((item.weightKg - minWeight + 0.5) / (maxWeight - minWeight + 0.5)) * 100)
                  );

                  const isToday = index === weightHistory.length - 1;

                  return (
                    <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group relative">
                      {/* Hover Tooltip */}
                      <div className="absolute -top-9 opacity-0 group-hover:opacity-100 transition-opacity bg-[#121212] border border-white/20 text-white text-[11px] font-bold px-2 py-1 rounded-lg pointer-events-none z-20 whitespace-nowrap shadow-lg">
                        {item.weightKg} kg
                      </div>

                      {/* Bar */}
                      <div className="w-full max-w-[28px] bg-[#121212] rounded-t-xl h-full flex items-end overflow-hidden p-0.5">
                        <div
                          style={{ height: `${normalizedHeight}%` }}
                          className={`w-full rounded-t-lg transition-all duration-500 ${
                            isToday
                              ? 'bg-gradient-to-t from-[#FF5722] to-[#FF8A65] shadow-lg shadow-[#FF5722]/50'
                              : 'bg-white/20 group-hover:bg-[#FFC107]/80'
                          }`}
                        />
                      </div>

                      {/* Day Label */}
                      <span
                        className={`text-[11px] font-semibold ${
                          isToday ? 'text-[#FF5722] font-bold' : 'text-white/50'
                        }`}
                      >
                        {item.day}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Target Indicator */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/60">
                <span>Start: <strong className="text-white">81.2 kg</strong></span>
                <span>Current: <strong className="text-[#FF5722]">79.3 kg</strong></span>
                <span>Goal: <strong className="text-[#FFC107]">78.0 kg</strong></span>
              </div>
            </div>

            <button
              onClick={() => onNavigateToView('health')}
              className="w-full py-3 rounded-2xl bg-[#121212] hover:bg-white/5 border border-white/10 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <span>Open Detailed Health Tracker</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Active Memory Engine Overview Box */}
          <div className="rounded-3xl bg-[#1E1E1E] p-6 border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-[#FF5722]" />
                <h3 className="text-base font-bold text-white">Active Memory Engine</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FF5722]/20 text-[#FF5722]">
                Neural AI
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-[#121212] border border-white/5 flex items-center justify-between">
                <span className="text-white/60">Goal Target</span>
                <span className="font-bold text-white">{memoryContext.goal}</span>
              </div>

              <div className="p-3 rounded-2xl bg-[#121212] border border-[#FF5722]/30 flex items-center justify-between">
                <span className="text-white/60">Active Adaptation</span>
                <span className="font-bold text-[#FF5722]">{memoryContext.injury}</span>
              </div>

              <div className="p-3 rounded-2xl bg-[#121212] border border-white/5 flex items-center justify-between">
                <span className="text-white/60">Excluded Moves</span>
                <span className="font-bold text-[#FFC107]">{memoryContext.hates}</span>
              </div>
            </div>

            <button
              onClick={() => onNavigateToView('fleetbot')}
              className="w-full py-2.5 rounded-2xl bg-[#FF5722]/15 hover:bg-[#FF5722]/20 border border-[#FF5722]/30 text-[#FF5722] text-xs font-bold transition-colors"
            >
              Manage FleetBot Memory Context
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
