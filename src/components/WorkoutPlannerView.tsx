import React, { useState } from 'react';
import { WorkoutPlan, Exercise } from '../types';
import { Play, Pause, RotateCcw, Plus, Check, Timer, Dumbbell, ShieldAlert, Sparkles, Volume2, VolumeX, Flame } from 'lucide-react';

interface WorkoutPlannerViewProps {
  currentPlan: WorkoutPlan;
  restTimerSeconds: number;
  totalTimerDuration: number;
  isTimerRunning: boolean;
  onStartTimer: (duration?: number) => void;
  onPauseTimer: () => void;
  onResetTimer: () => void;
  onAddTimerSeconds: (secs: number) => void;
  onToggleExerciseComplete: (exerciseId: string) => void;
  onRestoreOriginalPlan: () => void;
}

export const WorkoutPlannerView: React.FC<WorkoutPlannerViewProps> = ({
  currentPlan,
  restTimerSeconds,
  totalTimerDuration,
  isTimerRunning,
  onStartTimer,
  onPauseTimer,
  onResetTimer,
  onAddTimerSeconds,
  onToggleExerciseComplete,
  onRestoreOriginalPlan,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeExerciseModal, setActiveExerciseModal] = useState<Exercise | null>(null);

  // SVG Circular progress calculation
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const progressPercent = totalTimerDuration > 0 ? restTimerSeconds / totalTimerDuration : 0;
  const strokeDashoffset = circumference - progressPercent * circumference;

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const completedCount = currentPlan.exercises.filter((ex) => ex.isCompleted).length;
  const totalCount = currentPlan.exercises.length;
  const overallProgressPercent = Math.round((completedCount / (totalCount || 1)) * 100);

  return (
    <div className="space-y-8 pb-12">
      
      {/* Top Banner & Plan Switcher */}
      <div className="rounded-3xl bg-[#1E1E1E] p-6 sm:p-8 border border-white/10 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs uppercase font-bold text-white/50 tracking-wider">Active Workout Routine</span>
            {currentPlan.adaptedForInjury && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#FF5722]/20 text-[#FF5722] text-[10px] font-bold flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" />
                FleetBot Knee-Safe Pivot
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{currentPlan.title}</h1>
          <p className="text-xs sm:text-sm text-white/60 mt-1">
            {currentPlan.type} • Est. {currentPlan.durationMinutes} mins • {currentPlan.caloriesBurned} kcal target
          </p>
        </div>

        {/* Completion Bar & Revert Button */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-full sm:w-48 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-white/60">Workout Progress</span>
              <span className="text-[#FFC107]">{overallProgressPercent}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-[#121212] overflow-hidden p-0.5">
              <div
                style={{ width: `${overallProgressPercent}%` }}
                className="h-full bg-gradient-to-r from-[#FF5722] to-[#FFC107] rounded-full transition-all duration-500"
              />
            </div>
          </div>

          {currentPlan.adaptedForInjury && (
            <button
              onClick={onRestoreOriginalPlan}
              className="px-4 py-2.5 rounded-2xl bg-[#121212] hover:bg-white/10 border border-white/10 text-xs font-bold text-[#FFC107] transition-colors whitespace-nowrap"
            >
              Restore Standard Plan
            </button>
          )}
        </div>
      </div>

      {/* Main Layout Grid: Active Rest Timer (Left) + Exercise Cards Grid (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Active Rest Timer Component (Required Feature) */}
        <div className="lg:col-span-1 rounded-3xl bg-[#1E1E1E] p-6 border border-white/10 shadow-2xl flex flex-col items-center justify-between space-y-6">
          <div className="w-full flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <Timer className="w-5 h-5 text-[#FF5722]" />
              <h2 className="text-lg font-bold text-white">Active Rest Timer</h2>
            </div>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl bg-[#121212] text-white/70 hover:text-white transition-colors"
              title={soundEnabled ? 'Mute Rest Alert' : 'Enable Rest Alert'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-[#FF5722]" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

          {/* SVG Circular Progress Indicator */}
          <div className="relative w-48 h-48 flex items-center justify-center my-2">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r={radius}
                className="stroke-[#121212]"
                strokeWidth="12"
                fill="transparent"
              />
              <circle
                cx="96"
                cy="96"
                r={radius}
                className="stroke-[#FF5722] transition-all duration-300"
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Inner Digital Display in #FF5722 */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-extrabold text-[#FF5722] tracking-tighter drop-shadow-[0_0_12px_rgba(255,87,34,0.4)]">
                {formatTimer(restTimerSeconds)}
              </span>
              <span className="text-[10px] uppercase font-bold text-white/50 tracking-widest mt-1">
                {isTimerRunning ? 'Resting...' : restTimerSeconds === 0 ? 'Rest Complete!' : 'Paused'}
              </span>
            </div>
          </div>

          {/* Preset Buttons (+30s, +60s, +90s) */}
          <div className="grid grid-cols-3 gap-2 w-full">
            <button
              onClick={() => onAddTimerSeconds(30)}
              className="py-2.5 rounded-xl bg-[#121212] hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition-colors"
            >
              +30s
            </button>
            <button
              onClick={() => onAddTimerSeconds(60)}
              className="py-2.5 rounded-xl bg-[#121212] hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition-colors"
            >
              +60s
            </button>
            <button
              onClick={() => onAddTimerSeconds(90)}
              className="py-2.5 rounded-xl bg-[#121212] hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition-colors"
            >
              +90s
            </button>
          </div>

          {/* Main Controls (Play/Pause, Reset) */}
          <div className="flex items-center gap-3 w-full">
            {isTimerRunning ? (
              <button
                onClick={onPauseTimer}
                className="flex-1 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <Pause className="w-4 h-4 fill-black" />
                <span>Pause</span>
              </button>
            ) : (
              <button
                onClick={() => onStartTimer()}
                className="flex-1 py-3.5 rounded-2xl bg-[#FF5722] hover:bg-[#E64A19] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#FF5722]/30 transition-all"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Start Rest (90s)</span>
              </button>
            )}

            <button
              onClick={onResetTimer}
              className="p-3.5 rounded-2xl bg-[#121212] hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-colors"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-white/40 text-center">
            Tip: Checking off an exercise set automatically triggers a 90s rest timer.
          </p>
        </div>

        {/* Grid of Exercise Cards inside #1E1E1E Surfaces (Required Feature) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-[#FF5722]" />
              <span>Exercise Breakdown</span>
            </h2>
            <span className="text-xs text-white/50">
              Completed {completedCount} of {totalCount}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentPlan.exercises.map((ex, index) => {
              const isDone = ex.isCompleted;

              return (
                <div
                  key={ex.id}
                  className={`rounded-3xl p-5 border transition-all duration-300 relative flex flex-col justify-between ${
                    isDone
                      ? 'bg-[#1E1E1E]/60 border-emerald-500/40 opacity-80'
                      : 'bg-[#1E1E1E] border-white/10 hover:border-[#FF5722]/40 shadow-xl'
                  }`}
                >
                  {/* Top Badge Info */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-[#121212] text-white/60 font-bold text-xs flex items-center justify-center">
                            {index + 1}
                          </span>
                          <h3 className="text-base font-bold text-white">{ex.name}</h3>
                        </div>
                        <p className="text-xs text-white/50 mt-0.5">{ex.targetMuscle}</p>
                      </div>

                      {ex.isAdapted && (
                        <span className="px-2 py-0.5 rounded-full bg-[#FF5722]/20 border border-[#FF5722]/40 text-[#FF5722] text-[10px] font-bold whitespace-nowrap">
                          ⚡ FleetBot Pivot
                        </span>
                      )}
                    </div>

                    {ex.notes && (
                      <p className="text-[11px] text-[#FFC107] bg-[#FFC107]/10 p-2 rounded-xl mb-3 border border-[#FFC107]/20">
                        <strong>Coach Note:</strong> {ex.notes}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-[#121212] border border-white/5 text-center my-3">
                      <div>
                        <p className="text-[10px] text-white/40 uppercase">Sets</p>
                        <p className="text-sm font-bold text-white">{ex.sets}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-white/40 uppercase">Reps</p>
                        <p className="text-sm font-bold text-white">{ex.reps}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-white/40 uppercase">Weight</p>
                        <p className="text-sm font-bold text-[#FF5722]">{ex.weight}</p>
                      </div>
                    </div>
                  </div>

                  {/* Set Completion Toggle */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                    <button
                      onClick={() => setActiveExerciseModal(ex)}
                      className="text-xs text-white/60 hover:text-white underline font-medium"
                    >
                      View Details
                    </button>

                    <button
                      onClick={() => onToggleExerciseComplete(ex.id)}
                      className={`px-4 py-2 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all ${
                        isDone
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-[#FF5722] hover:bg-[#E64A19] text-white shadow-md shadow-[#FF5722]/30'
                      }`}
                    >
                      {isDone ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>Sets Logged</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>Complete Sets</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Detail Modal for Exercise */}
      {activeExerciseModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#1E1E1E] border border-white/10 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">{activeExerciseModal.name}</h3>
              <button
                onClick={() => setActiveExerciseModal(null)}
                className="text-white/50 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-white/60">Target: {activeExerciseModal.targetMuscle}</p>
            
            <div className="p-4 rounded-2xl bg-[#121212] space-y-2 text-xs">
              <div className="flex justify-between text-white">
                <span>Target Sets x Reps:</span>
                <strong className="text-[#FF5722]">{activeExerciseModal.sets} x {activeExerciseModal.reps}</strong>
              </div>
              <div className="flex justify-between text-white">
                <span>Prescribed Weight:</span>
                <strong className="text-[#FFC107]">{activeExerciseModal.weight}</strong>
              </div>
              {activeExerciseModal.notes && (
                <div className="pt-2 border-t border-white/10 text-amber-300">
                  <span>Note: {activeExerciseModal.notes}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                onToggleExerciseComplete(activeExerciseModal.id);
                setActiveExerciseModal(null);
              }}
              className="w-full py-3 rounded-2xl bg-[#FF5722] text-white font-bold text-xs"
            >
              Toggle Set Completion & Rest
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
