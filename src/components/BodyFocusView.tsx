import React, { useState } from 'react';
import { BodyMuscleGroup, WorkoutPlan, Exercise } from '../types';
import { EXERCISE_DATABASE } from '../data/exercisesData';
import { 
  Target, 
  Dumbbell, 
  Zap, 
  Play, 
  Sparkles, 
  CheckCircle2, 
  Info, 
  Layers,
  ChevronRight
} from 'lucide-react';

interface BodyFocusViewProps {
  onSelectPlan: (plan: WorkoutPlan) => void;
  onStartSession: (plan: WorkoutPlan) => void;
  showToast: (msg: string) => void;
}

export const BodyFocusView: React.FC<BodyFocusViewProps> = ({
  onSelectPlan,
  onStartSession,
  showToast
}) => {
  const [activeMuscle, setActiveMuscle] = useState<BodyMuscleGroup>('Chest');

  const muscleGroups: { name: BodyMuscleGroup; icon: string; count: number }[] = [
    { name: 'Chest', icon: '🏋️‍♂️', count: 3 },
    { name: 'Back', icon: '🧘‍♂️', count: 2 },
    { name: 'Shoulders', icon: '🙆‍♂️', count: 2 },
    { name: 'Biceps', icon: '💪', count: 1 },
    { name: 'Triceps', icon: '⚡', count: 1 },
    { name: 'Quads', icon: '🦵', count: 1 },
    { name: 'Hamstrings', icon: '🏃‍♂️', count: 1 },
    { name: 'Abs', icon: '🔥', count: 2 },
  ];

  const matchedExercises = EXERCISE_DATABASE.filter(
    (ex) => ex.category === activeMuscle || ex.targetMuscle.toLowerCase().includes(activeMuscle.toLowerCase())
  );

  const handleGenerateTargetedWorkout = () => {
    if (matchedExercises.length === 0) {
      showToast('No exercises available for this muscle group right now.');
      return;
    }

    const generatedPlan: WorkoutPlan = {
      id: `plan-bodyfocus-${activeMuscle.toLowerCase()}-${Date.now()}`,
      title: `${activeMuscle} Hypertrophy Isolation`,
      type: 'Body Focus',
      difficulty: 'Intermediate',
      durationMinutes: matchedExercises.length * 12,
      caloriesBurned: matchedExercises.length * 80,
      description: `Targeted high-intensity workout focusing specifically on building and sculpting your ${activeMuscle}.`,
      exercises: matchedExercises.map((ex, i) => ({
        id: `bf-ex-${i}`,
        name: ex.name,
        targetMuscle: ex.targetMuscle,
        sets: ex.sets || 3,
        reps: ex.reps || '10-12',
        weight: ex.weight || 'Moderate',
      }))
    };

    onSelectPlan(generatedPlan);
    showToast(`Created & Activated ${activeMuscle} Workout!`);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-amber-950/30 border border-zinc-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
            <Target className="w-3.5 h-3.5" />
            Anatomical Muscle Isolation
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Body Focus & Muscle Targeter
          </h1>
          <p className="text-sm text-zinc-400 max-w-2xl">
            Select a specific muscle group to view isolated exercises, anatomical technique guides, and instantly generate targeted workouts.
          </p>
        </div>

        <button
          onClick={handleGenerateTargetedWorkout}
          className="px-5 py-3 bg-[#FF5722] hover:bg-[#FF5722]/90 text-white font-bold text-xs rounded-xl shadow-lg shadow-[#FF5722]/30 flex items-center gap-2 transition-all cursor-pointer shrink-0"
        >
          <Zap className="w-4 h-4 fill-white" />
          Generate {activeMuscle} Routine
        </button>
      </div>

      {/* Muscle Grid Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {muscleGroups.map((mg) => {
          const isActive = activeMuscle === mg.name;
          return (
            <button
              key={mg.name}
              onClick={() => setActiveMuscle(mg.name)}
              className={`p-4 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                isActive
                  ? 'bg-zinc-800 border-[#FF5722] text-white shadow-lg shadow-[#FF5722]/20 scale-[1.02]'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80'
              }`}
            >
              <span className="text-2xl">{mg.icon}</span>
              <div>
                <p className="text-xs font-bold block">{mg.name}</p>
                <p className="text-[10px] text-zinc-500">{mg.count} Exercises</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Muscle Exercises Breakdown */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-[#FF5722]" />
              {activeMuscle} Targeted Exercises
            </h2>
            <p className="text-xs text-zinc-400">
              Showing {matchedExercises.length} isolation & compound lifts for {activeMuscle}
            </p>
          </div>

          <span className="px-3 py-1 rounded-full bg-zinc-950 text-amber-400 border border-amber-500/30 text-xs font-mono font-bold">
            {activeMuscle} Focus
          </span>
        </div>

        {matchedExercises.length === 0 ? (
          <div className="p-8 text-center bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
            <Info className="w-8 h-8 text-zinc-500 mx-auto" />
            <p className="text-sm font-semibold text-zinc-300">More exercises coming soon for this category.</p>
            <p className="text-xs text-zinc-500">Explore Chest, Back, Shoulders, or Abs for full exercise breakdowns.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matchedExercises.map((ex) => (
              <div
                key={ex.id}
                className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-xl p-5 space-y-4 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                      {ex.difficulty} • {ex.equipment}
                    </span>
                    <h3 className="text-base font-bold text-white">{ex.name}</h3>
                  </div>

                  <span className="px-2.5 py-1 rounded-md bg-zinc-900 text-zinc-300 font-mono text-xs border border-zinc-800">
                    {ex.sets} sets × {ex.reps}
                  </span>
                </div>

                {ex.instructions && (
                  <div className="space-y-1.5 pt-2 border-t border-zinc-800/60 text-xs text-zinc-400">
                    <span className="font-semibold text-zinc-300 block">Instructions:</span>
                    <ul className="list-disc list-inside space-y-1 pl-1">
                      {ex.instructions.slice(0, 2).map((ins, i) => (
                        <li key={i}>{ins}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {ex.tips && (
                  <div className="p-3 bg-zinc-900/80 border border-zinc-800/80 rounded-lg text-[11px] text-amber-300/90 flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>Pro Tip:</strong> {ex.tips}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
